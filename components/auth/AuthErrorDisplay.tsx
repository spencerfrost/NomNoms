import { ErrorMessage } from '@/components/common'

interface AuthErrorDisplayProps {
  error: string
  className?: string
}

export function AuthErrorDisplay({ error, className = '' }: AuthErrorDisplayProps) {
  return (
    <ErrorMessage
      variant="inline"
      message={error}
      className={className}
    />
  )
}
