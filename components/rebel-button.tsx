import type { ReactNode } from "react"

interface RebelButtonProps {
  children: ReactNode
  className?: string
  [key: string]: any
}

export function RebelButton({ children, className = "", ...props }: RebelButtonProps) {
  return (
    <button
      className={`bg-amber-500 hover:bg-amber-600 text-black font-medium px-8 py-4 rounded-md transition-all transform hover:scale-[1.02] shadow-lg ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
