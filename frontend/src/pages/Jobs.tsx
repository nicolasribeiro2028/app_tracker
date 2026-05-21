import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import type { Job, Company } from "../api";
import CompanyLogo from "../components/CompanyLogo";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";

const STATUSES = ["Wishlist", "Applied", "Closed"] as const;

function JobForm({
  initial,
  companies,
  onSave,
  onClose,
}: {
  initial?: Partial<Job>;
  companies: Company[];
  onSave: (data: Partial<Job>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Job>>(initial ?? { status: "Wishlist" });
  const set = (k: keyof Job) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Company *</label>
        <select required value={form.company_id ?? ""} onChange={set("company_id")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
          <option value="">Select a company</option>
          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Job title *</label>
        <input required value={form.title ?? ""} onChange={set("title")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Job posting URL</label>
        <input type="url" value={form.url ?? ""} onChange={set("url")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select value={form.status ?? "Wishlist"} onChange={set("status")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Deadline</label>
          <input type="date" value={form.deadline ?? ""} onChange={set("deadline")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Applied date</label>
        <input type="date" value={form.applied_date ?? ""} onChange={set("applied_date")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
        <textarea rows={3} value={form.notes ?? ""} onChange={set("notes")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700">Save</button>
      </div>
    </form>
  );
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [modal, setModal] = useState<"add" | { edit: Job } | null>(null as "add" | { edit: Job } | null);
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") ?? "";

  const load = () => {
    const params = statusFilter ? `?status=${statusFilter}` : "";
    api.get(`/jobs${params}`).then((r) => setJobs(r.data));
  };
  useEffect(() => { load(); }, [statusFilter]);
  useEffect(() => { api.get("/companies").then((r) => setCompanies(r.data)); }, []);

  const save = async (data: Partial<Job>) => {
    if (modal === "add") await api.post("/jobs", data);
    else if (modal !== null && typeof modal !== "string") await api.put(`/jobs/${modal.edit.id}`, data);
    setModal(null);
    load();
  };

  const cycleStatus = async (job: Job) => {
    const next = { Wishlist: "Applied", Applied: "Closed", Closed: "Wishlist" } as const;
    await api.put(`/jobs/${job.id}`, { ...job, status: next[job.status] });
    load();
  };

  const del = async (id: number) => {
    if (!confirm("Delete this job?")) return;
    await api.delete(`/jobs/${id}`);
    load();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <button onClick={() => setModal("add")} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700">+ Add job</button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {["", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setSearchParams(s ? { status: s } : {})}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"}`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {jobs.length === 0 ? (
        <p className="text-sm text-gray-400">No jobs found.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-medium">Role</th>
                <th className="text-left px-5 py-3 font-medium">Company</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Deadline</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-900">{j.title}</div>
                    {j.url && <a href={j.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">View posting →</a>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <CompanyLogo name={j.company_name ?? ""} logo_url={j.company_logo_url} size={22} />
                      <span className="text-gray-600">{j.company_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => cycleStatus(j)} title="Click to advance status">
                      <StatusBadge label={j.status} />
                    </button>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{j.deadline ?? "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setModal({ edit: j })} className="text-gray-400 hover:text-gray-600 mr-3 text-xs">Edit</button>
                    <button onClick={() => del(j.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal === "add" && (
        <Modal title="Add job" onClose={() => setModal(null)}>
          <JobForm companies={companies} onSave={save} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal !== null && typeof modal !== "string" && (
        <Modal title="Edit job" onClose={() => setModal(null)}>
          <JobForm initial={modal.edit} companies={companies} onSave={save} onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}
