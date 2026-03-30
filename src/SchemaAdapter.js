/**
 * SchemaAdapter — converts the PA backend schema format into the v1 schema used
 * by WorkflowRenderer, and provides payload building + validation helpers.
 *
 * Backend format (from /api/v1/n8n/schema/:name):
 *   { name, description, webhookPath, params: { fieldName: { type, description, required, options? } } }
 *
 * v1 schema format (internal):
 *   { id, title, description, webhookPath, version, fields: [{ name, label, type, required, description, placeholder, default, options }] }
 */

export function adaptSchema(rawSchema) {
  if (!rawSchema) return null;

  // Filter out meta-info fields that shouldn't be rendered as inputs
  const META_FIELDS = [
    "description",
    "name",
    "workflow_key",
    "category",
    "tags",
    "source",
    "output_type",
  ];

  return {
    id: rawSchema.workflow_key || rawSchema.name,
    title: rawSchema.name,
    description: rawSchema.description || null,
    webhookPath: rawSchema.webhookPath || null,
    submitUrl: rawSchema.submitUrl || null,
    version: "1.0",
    fields: Object.entries(rawSchema.params || {})
      .filter(([name]) => !META_FIELDS.includes(name))
      .map(([name, meta]) => ({
        name,
        label: meta.label || name,
        type: normalizeType(meta.type || "text", name),
        required: meta.required || false,
        description: meta.description || "",
        placeholder: meta.placeholder || "",
        default:
          meta.default !== undefined &&
          meta.default !== null &&
          meta.default !== name
            ? meta.default
            : "",
        options: meta.options || [],
      })),
  };
}

function normalizeType(type, fieldName = "") {
  const t = (type || "").toLowerCase();
  const name = (fieldName || "").toLowerCase();

  // Auto-detect textarea for fields containing semantic keywords
  if (
    name.includes("prompt") ||
    name.includes("description") ||
    name.includes("instruction") ||
    name.includes("story") ||
    name.includes("script") ||
    name.includes("content") ||
    name.includes("message")
  ) {
    return "textarea";
  }

  if (t === "textarea" || t === "text_area") return "textarea";
  if (t === "number" || t === "int" || t === "integer" || t === "float")
    return "number";
  if (t === "boolean" || t === "bool") return "boolean";
  if (t === "upload" || t === "file") return "upload";
  if (t === "select" || t === "list") return "list";
  if (t === "email") return "email";
  return "text";
}

export function initValues(v1Schema) {
  if (!v1Schema) return {};
  const init = {};
  for (const f of v1Schema.fields) {
    if (f.type === "boolean")
      init[f.name] = f.default === true || f.default === "true" ? true : false;
    else if (f.type === "array") init[f.name] = f.default || "[]";
    else if (f.type === "object") init[f.name] = f.default || "{}";
    else init[f.name] = f.default || "";
  }
  return init;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateValues(v1Schema, values) {
  if (!v1Schema) return null;
  for (const f of v1Schema.fields) {
    const val = values[f.name];
    if (f.type === "boolean") continue;
    if (f.required && (!val || (typeof val === "string" && !val.trim())))
      return `"${f.label || f.name}" is required`;
    if (f.type === "email" && val && !EMAIL_RE.test(val.trim()))
      return `"${f.label || f.name}" must be a valid email address`;
  }
  return null;
}

export function buildPayload(v1Schema, values) {
  if (!v1Schema) return {};
  const payload = {};
  for (const f of v1Schema.fields) {
    const raw = values[f.name];
    if (raw === "" || raw === undefined || raw === null) continue;
    if (f.type === "number") {
      payload[f.name] = Number(raw);
    } else if (f.type === "array" || f.type === "object") {
      try {
        payload[f.name] = JSON.parse(raw);
      } catch {
        throw new Error(`"${f.label || f.name}" is not valid JSON`);
      }
    } else {
      payload[f.name] = raw;
    }
  }
  return payload;
}
