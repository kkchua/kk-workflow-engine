import { inputStyle, FieldLabel, FieldHint } from './TextField'

export default function NumberField({ field, value, onChange }) {
  const { name, label, type, description, required, placeholder } = field
  return (
    <div style={{ marginBottom: '16px' }}>
      <FieldLabel name={label || name} type={type} required={required} />
      <input
        type="number"
        value={value ?? ''}
        onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        placeholder={placeholder || ''}
        style={inputStyle}
      />
      {description && <FieldHint>{description}</FieldHint>}
    </div>
  )
}
