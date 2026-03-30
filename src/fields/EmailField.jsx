import { inputStyle, FieldLabel, FieldHint } from './TextField'

export default function EmailField({ field, value, onChange }) {
  const { name, label, type, description, required, placeholder } = field
  return (
    <div style={{ marginBottom: '16px' }}>
      <FieldLabel name={label || name} type={type} required={required} />
      <input
        type="email"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'name@example.com'}
        style={inputStyle}
      />
      {description && <FieldHint>{description}</FieldHint>}
    </div>
  )
}
