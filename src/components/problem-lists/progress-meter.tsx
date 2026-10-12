interface Props {
  completed: number;
  total: number;
  className?: string;
}

export function ProgressMeter({ completed, total, className = '' }: Props) {
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      role="progressbar"
      aria-label="完成進度"
      aria-valuenow={completed}
      aria-valuemin={0}
      aria-valuemax={total}
      className={`h-1.5 overflow-hidden bg-white/15 ${className}`}
    >
      <div
        className="h-full bg-brand transition-[width] duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
