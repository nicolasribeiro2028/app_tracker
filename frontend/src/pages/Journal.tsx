import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import api from "../api";
import type { JournalEntry } from "../api";
import Modal from "../components/Modal";

function EntryForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: Partial<JournalEntry>;
  onSave: (d: Partial<JournalEntry>) => void;
  onClose: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<Partial<JournalEntry>>(initial ?? { date: today });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
        <input required type="date" value={form.date ?? today} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Entry <span className="text-gray-400">(markdown supported)</span></label>
        <textarea required rows={10} value={form.body ?? ""} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none font-mono" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700">Save</button>
      </div>
    </form>
  );
}

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [modal, setModal] = useState<"add" | { edit: JournalEntry } | null>(null as "add" | { edit: JournalEntry } | null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = () => api.get("/journal").then((r) => setEntries(r.data));
  useEffect(() => { load(); }, []);

  const save = async (data: Partial<JournalEntry>) => {
    if (modal === "add") await api.post("/journal", data);
    else if (modal !== null && typeof modal !== "string") await api.put(`/journal/${modal.edit.id}`, data);
    setModal(null);
    load();
  };

  const del = async (id: number) => {
    if (!confirm("Delete this entry?")) return;
    await api.delete(`/journal/${id}`);
    load();
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Journal</h1>
        <button onClick={() => setModal("add")} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700">+ New entry</button>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-400">No entries yet. Start writing to track your thoughts.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((e) => (
            <div key={e.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button
                className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50/50"
                onClick={() => setExpanded(expanded === e.id ? null : e.id)}
              >
                <div className="font-medium text-gray-900 text-sm">{e.date}</div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 max-w-xs truncate hidden sm:block">
                    {e.body.slice(0, 60)}{e.body.length > 60 ? "…" : ""}
                  </span>
                  <span className="text-gray-400 text-xs">{expanded === e.id ? "▲" : "▼"}</span>
                </div>
              </button>

              {expanded === e.id && (
                <div className="border-t border-gray-50 px-5 py-4 bg-gray-50/30">
                  <div className="prose prose-sm max-w-none text-gray-700">
                    <ReactMarkdown>{e.body}</ReactMarkdown>
                  </div>
                  <div className="flex gap-2 pt-3 mt-3 border-t border-gray-100">
                    <button onClick={() => setModal({ edit: e })} className="text-xs text-gray-500 hover:text-gray-800">Edit</button>
                    <button onClick={() => del(e.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal === "add" && (
        <Modal title="New journal entry" onClose={() => setModal(null)}>
          <EntryForm onSave={save} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal !== null && typeof modal !== "string" && (
        <Modal title="Edit entry" onClose={() => setModal(null)}>
          <EntryForm initial={modal.edit} onSave={save} onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}
