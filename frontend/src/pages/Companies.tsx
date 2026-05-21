import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import type { Company } from "../api";
import CompanyLogo from "../components/CompanyLogo";
import Modal from "../components/Modal";

const SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

function CompanyForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: Partial<Company>;
  onSave: (data: Partial<Company>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Company>>(initial ?? {});
  const set = (k: keyof Company) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Company name *</label>
        <input required value={form.name ?? ""} onChange={set("name")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Industry</label>
          <input value={form.industry ?? ""} onChange={set("industry")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
          <select value={form.size ?? ""} onChange={set("size")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
            <option value="">—</option>
            {SIZES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Domain <span className="text-gray-400">(e.g. stripe.com — auto-fetches logo)</span></label>
        <input value={form.domain ?? ""} onChange={set("domain")} placeholder="stripe.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Website</label>
        <input value={form.website ?? ""} onChange={set("website")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
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

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [modal, setModal] = useState<"add" | { edit: Company } | null>(null);

  const load = () => api.get("/companies").then((r) => setCompanies(r.data));
  useEffect(() => { load(); }, []);

  const save = async (data: Partial<Company>) => {
    if (modal === "add") {
      await api.post("/companies", data);
    } else if (modal !== null && typeof modal !== "string") {
      await api.put(`/companies/${modal.edit.id}`, data);
    }
    setModal(null);
    load();
  };

  const del = async (id: number) => {
    if (!confirm("Delete this company? Its linked jobs and contacts will also be removed.")) return;
    await api.delete(`/companies/${id}`);
    load();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
        <button onClick={() => setModal("add")} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700">+ Add company</button>
      </div>

      {companies.length === 0 ? (
        <p className="text-sm text-gray-400">No companies yet. Add one to get started.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-medium">Company</th>
                <th className="text-left px-5 py-3 font-medium">Industry</th>
                <th className="text-left px-5 py-3 font-medium">Size</th>
                <th className="text-center px-5 py-3 font-medium">Jobs</th>
                <th className="text-center px-5 py-3 font-medium">Contacts</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <CompanyLogo name={c.name} logo_url={c.logo_url} size={28} />
                      <div>
                        <Link to={`/companies/${c.id}`} className="font-medium text-gray-900 hover:underline">{c.name}</Link>
                        {c.website && <div className="text-xs text-gray-400 truncate max-w-[180px]">{c.website}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{c.industry ?? "—"}</td>
                  <td className="px-5 py-3 text-gray-600">{c.size ?? "—"}</td>
                  <td className="px-5 py-3 text-center text-gray-600">{c.job_count}</td>
                  <td className="px-5 py-3 text-center text-gray-600">{c.contact_count}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setModal({ edit: c })} className="text-gray-400 hover:text-gray-600 mr-3 text-xs">Edit</button>
                    <button onClick={() => del(c.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal === "add" && (
        <Modal title="Add company" onClose={() => setModal(null)}>
          <CompanyForm onSave={save} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal !== null && typeof modal !== "string" && (
        <Modal title="Edit company" onClose={() => setModal(null)}>
          <CompanyForm initial={modal.edit} onSave={save} onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}
