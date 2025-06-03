import { CardContent } from '@/components/ui/card'

interface AuthSuccessMessageProps {
  title: string
  message: string
  icon?: React.ReactNode
  autoRedirect?: boolean
}

export function AuthSuccessMessage({
  title,
  message,
  icon = <div className="text-green-600 text-4xl mb-4">✓</div>,
  autoRedirect = false
}: AuthSuccessMessageProps) {
  return (
    <CardContent className="pt-6">
      <div className="text-center">
        {icon}
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">
          {message}
          {autoRedirect && ' You\'re being signed in...'}
        </p>
      </div>
    </CardContent>
  )
}
