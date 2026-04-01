// Minimal loading indicator for async views and guards.
export default function Spinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className="flex items-center justify-center py-8">
      <div className={`${s[size]} border-2 border-[var(--border)] border-t-primary-500 rounded-full animate-spin`} />
    </div>
  )
}
