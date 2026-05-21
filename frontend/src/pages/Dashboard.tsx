import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import type { DashboardStats } from "../api";
import CompanyLogo from "../components/CompanyLogo";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.get("/dashboard").then((r) => setStats(r.data));
  }, []);

  if (!stats) return <div className="p-8 text-gray-400">Loading…</div>;

  const statCards = [
    { label: "Companies", value: stats.companies, to: "/companies", color: "bg-violet-50 text-violet-700" },
    { label: "Wishlist", value: stats.wishlist, to: "/jobs?status=Wishlist", color: "bg-blue-50 text-blue-700" },
    { label: "Applied", value: stats.applied, to: "/jobs?status=Applied", color: "bg-amber-50 text-amber-700" },
    { label: "Closed", value: stats.closed, to: "/jobs?status=Closed", color: "bg-gray-100 text-gray-600" },
    { label: "Contacts", value: stats.contacts, to: "/contacts", color: "bg-green-50 text-green-700" },
    { label: "Questions", value: stats.questions, to: "/prep", color: "bg-cyan-50 text-cyan-700" },
  ];

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-8">Your application cycle at a glance.</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {statCards.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className={`rounded-xl p-5 ${s.color} hover:opacity-90 transition-opacity`}
          >
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm font-medium mt-1 opacity-80">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Deadlines */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Upcoming deadlines <span className="text-gray-400 font-normal text-sm">(next 14 days)</span>
        </h2>
        {stats.upcoming_deadlines.length === 0 ? (
          <p className="text-sm text-gray-400">Nothing due in the next two weeks.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {stats.upcoming_deadlines.map((d, i) => (
              <Link
                key={i}
                to={d.type === "job" ? `/jobs` : `/contacts`}
                className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-3 hover:border-gray-300 transition-colors"
              >
                {d.company_logo_url && (
                  <CompanyLogo name={d.company_name ?? ""} logo_url={d.company_logo_url} size={24} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{d.label}</div>
                  {d.company_name && (
                    <div className="text-xs text-gray-400">{d.company_name}</div>
                  )}
                </div>
                <div className="text-xs text-gray-500 shrink-0">
                  <span className={`font-medium ${d.type === "job" ? "text-amber-600" : "text-green-600"}`}>
                    {d.type === "job" ? "deadline" : "follow-up"}
                  </span>
                  {" · "}
                  {d.deadline}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
