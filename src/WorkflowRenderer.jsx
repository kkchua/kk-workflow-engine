import TextField from "./fields/TextField";
import EmailField from "./fields/EmailField";
import NumberField from "./fields/NumberField";
import TextareaField from "./fields/TextareaField";
import SelectField from "./fields/SelectField";
import BooleanField from "./fields/BooleanField";
import FileUploadField from "./fields/FileUploadField";
import { buildPayload } from "./SchemaAdapter";

function FieldRouter({ field, value, onChange, uploadFn, onGallerySelect }) {
  const props = { field, value, onChange, uploadFn, onGallerySelect };
  switch (field.type) {
    case "email":
      return <EmailField {...props} />;
    case "number":
      return <NumberField {...props} />;
    case "textarea":
      return <TextareaField {...props} />;
    case "array":
      return <TextareaField {...props} />;
    case "object":
      return <TextareaField {...props} />;
    case "list":
      return <SelectField {...props} />;
    case "boolean":
      return <BooleanField {...props} />;
    case "upload":
      return <FileUploadField {...props} />;
    default:
      return <TextField {...props} />;
  }
}

/**
 * WorkflowRenderer — pure presentation component.
 * Renders the workflow form from a v1 schema and calls callbacks for changes/submit.
 *
 * Styled entirely via CSS custom properties — inherits the host site's theme automatically.
 * Requires these CSS variables to be defined by the host:
 *   --bg-card, --bg-secondary, --border, --radius, --accent, --danger,
 *   --text-primary, --text-secondary, --text-tertiary, --transition
 *
 * Props:
 *   schema          — v1 schema from adaptSchema()
 *   values          — { fieldName: value }
 *   onChange        — (name, value) => void
 *   onSubmit        — () => void
 *   onReset         — () => void (optional)
 *   loading         — bool
 *   result          — { success, data, error } | null
 *   validationError — string
 *   testMode        — bool
 *   onTestModeChange — (bool) => void (optional)
 *   uploadFn        — async (file) => url  (optional, passed to FileUploadField)
 *   onGallerySelect — async (job) => result (optional, passed to FileUploadField)
 */
export default function WorkflowRenderer({
  schema,
  values,
  onChange,
  onSubmit,
  onReset,
  loading,
  result,
  validationError,
  testMode,
  onTestModeChange,
  uploadFn,
  onGallerySelect,
}) {
  if (!schema) return null;

  const required = schema.fields.filter((f) => f.required);
  const optional = schema.fields.filter((f) => !f.required);
  const hasFields = schema.fields.length > 0;

  const workflowTitle = schema.title?.toLowerCase() || "";
  const isVideo = workflowTitle.includes("video");
  const isImage = workflowTitle.includes("image");

  const getButtonText = () => {
    if (loading) return "⏳ Processing…";
    if (isVideo) return "🎬 Generate Video";
    if (isImage) return "🖼️ Generate Image";
    return "⚡ Run Workflow";
  };

  const getSuccessMessage = () => {
    if (isVideo) return "🎬 Video generation started successfully";
    if (isImage) return "🖼️ Image generation started successfully";
    return "✓ Workflow triggered successfully";
  };

  const previewPayload = () => {
    try {
      return JSON.stringify(buildPayload(schema, values), null, 2);
    } catch {
      return "(invalid JSON in one or more fields)";
    }
  };

  const cardStyle = {
    background: "var(--bg-card)",
    borderRadius: "var(--radius, 6px)",
    border: "1px solid var(--border)",
  };

  const sectionLabelStyle = {
    fontSize: "11px",
    fontWeight: 700,
    color: "var(--text-tertiary)",
    textTransform: "uppercase",
    marginBottom: "12px",
    letterSpacing: "0.5px",
  };

  return (
    <div style={{ maxWidth: "560px" }}>
      {/* Workflow info header */}
      <div style={{ ...cardStyle, padding: "12px 14px", marginBottom: "20px" }}>
        <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "2px" }}>
          ⚡ {schema.title}
        </div>
        {schema.description && (
          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            {schema.description}
          </div>
        )}
      </div>

      {!hasFields ? (
        <div
          style={{
            padding: "16px",
            background: "var(--bg-secondary, var(--bg-card))",
            borderRadius: "var(--radius, 6px)",
            border: "1px dashed var(--border)",
            color: "var(--text-tertiary)",
            fontSize: "12px",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          This workflow requires no parameters. It will be triggered with an
          empty payload.
        </div>
      ) : (
        <>
          {required.length > 0 && (
            <div style={{ marginBottom: "8px" }}>
              <div style={sectionLabelStyle}>Required fields</div>
              {required.map((f) => (
                <FieldRouter
                  key={f.name}
                  field={f}
                  value={values[f.name]}
                  onChange={(v) => onChange(f.name, v)}
                  uploadFn={uploadFn}
                  onGallerySelect={onGallerySelect}
                />
              ))}
            </div>
          )}

          {optional.length > 0 && (
            <div>
              {required.length > 0 && (
                <div style={{ borderTop: "1px solid var(--border)", marginBottom: "16px" }} />
              )}
              <div style={sectionLabelStyle}>Optional fields</div>
              {optional.map((f) => (
                <FieldRouter
                  key={f.name}
                  field={f}
                  value={values[f.name]}
                  onChange={(v) => onChange(f.name, v)}
                  uploadFn={uploadFn}
                  onGallerySelect={onGallerySelect}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Payload preview */}
      {hasFields && (
        <details style={{ marginBottom: "16px" }}>
          <summary
            style={{
              fontSize: "11px",
              color: "var(--text-tertiary)",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            Preview payload JSON
          </summary>
          <pre
            style={{
              marginTop: "8px",
              padding: "10px 12px",
              background: "var(--bg-secondary, var(--bg-card))",
              borderRadius: "var(--radius, 6px)",
              fontSize: "11px",
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              color: "var(--text-secondary)",
            }}
          >
            {previewPayload()}
          </pre>
        </details>
      )}

      {/* Validation error */}
      {validationError && (
        <div style={{ fontSize: "12px", color: "var(--danger)", marginBottom: "12px" }}>
          ⚠ {validationError}
        </div>
      )}

      {/* Test mode toggle + submit */}
      {onTestModeChange && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              fontSize: "12px",
              color: testMode ? "var(--warning, #f59e0b)" : "var(--text-tertiary)",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={testMode}
              onChange={(e) => onTestModeChange(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            Test mode
          </label>
          {testMode && (
            <span style={{ fontSize: "11px", color: "var(--warning, #f59e0b)", fontStyle: "italic" }}>
              Using /webhook-test/ URL
            </span>
          )}
        </div>
      )}

      <button
        className="btn btn--primary"
        onClick={onSubmit}
        disabled={loading}
        style={{ width: "100%", padding: "10px" }}
      >
        {getButtonText()}
      </button>

      {/* Result panel */}
      {result && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px 14px",
            borderRadius: "var(--radius, 6px)",
            background: result.success ? "var(--accent-dim, rgba(200,169,110,0.12))" : "rgba(217,79,79,0.1)",
            border: `1px solid ${result.success ? "var(--accent)" : "var(--danger)"}`,
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: result.success ? "var(--accent)" : "var(--danger)",
              marginBottom: result.data || result.error ? "4px" : 0,
            }}
          >
            {result.success ? getSuccessMessage() : "✗ Trigger failed"}
          </div>
          {result.data && <ResultData data={result.data} />}
          {result.error && (
            <div style={{ fontSize: "12px", color: "var(--danger)" }}>
              {result.error}
            </div>
          )}
          {result.success && onReset && (
            <button
              onClick={onReset}
              style={{
                marginTop: "12px",
                padding: "8px 16px",
                fontSize: "12px",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius, 6px)",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              🗑 Clear & New Submission
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ResultData({ data }) {
  if (data.message && data.jobId) {
    return (
      <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
        <div style={{ marginBottom: "4px" }}>{data.message}</div>
        <div style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-tertiary)" }}>
          Job ID: {data.jobId}
        </div>
      </div>
    );
  }
  const outputUrl = data.outputUrl || data.videoUrl;
  const remaining = outputUrl
    ? Object.fromEntries(Object.entries(data).filter(([k]) => k !== "outputUrl" && k !== "videoUrl"))
    : data;
  return (
    <>
      {outputUrl && (
        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
            Output URL
          </div>
          <a
            href={outputUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "12px", color: "var(--accent)", wordBreak: "break-all" }}
          >
            {outputUrl}
          </a>
        </div>
      )}
      {Object.keys(remaining).length > 0 && (
        <pre
          style={{
            margin: 0,
            fontSize: "11px",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: "var(--text-secondary)",
          }}
        >
          {JSON.stringify(remaining, null, 2)}
        </pre>
      )}
    </>
  );
}
