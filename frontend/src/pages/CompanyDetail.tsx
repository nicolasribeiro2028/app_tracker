import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import type { Company, Job, Contact, Question } from "../api";
import CompanyLogo from "../components/CompanyLogo";
import StatusBadge from "../components/StatusBadge";

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (!id) return;
    api.get(`/companies/${id}`).then((r) => setCompany(r.data));
    api.get(`/jobs?company_id=${id}`).then((r) => setJobs(r.data));
    api.get(`/contacts?company_id=${id}`).then((r) => setContacts(r.data));
    api.get(`/questions?company_id=${id}`).then((r) => setQuestions(r.data));
  }, [id]);

  if (!company) return <div className="p-8 text-gray-400">Loading…</div>;

  return (
    <div className="p-8 max-w-3xl">
      <Link to="/companies" className="text-xs text-gray-400 hover:text-gray-600 mb-4 inline-block">← Back to companies</Link>

      <div className="flex items-center gap-4 mb-8">
        <CompanyLogo name={company.name} logo_url={company.logo_url} size={48} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
          <div className="flex gap-3 text-sm text-gray-500 mt-0.5">
            {company.industry && <span>{company.industry}</span>}
            {company.size && <span>· {company.size} employees</span>}
            {company.website && <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">· {company.website}</a>}
          </div>
        </div>
      </div>

      {company.notes && (
        <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600 mb-8">{company.notes}</div>
      )}

      {/* Jobs */}
      <Section title="Applications" count={jobs.length} linkTo="/jobs">
        {jobs.map((j) => (
          <div key={j.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
            <div>
              <div className="text-sm font-medium text-gray-900">{j.title}</div>
              {j.deadline && <div className="text-xs text-gray-400">Deadline: {j.deadline}</div>}
            </div>
            <StatusBadge label={j.status} />
          </div>
        ))}
      </Section>

      {/* Contacts */}
      <Section title="Contacts" count={contacts.length} linkTo="/contacts">
        {contacts.map((c) => (
          <div key={c.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
            <div>
              <div className="text-sm font-medium text-gray-900">{c.name}</div>
              <div className="text-xs text-gray-400">{c.role}</div>
            </div>
            {c.follow_up_date && <div className="text-xs text-gray-400">Follow-up: {c.follow_up_date}</div>}
          </div>
        ))}
      </Section>

      {/* Interview Questions */}
      <Section title="Interview Questions" count={questions.length} linkTo="/prep">
        {questions.map((q) => (
          <div key={q.id} className="py-2.5 border-b border-gray-50 last:border-0">
            <div className="flex items-start gap-2">
              <StatusBadge label={q.category} />
              <div className="text-sm text-gray-900">{q.question}</div>
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
}

function Section({ title, count, linkTo, children }: { title: string; count: number; linkTo: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900">{title} <span className="text-gray-400 font-normal text-sm">({count})</span></h2>
        <Link to={linkTo} className="text-xs text-blue-500 hover:underline">View all →</Link>
      </div>
      {count === 0 ? (
        <p className="text-sm text-gray-400">None yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 px-4">{children}</div>
      )}
    </div>
  );
}
