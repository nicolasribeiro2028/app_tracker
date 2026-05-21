import { useEffect, useState } from "react";
import api from "../api";
import type { Contact, Company } from "../api";
import CompanyLogo from "../components/CompanyLogo";
import FollowUpDate from "../components/FollowUpDate";
import Modal from "../components/Modal";

function ContactForm({
  initial,
  companies,
  onSave,
  onClose,
}: {
  initial?: Partial<Contact>;
  companies: Company[];
  onSave: (d: Partial<Contact>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Contact>>(initial ?? {});
  const set = (k: keyof Contact) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
        <input required value={form.name ?? ""} onChange={set("name")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
          <input value={form.role ?? ""} onChange={set("role")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
          <select value={form.company_id ?? ""} onChange={set("company_id")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
            <option value="">None</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
        <input type="email" value={form.email ?? ""} onChange={set("email")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">LinkedIn URL</label>
        <input type="url" value={form.linkedin_url ?? ""} onChange={set("linkedin_url")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Reached out</label>
          <input type="date" value={form.reached_out_on ?? ""} onChange={set("reached_out_on")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Follow-up date</label>
          <input type="date" value={form.follow_up_date ?? ""} onChange={set("follow_up_date")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
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

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [modal, setModal] = useState<"add" | { edit: Contact } | null>(null as "add" | { edit: Contact } | null);

  const load = () => api.get("/contacts").then((r) => setContacts(r.data));
  useEffect(() => { load(); }, []);
  useEffect(() => { api.get("/companies").then((r) => setCompanies(r.data)); }, []);

  const save = async (data: Partial<Contact>) => {
    if (modal === "add") await api.post("/contacts", data);
    else if (modal !== null && typeof modal !== "string") await api.put(`/contacts/${modal.edit.id}`, data);
    setModal(null);
    load();
  };

  const del = async (id: number) => {
    if (!confirm("Delete this contact?")) return;
    await api.delete(`/contacts/${id}`);
    load();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Networking</h1>
        <button onClick={() => setModal("add")} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700">+ Add contact</button>
      </div>

      {contacts.length === 0 ? (
        <p className="text-sm text-gray-400">No contacts yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-medium">Name</th>
                <th className="text-left px-5 py-3 font-medium">Company</th>
                <th className="text-left px-5 py-3 font-medium">Reached out</th>
                <th className="text-left px-5 py-3 font-medium">Follow-up</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-900">{c.name}</div>
                    <div className="text-xs text-gray-400">{c.role}</div>
                  </td>
                  <td className="px-5 py-3">
                    {c.company_name ? (
                      <div className="flex items-center gap-2">
                        <CompanyLogo name={c.company_name} logo_url={c.company_logo_url} size={22} />
                        <span className="text-gray-600">{c.company_name}</span>
                      </div>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{c.reached_out_on ?? "—"}</td>
                  <td className="px-5 py-3"><FollowUpDate date={c.follow_up_date} /></td>
                  <td className="px-5 py-3 text-right">
                    {c.linkedin_url && <a href={c.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-600 text-xs mr-3">LinkedIn</a>}
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
        <Modal title="Add contact" onClose={() => setModal(null)}>
          <ContactForm companies={companies} onSave={save} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal !== null && typeof modal !== "string" && (
        <Modal title="Edit contact" onClose={() => setModal(null)}>
          <ContactForm initial={modal.edit} companies={companies} onSave={save} onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}
