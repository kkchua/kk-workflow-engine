const inputStyle = {
  width: '100%', padding: '7px 10px', fontSize: '13px',
  border: '1px solid var(--border)', borderRadius: 'var(--radius, 6px)',
  background: 'var(--bg-secondary, var(--bg-card))', color: 'var(--text-primary)',
  outline: 'none', boxSizing: 'border-box',
}

export default function TextField({ field, value, onChange }) {
  const { name, label, type, description, required, placeholder } = field
  return (
    <div style={{ marginBottom: '16px' }}>
      <FieldLabel name={label || name} type={type} required={required} />
      <input
        type="text"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || ''}
        style={inputStyle}
      />
      {description && <FieldHint>{description}</FieldHint>}
    </div>
  )
}

export function FieldLabel({ name, type, required }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{name}</span>
      {required && <span style={{ fontSize: '10px', color: 'var(--danger)', fontWeight: 700 }}>*</span>}
      <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '8px', background: 'var(--accent-dim, rgba(200,169,110,0.12))', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{type}</span>
    </div>
  )
}

export function FieldHint({ children }) {
  return <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '3px' }}>{children}</div>
}

export { inputStyle }
