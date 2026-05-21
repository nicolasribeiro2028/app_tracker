interface Props {
  date?: string;
}

export default function FollowUpDate({ date }: Props) {
  if (!date) return <span className="text-gray-400 text-sm">—</span>;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date + "T00:00:00");
  const diff = Math.floor((d.getTime() - today.getTime()) / 86400000);

  let cls = "text-sm font-medium ";
  if (diff < 0) cls += "text-red-600";
  else if (diff === 0) cls += "text-amber-600";
  else cls += "text-green-700";

  return <span className={cls}>{date}</span>;
}
