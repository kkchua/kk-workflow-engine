import { inputStyle, FieldLabel, FieldHint } from './TextField'

export default function TextareaField({ field, value, onChange }) {
  const { name, label, type, description, required, placeholder } = field
  const isJson = type === 'array' || type === 'object'

  const displayValue = isJson && typeof value !== 'string'
    ? JSON.stringify(value ?? (type === 'array' ? [] : {}), null, 2)
    : (value ?? '')

  return (
    <div style={{ marginBottom: '16px' }}>
      <FieldLabel name={label || name} type={type} required={required} />
      <textarea
        value={displayValue}
        onChange={e => onChange(e.target.value)}
        rows={isJson ? 4 : 5}
        placeholder={placeholder || (isJson ? (type === 'array' ? '["value1", "value2"]' : '{"key": "value"}') : '')}
        spellCheck={false}
        style={{
          ...inputStyle,
          fontFamily: isJson ? 'monospace' : 'inherit',
          fontSize: isJson ? '12px' : '13px',
          resize: 'vertical',
          padding: '8px 10px',
        }}
      />
      {isJson && <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Enter valid JSON {type}</div>}
      {description && <FieldHint>{description}</FieldHint>}
    </div>
  )
}
