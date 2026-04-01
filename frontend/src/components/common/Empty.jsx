// Empty state block used when a list or panel has no data.
export default function Empty({ icon = '📭', title = 'Trống', desc = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-semibold text-base mb-1">{title}</h3>
      {desc && <p className="text-sm text-[var(--text-muted)] mb-4 max-w-xs">{desc}</p>}
      {action}
    </div>
  )
}
