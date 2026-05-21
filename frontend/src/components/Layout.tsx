import { NavLink, Outlet } from "react-router-dom";

const nav = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/companies", label: "Companies", icon: "🏢" },
  { to: "/jobs", label: "Applications", icon: "💼" },
  { to: "/contacts", label: "Networking", icon: "🤝" },
  { to: "/prep", label: "Interview Prep", icon: "🧠" },
  { to: "/journal", label: "Journal", icon: "📓" },
];

export default function Layout() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col py-6 px-3 gap-1">
        <div className="px-3 mb-4">
          <h1 className="text-sm font-bold text-gray-900 tracking-tight">App Cycle</h1>
          <p className="text-xs text-gray-400 mt-0.5">Fall 2026</p>
        </div>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-gray-900 text-white font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
