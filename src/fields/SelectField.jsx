import { inputStyle, FieldLabel, FieldHint } from './TextField'

export default function SelectField({ field, value, onChange }) {
  const { name, label, type, description, required, options = [] } = field
  return (
    <div style={{ marginBottom: '16px' }}>
      <FieldLabel name={label || name} type={type} required={required} />
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, cursor: 'pointer' }}
      >
        <option value="">— select —</option>
        {options.map(opt => {
          const val = typeof opt === 'object' ? opt.value : opt
          const lbl = typeof opt === 'object' ? opt.label : opt
          return <option key={val} value={val}>{lbl}</option>
        })}
      </select>
      {description && <FieldHint>{description}</FieldHint>}
    </div>
  )
}
