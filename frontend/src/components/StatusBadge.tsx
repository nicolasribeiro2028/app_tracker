const colors: Record<string, string> = {
  Wishlist: "bg-blue-50 text-blue-700 border-blue-200",
  Applied: "bg-amber-50 text-amber-700 border-amber-200",
  Closed: "bg-gray-100 text-gray-500 border-gray-200",
  Behavioral: "bg-purple-50 text-purple-700 border-purple-200",
  Technical: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Case: "bg-orange-50 text-orange-700 border-orange-200",
  Other: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function StatusBadge({ label }: { label: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors[label] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
    >
      {label}
    </span>
  );
}
