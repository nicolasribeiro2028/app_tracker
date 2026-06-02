import { useEffect, useState, useCallback } from "react";
import api from "../api";
import type { Contact, Company, ChatSession } from "../api";
import CompanyLogo from "../components/CompanyLogo";
import StarRating from "../components/StarRating";
import Modal from "../components/Modal";

// ── Contact Form ──────────────────────────────────────────────────────────────

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
  const set = (k: keyof Contact) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
        <input required value={form.name ?? ""} onChange={set("name")}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
          <input value={form.role ?? ""} onChange={set("role")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
          <select value={form.company_id ?? ""} onChange={set("company_id")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
            <option value="">None</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">LinkedIn URL</label>
        <input type="url" value={form.linkedin_url ?? ""} onChange={set("linkedin_url")}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Reached out</label>
          <input type="date" value={form.reached_out_on ?? ""} onChange={set("reached_out_on")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Follow-up date</label>
          <input type="date" value={form.follow_up_date ?? ""} onChange={set("follow_up_date")}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Vibe / energy</label>
        <StarRating value={form.star_rating} onChange={(v) => setForm((f) => ({ ...f, star_rating: v }))} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
        <textarea rows={2} value={form.notes ?? ""} onChange={set("notes")}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700">Save</button>
      </div>
    </form>
  );
}

// ── Session Log Form ──────────────────────────────────────────────────────────

function SessionForm({
  contacts,
  initial,
  onSave,
  onClose,
}: {
  contacts: Contact[];
  initial?: Partial<ChatSession> & { contact_id?: number };
  onSave: (d: { contact_id: number; date: string; summary: string; raw_notes: string; learnings: string[] }) => void;
  onClose: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [contactId, setContactId] = useState<number>(initial?.contact_id ?? 0);
  const [date, setDate] = useState(initial?.date ?? today);
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [rawNotes, setRawNotes] = useState(initial?.raw_notes ?? "");
  const [learnings, setLearnings] = useState<string[]>(
    initial?.learnings?.map((l) => l.bullet) ?? [""]
  );
  const [extracting, setExtracting] = useState(false);
  const [aiError, setAiError] = useState("");

  const extractLearnings = async () => {
    if (!rawNotes.trim()) return;
    setExtracting(true);
    setAiError("");
    try {
      const res = await api.post("/ai/extract-learnings", { raw_notes: rawNotes });
      setLearnings(res.data.learnings);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setAiError(msg ?? "AI extraction failed. Make sure ANTHROPIC_API_KEY is set.");
    } finally {
      setExtracting(false);
    }
  };

  const updateLearning = (i: number, val: string) =>
    setLearnings((prev) => prev.map((l, idx) => (idx === i ? val : l)));

  const removeLearning = (i: number) =>
    setLearnings((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          contact_id: contactId,
          date,
          summary,
          raw_notes: rawNotes,
          learnings: learnings.filter((l) => l.trim()),
        });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Person *</label>
          <select
            required
            value={contactId || ""}
            onChange={(e) => setContactId(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">Select contact</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.company_name ? ` · ${c.company_name}` : ""}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
          <input required type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">One-line summary</label>
        <input value={summary} onChange={(e) => setSummary(e.target.value)}
          placeholder="e.g. Coffee chat about PM roles at early-stage startups"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-gray-700">Raw notes</label>
          <button
            type="button"
            onClick={extractLearnings}
            disabled={extracting || !rawNotes.trim()}
            className="flex items-center gap-1.5 px-3 py-1 text-xs bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {extracting ? (
              <span className="animate-spin">⟳</span>
            ) : (
              <span>✦</span>
            )}
            {extracting ? "Extracting…" : "AI Extract learnings"}
          </button>
        </div>
        <textarea
          rows={5}
          value={rawNotes}
          onChange={(e) => setRawNotes(e.target.value)}
          placeholder="Paste your messy notes here — anything from bullet points to stream of consciousness…"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none font-mono"
        />
        {aiError && <p className="text-xs text-red-500 mt-1">{aiError}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-gray-700">Key learnings</label>
          <button
            type="button"
            onClick={() => setLearnings((prev) => [...prev, ""])}
            className="text-xs text-violet-600 hover:text-violet-800"
          >
            + Add bullet
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {learnings.map((l, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-violet-400 mt-2 text-sm shrink-0">•</span>
              <input
                value={l}
                onChange={(e) => updateLearning(i, e.target.value)}
                placeholder="What did you learn?"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              <button
                type="button"
                onClick={() => removeLearning(i)}
                className="text-gray-300 hover:text-red-400 mt-2 text-sm"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700">Log session</button>
      </div>
    </form>
  );
}

// ── Contact Card ──────────────────────────────────────────────────────────────

function ContactCard({
  contact,
  onEdit,
  onDelete,
  onLogSession,
  onViewProfile,
}: {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
  onLogSession: () => void;
  onViewProfile: () => void;
}) {
  const daysSince = contact.last_chat
    ? Math.floor((Date.now() - new Date(contact.last_chat + "T00:00:00").getTime()) / 86400000)
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 hover:border-gray-200 hover:shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <CompanyLogo name={contact.company_name ?? contact.name} logo_url={contact.company_logo_url} size={36} />
          <div>
            <button onClick={onViewProfile} className="font-semibold text-gray-900 text-sm hover:underline text-left">
              {contact.name}
            </button>
            <div className="text-xs text-gray-400">{contact.role ?? "—"}{contact.company_name ? ` · ${contact.company_name}` : ""}</div>
          </div>
        </div>
        <StarRating value={contact.star_rating} readonly />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          💬 <span>{contact.session_count} chat{contact.session_count !== 1 ? "s" : ""}</span>
        </span>
        {daysSince !== null && (
          <span className={`flex items-center gap-1 ${daysSince > 30 ? "text-red-400" : daysSince > 14 ? "text-amber-500" : "text-green-600"}`}>
            🕐 {daysSince === 0 ? "Today" : `${daysSince}d ago`}
          </span>
        )}
        {contact.linkedin_url && (
          <a href={contact.linkedin_url} target="_blank" rel="noreferrer"
            className="ml-auto text-blue-400 hover:text-blue-600">LinkedIn →</a>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-gray-50">
        <button
          onClick={onLogSession}
          className="flex-1 text-xs py-1.5 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 font-medium transition-colors"
        >
          + Log chat
        </button>
        <button onClick={onViewProfile} className="px-3 text-xs py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">
          Profile
        </button>
        <button onClick={onEdit} className="px-2 text-xs text-gray-400 hover:text-gray-600">✎</button>
        <button onClick={onDelete} className="px-2 text-xs text-red-300 hover:text-red-500">✕</button>
      </div>
    </div>
  );
}

// ── Session Feed Item ─────────────────────────────────────────────────────────

function FeedItem({ session, onDelete }: { session: ChatSession; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50"
      >
        <CompanyLogo name={session.contact_name ?? ""} logo_url={session.contact_logo_url} size={32} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{session.contact_name}</span>
            {session.contact_company && (
              <span className="text-xs text-gray-400">@ {session.contact_company}</span>
            )}
          </div>
          {session.summary && (
            <div className="text-xs text-gray-500 mt-0.5 truncate">{session.summary}</div>
          )}
        </div>
        <div className="text-xs text-gray-400 shrink-0 text-right">
          <div>{session.date}</div>
          <div className="mt-0.5">{session.learnings.length} insight{session.learnings.length !== 1 ? "s" : ""}</div>
        </div>
        <span className="text-gray-300 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-gray-50 px-5 py-4 bg-gray-50/30">
          {session.learnings.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Key learnings</div>
              <ul className="flex flex-col gap-1.5">
                {session.learnings.map((l) => (
                  <li key={l.id} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-violet-400 shrink-0 mt-0.5">•</span>
                    {l.bullet}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {session.raw_notes && (
            <details className="text-xs text-gray-400 mt-2">
              <summary className="cursor-pointer hover:text-gray-600">View raw notes</summary>
              <pre className="mt-2 whitespace-pre-wrap font-mono bg-gray-100 rounded p-3 text-gray-600">{session.raw_notes}</pre>
            </details>
          )}
          <button onClick={onDelete} className="mt-3 text-xs text-red-400 hover:text-red-600">Delete session</button>
        </div>
      )}
    </div>
  );
}

// ── Contact Profile Modal ─────────────────────────────────────────────────────

function ContactProfile({
  contact,
  sessions,
  onClose,
  onRating,
}: {
  contact: Contact;
  sessions: ChatSession[];
  onClose: () => void;
  onRating: (v: number) => void;
}) {
  const mySessions = sessions.filter((s) => s.contact_id === contact.id);

  return (
    <Modal title={contact.name} onClose={onClose}>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <CompanyLogo name={contact.company_name ?? contact.name} logo_url={contact.company_logo_url} size={48} />
          <div>
            <div className="text-sm text-gray-500">{contact.role}{contact.company_name ? ` · ${contact.company_name}` : ""}</div>
            <div className="mt-1.5">
              <StarRating value={contact.star_rating} onChange={onRating} />
            </div>
          </div>
        </div>

        {/* Quick info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {contact.email && <div><span className="text-gray-400">Email </span><a href={`mailto:${contact.email}`} className="text-blue-500">{contact.email}</a></div>}
          {contact.linkedin_url && <div><span className="text-gray-400">LinkedIn </span><a href={contact.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-500">View profile</a></div>}
          {contact.reached_out_on && <div><span className="text-gray-400">Reached out </span>{contact.reached_out_on}</div>}
          {contact.last_chat && <div><span className="text-gray-400">Last chat </span>{contact.last_chat}</div>}
        </div>

        {contact.notes && (
          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3">{contact.notes}</div>
        )}

        {/* All learnings from this person */}
        {mySessions.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
              Insights from {mySessions.length} chat{mySessions.length !== 1 ? "s" : ""}
            </div>
            <div className="flex flex-col gap-3">
              {mySessions.map((s) => (
                <div key={s.id} className="border-l-2 border-violet-200 pl-3">
                  <div className="text-xs text-gray-400 mb-1">{s.date}{s.summary ? ` · ${s.summary}` : ""}</div>
                  {s.learnings.map((l) => (
                    <div key={l.id} className="flex items-start gap-2 text-sm text-gray-700 mb-1">
                      <span className="text-violet-400 shrink-0">•</span> {l.bullet}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {mySessions.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No chats logged yet.</p>
        )}
      </div>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type ModalState =
  | null
  | { type: "addContact" }
  | { type: "editContact"; contact: Contact }
  | { type: "logSession"; contact_id?: number }
  | { type: "profile"; contact: Contact };

export default function Networking() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [modal, setModal] = useState<ModalState>(null);
  const [tab, setTab] = useState<"people" | "feed">("people");

  const loadContacts = useCallback(() => api.get("/contacts").then((r) => setContacts(r.data)), []);
  const loadSessions = useCallback(() => api.get("/sessions").then((r) => setSessions(r.data)), []);

  useEffect(() => { loadContacts(); }, [loadContacts]);
  useEffect(() => { loadSessions(); }, [loadSessions]);
  useEffect(() => { api.get("/companies").then((r) => setCompanies(r.data)); }, []);

  const saveContact = async (data: Partial<Contact>) => {
    if (modal?.type === "addContact") await api.post("/contacts", data);
    else if (modal?.type === "editContact") await api.put(`/contacts/${modal.contact.id}`, data);
    setModal(null);
    loadContacts();
  };

  const deleteContact = async (id: number) => {
    if (!confirm("Delete this contact and all their chat sessions?")) return;
    await api.delete(`/contacts/${id}`);
    loadContacts();
    loadSessions();
  };

  const saveSession = async (data: { contact_id: number; date: string; summary: string; raw_notes: string; learnings: string[] }) => {
    await api.post("/sessions", data);
    setModal(null);
    loadSessions();
    loadContacts();
  };

  const deleteSession = async (id: number) => {
    if (!confirm("Delete this session?")) return;
    await api.delete(`/sessions/${id}`);
    loadSessions();
    loadContacts();
  };

  const updateRating = async (contact: Contact, rating: number) => {
    await api.put(`/contacts/${contact.id}`, { ...contact, star_rating: rating });
    loadContacts();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Networking</h1>
          <p className="text-sm text-gray-400 mt-0.5">{contacts.length} people · {sessions.length} chats logged</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModal({ type: "logSession" })}
            className="px-4 py-2 text-sm border border-violet-200 text-violet-700 bg-violet-50 rounded-lg hover:bg-violet-100 font-medium"
          >
            ✦ Log a chat
          </button>
          <button
            onClick={() => setModal({ type: "addContact" })}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700"
          >
            + Add person
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {(["people", "feed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "people" ? "👥 People" : "📋 Activity Feed"}
          </button>
        ))}
      </div>

      {/* People grid */}
      {tab === "people" && (
        contacts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🤝</div>
            <p className="text-sm">No contacts yet. Add someone you met or want to reach out to.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((c) => (
              <ContactCard
                key={c.id}
                contact={c}
                onEdit={() => setModal({ type: "editContact", contact: c })}
                onDelete={() => deleteContact(c.id)}
                onLogSession={() => setModal({ type: "logSession", contact_id: c.id })}
                onViewProfile={() => setModal({ type: "profile", contact: c })}
              />
            ))}
          </div>
        )
      )}

      {/* Activity feed */}
      {tab === "feed" && (
        sessions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">☕</div>
            <p className="text-sm">No chats logged yet. Hit "Log a chat" to capture your first coffee chat.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-2xl">
            {sessions.map((s) => (
              <FeedItem key={s.id} session={s} onDelete={() => deleteSession(s.id)} />
            ))}
          </div>
        )
      )}

      {/* Modals */}
      {modal?.type === "addContact" && (
        <Modal title="Add person" onClose={() => setModal(null)}>
          <ContactForm companies={companies} onSave={saveContact} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === "editContact" && (
        <Modal title="Edit contact" onClose={() => setModal(null)}>
          <ContactForm initial={modal.contact} companies={companies} onSave={saveContact} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === "logSession" && (
        <Modal title="Log a coffee chat ☕" onClose={() => setModal(null)}>
          <SessionForm
            contacts={contacts}
            initial={modal.contact_id ? { contact_id: modal.contact_id } : undefined}
            onSave={saveSession}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}
      {modal?.type === "profile" && (
        <ContactProfile
          contact={modal.contact}
          sessions={sessions}
          onClose={() => setModal(null)}
          onRating={(v) => updateRating(modal.contact, v)}
        />
      )}
    </div>
  );
}
