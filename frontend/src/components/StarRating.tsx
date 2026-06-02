interface Props {
  value?: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}

export default function StarRating({ value = 0, onChange, readonly }: Props) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star === value ? 0 : star)}
          className={`text-lg leading-none transition-colors ${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          } ${star <= (value ?? 0) ? "text-amber-400" : "text-gray-200"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
