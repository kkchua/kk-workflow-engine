import { useState, useEffect } from "react";

/**
 * WorkflowGrid — displays a categorized grid of workflow cards.
 *
 * Props:
 *   capabilities     — array of category groups: [{ category, workflows: [{name, description, ...}] }]
 *   onWorkflowSelect — (workflow) => void
 */
export default function WorkflowGrid({ capabilities, onWorkflowSelect }) {
  const [workflows, setWorkflows] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSource, setSelectedSource] = useState("");

  useEffect(() => {
    if (capabilities && Array.isArray(capabilities)) {
      const flat = capabilities.flatMap((cap) =>
        (cap.workflows || []).map((wf) => ({
          ...wf,
          category: wf.category || cap.category,
        }))
      );
      setWorkflows(flat);
    }
  }, [capabilities]);

  const categories = [...new Set(workflows.flatMap((wf) => wf.category || []))];
  const sources = [...new Set(workflows.map((wf) => wf.source).filter(Boolean))];

  const filteredWorkflows = workflows.filter((wf) => {
    if (selectedCategory && wf.category !== selectedCategory) return false;
    if (selectedSource && wf.source !== selectedSource) return false;
    return true;
  });

  const workflowsByCategory = filteredWorkflows.reduce((acc, wf) => {
    const category = wf.category || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(wf);
    return acc;
  }, {});

  if (!capabilities || capabilities.length === 0) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "var(--text-secondary)",
          fontSize: "14px",
        }}
      >
        No workflows available. Check your access permissions or contact admin.
      </div>
    );
  }

  const selectStyle = {
    width: "220px",
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius, 6px)",
    background: "var(--bg-secondary, var(--bg-card))",
    color: "var(--text-primary)",
    outline: "none",
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Filters */}
      {(sources.length > 1 || categories.length > 1) && (
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
          {sources.length > 1 && (
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
                Filter by Source
              </label>
              <select value={selectedSource} onChange={(e) => setSelectedSource(e.target.value)} style={selectStyle}>
                <option value="">All Sources</option>
                {sources.map((src) => (
                  <option key={src} value={src}>{src.toUpperCase()}</option>
                ))}
              </select>
            </div>
          )}
          {categories.length > 1 && (
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
                Filter by Category
              </label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={selectStyle}>
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Workflow Cards by Category */}
      {Object.entries(workflowsByCategory).map(([category, categoryWorkflows]) => (
        <div key={category} style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px", textTransform: "capitalize" }}>
            {category.replace(/_/g, " ")}
            <span style={{ fontSize: "14px", fontWeight: 400, color: "var(--text-secondary)", marginLeft: "8px" }}>
              ({categoryWorkflows.length})
            </span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
            {categoryWorkflows.map((workflow) => (
              <WorkflowCard
                key={workflow.workflow_key || workflow.name}
                workflow={workflow}
                onClick={() => onWorkflowSelect?.(workflow)}
              />
            ))}
          </div>
        </div>
      ))}

      {filteredWorkflows.length === 0 && (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)", fontSize: "14px" }}>
          No workflows match the selected filters.
        </div>
      )}
    </div>
  );
}

function WorkflowCard({ workflow, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: "20px",
        background: "var(--bg-card)",
        borderRadius: "var(--radius, 6px)",
        border: `1px solid ${isHovered ? "var(--accent)" : "var(--border)"}`,
        cursor: "pointer",
        transition: "all 0.2s ease",
        transform: isHovered ? "translateY(-4px)" : "none",
        boxShadow: isHovered
          ? "0 8px 48px rgba(0,0,0,0.65), 0 0 32px rgba(200,169,110,0.12)"
          : "0 4px 32px rgba(0,0,0,0.45), 0 1px 4px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ marginBottom: "12px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px 0" }}>
          {workflow.name}
        </h3>
        {workflow.description && (
          <p style={{
            fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {workflow.description}
          </p>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {workflow.source && (
          <span style={{
            padding: "3px 8px", background: "var(--accent-dim, rgba(200,169,110,0.12))",
            border: "1px solid var(--border-strong, rgba(200,169,110,0.28))",
            borderRadius: "100px", fontSize: "11px", color: "var(--accent)",
            fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.06em",
          }}>
            {workflow.source}
          </span>
        )}
        {workflow.is_public && (
          <span style={{
            padding: "3px 8px", background: "rgba(39,174,96,0.1)",
            border: "1px solid rgba(39,174,96,0.3)",
            borderRadius: "100px", fontSize: "11px", color: "#27ae60",
          }}>
            Public
          </span>
        )}
      </div>
    </div>
  );
}
