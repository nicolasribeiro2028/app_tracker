import { useState } from "react";

interface Props {
  name: string;
  logo_url?: string;
  size?: number;
}

export default function CompanyLogo({ name, logo_url, size = 28 }: Props) {
  const [failed, setFailed] = useState(false);

  const letter = (
    <div
      className="rounded bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-xs shrink-0 border border-gray-200"
      style={{ width: size, height: size, minWidth: size, fontSize: size * 0.4 }}
    >
      {name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );

  if (!logo_url || failed) return letter;

  return (
    <img
      src={logo_url}
      alt={name}
      width={size}
      height={size}
      className="rounded object-contain bg-white border border-gray-100 shrink-0"
      style={{ width: size, height: size, minWidth: size }}
      onError={() => setFailed(true)}
    />
  );
}
