import { FieldHint } from './TextField'

export default function BooleanField({ field, value, onChange }) {
  const { name, label, description, required } = field
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={!!value}
          onChange={e => onChange(e.target.checked)}
          style={{ width: '15px', height: '15px', cursor: 'pointer' }}
        />
        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{label || name}</span>
          {required && <span style={{ fontSize: '10px', color: 'var(--danger)', fontWeight: 700, marginLeft: '4px' }}>*</span>}
        </div>
      </label>
      {description && <FieldHint>{description}</FieldHint>}
    </div>
  )
}
