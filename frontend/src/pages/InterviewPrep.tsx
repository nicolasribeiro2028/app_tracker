import { useEffect, useState } from "react";
import api from "../api";
import type { Question, Company } from "../api";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";

const CATEGORIES = ["Behavioral", "Technical", "Case", "Other"] as const;

function QuestionForm({
  initial,
  companies,
  onSave,
  onClose,
}: {
  initial?: Partial<Question>;
  companies: Company[];
  onSave: (d: Partial<Question>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Question>>(initial ?? { category: "Behavioral" });
  const set = (k: keyof Question) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Question *</label>
        <textarea required rows={2} value={form.question ?? ""} onChange={set("question")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
          <select value={form.category ?? "Behavioral"} onChange={set("category")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Company (optional)</label>
          <select value={form.company_id ?? ""} onChange={set("company_id")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
            <option value="">General</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">My answer</label>
        <textarea rows={4} value={form.my_answer ?? ""} onChange={set("my_answer")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
        <textarea rows={2} value={form.notes ?? ""} onChange={set("notes")} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700">Save</button>
      </div>
    </form>
  );
}

export default function InterviewPrep() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [modal, setModal] = useState<"add" | { edit: Question } | null>(null as "add" | { edit: Question } | null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [catFilter, setCatFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");

  const load = () => {
    const params = new URLSearchParams();
    if (catFilter) params.set("category", catFilter);
    if (companyFilter) params.set("company_id", companyFilter);
    api.get(`/questions?${params}`).then((r) => setQuestions(r.data));
  };
  useEffect(() => { load(); }, [catFilter, companyFilter]);
  useEffect(() => { api.get("/companies").then((r) => setCompanies(r.data)); }, []);

  const save = async (data: Partial<Question>) => {
    if (modal === "add") await api.post("/questions", data);
    else if (modal !== null && typeof modal !== "string") await api.put(`/questions/${modal.edit.id}`, data);
    setModal(null);
    load();
  };

  const del = async (id: number) => {
    if (!confirm("Delete this question?")) return;
    await api.delete(`/questions/${id}`);
    load();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Interview Prep</h1>
        <button onClick={() => setModal("add")} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700">+ Add question</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="flex gap-1">
          {["", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${catFilter === c ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"}`}
            >
              {c || "All"}
            </button>
          ))}
        </div>
        <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 focus:outline-none">
          <option value="">All companies</option>
          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {questions.length === 0 ? (
        <p className="text-sm text-gray-400">No questions yet. Add some to start practicing.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {questions.map((q) => (
            <div key={q.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button
                className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-gray-50/50"
                onClick={() => setExpanded(expanded === q.id ? null : q.id)}
              >
                <StatusBadge label={q.category} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{q.question}</div>
                  {q.company_name && <div className="text-xs text-gray-400 mt-0.5">{q.company_name}</div>}
                </div>
                <span className="text-gray-400 text-xs shrink-0 mt-0.5">{expanded === q.id ? "▲" : "▼"}</span>
              </button>

              {expanded === q.id && (
                <div className="border-t border-gray-50 px-5 py-4 bg-gray-50/30">
                  {q.my_answer ? (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">My answer</div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">{q.my_answer}</div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic mb-3">No answer recorded yet.</p>
                  )}
                  {q.notes && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Notes</div>
                      <div className="text-sm text-gray-600">{q.notes}</div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setModal({ edit: q })} className="text-xs text-gray-500 hover:text-gray-800">Edit</button>
                    <button onClick={() => del(q.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal === "add" && (
        <Modal title="Add question" onClose={() => setModal(null)}>
          <QuestionForm companies={companies} onSave={save} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal !== null && typeof modal !== "string" && (
        <Modal title="Edit question" onClose={() => setModal(null)}>
          <QuestionForm initial={modal.edit} companies={companies} onSave={save} onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}
