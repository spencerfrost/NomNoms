import { Input } from '@/components/ui/input'

interface FormFieldProps {
  id: string
  label: string
  type: 'text' | 'email' | 'password'
  placeholder: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: string
}

export function FormField({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  required = false,
  error
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={error ? 'border-red-500' : ''}
      />
      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
