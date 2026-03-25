import clsx from 'clsx'

export default function Avatar({ user, size = 'md', className }) {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' }
  const initials = (user?.display_name || user?.username || '?')[0]?.toUpperCase()

  if (user?.avatar_url) {
    return <img src={user.avatar_url} alt={user.display_name} className={clsx('rounded-full object-cover flex-shrink-0', sizes[size], className)} />
  }
  return (
    <div className={clsx('rounded-full flex items-center justify-center font-bold flex-shrink-0 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300', sizes[size], className)}>
      {initials}
    </div>
  )
}
