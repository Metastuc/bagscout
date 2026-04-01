const STATUS_STYLES = {
  PRE_LAUNCH: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  PRE_GRAD: "bg-blue-500/10  text-blue-400  border-blue-500/20",
  MIGRATING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  MIGRATED: "bg-cyan-500/10  text-cyan-400  border-cyan-500/20",
};

const STATUS_LABELS = {
  PRE_LAUNCH: "○ Pre-Launch",
  PRE_GRAD: "◑ Pre-Grad",
  MIGRATING: "⟳ Migrating",
  MIGRATED: "⚡ Migrated",
};

export function StatusTag({ status }: { status: BagsTokenInfo["status"] }) {
  return (
    <span
      className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
