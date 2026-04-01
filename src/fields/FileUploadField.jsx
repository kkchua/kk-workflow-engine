import { useRef, useState } from "react";
import { inputStyle, FieldLabel, FieldHint } from "./TextField";

export default function FileUploadField({ field, value, onChange, uploadFn, onGallerySelect }) {
  const { name, label, type, description, required } = field;
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const isGalleryRef = value?.isGalleryReference === true;

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadFn) return;
    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadFn(file);
      if (url) onChange(url);
      else setUploadError("Upload succeeded but no URL was returned");
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleGalleryClick = async () => {
    if (!onGallerySelect) return;
    const ref = await onGallerySelect();
    if (ref) onChange(ref);
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <FieldLabel name={label || name} type={type} required={required} />

      {(uploadFn || onGallerySelect) && (
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px", flexWrap: "wrap" }}>
          {uploadFn && (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{ fontSize: "12px", padding: "5px 12px", whiteSpace: "nowrap" }}
            >
              {uploading ? "⏳ Uploading…" : "⬆ Upload image"}
            </button>
          )}
          {onGallerySelect && (
            <button
              type="button"
              className="btn btn--ghost"
              onClick={handleGalleryClick}
              style={{ fontSize: "12px", padding: "5px 12px", whiteSpace: "nowrap" }}
            >
              🖼️ From Gallery
            </button>
          )}
          {uploadFn && !onGallerySelect && (
            <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
              or paste a URL below
            </span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFile}
            style={{ display: "none" }}
          />
        </div>
      )}

      {isGalleryRef ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
          <img
            src={value.url}
            alt="gallery preview"
            onError={(e) => { e.target.style.display = "none"; }}
            style={{
              maxHeight: "72px", maxWidth: "120px",
              borderRadius: "4px", border: "1px solid var(--border)", objectFit: "cover",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
              {value.filename}
            </span>
            <button
              type="button"
              onClick={() => onChange("")}
              style={{
                fontSize: "11px", color: "var(--danger)", background: "none",
                border: "none", cursor: "pointer", padding: 0, textAlign: "left",
              }}
            >
              ✕ Remove
            </button>
          </div>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://…"
            style={inputStyle}
          />
          {value && typeof value === "string" && (
            <div style={{ marginTop: "8px" }}>
              <img
                src={value}
                alt="preview"
                onError={(e) => { e.target.style.display = "none"; }}
                style={{
                  maxHeight: "72px", maxWidth: "120px",
                  borderRadius: "4px", border: "1px solid var(--border)", objectFit: "cover",
                }}
              />
            </div>
          )}
        </>
      )}

      {uploadError && (
        <div style={{ fontSize: "12px", color: "var(--danger)", marginTop: "4px" }}>
          ⚠ {uploadError}
        </div>
      )}
      {description && <FieldHint>{description}</FieldHint>}
    </div>
  );
}
