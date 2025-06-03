interface AuthErrorDisplayProps {
  error: string
  className?: string
}

export function AuthErrorDisplay({ error, className = '' }: AuthErrorDisplayProps) {
  return (
    <div className={`text-red-600 text-sm text-center ${className}`}>
      {error}
    </div>
  )
}
