import { Zap } from 'lucide-react'

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-11 w-11' : 'h-9 w-9'
  const text = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl'
  const icon = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'

  return (
    <div className="inline-flex items-center gap-2">
      <div className={`${dims} rounded-[10px] bg-primary flex items-center justify-center`}
        style={{ boxShadow: '0 6px 20px -6px color-mix(in oklab, var(--primary) 60%, transparent)' }}>
        <Zap className={`${icon} text-primary-foreground fill-primary-foreground`} strokeWidth={0} />
      </div>
      <span className={`${text} font-bold tracking-tight font-display`}>
        <span style={{ color: 'var(--secondary)' }}>tez</span>
        <span style={{ color: 'var(--primary)' }}>yubor</span>
      </span>
    </div>
  )
}
