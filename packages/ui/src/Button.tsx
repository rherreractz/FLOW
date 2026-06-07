import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const base = 'rounded-lg px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50'
  const variants = {
    primary: 'bg-[var(--brand-primary)] text-white hover:opacity-90',
    secondary: 'border border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10',
    ghost: 'text-gray-600 hover:bg-gray-100',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
