import { useState, useEffect } from "react";
import { adaptSchema, initValues, validateValues, buildPayload } from "./SchemaAdapter";

/**
 * useWorkflowEngine — manages schema fetching, form state, and workflow execution.
 *
 * Self-contained: makes its own fetch calls using apiUrl. No external API file needed.
 * Drop this hook into any React project.
 *
 * @param {object} opts
 * @param {string}   opts.token            - JWT auth token (passed as Bearer header)
 * @param {string}   opts.workflowName     - workflow_key (e.g. 'n8n/product-shot')
 * @param {string}   opts.apiUrl           - PA backend base URL, e.g. import.meta.env.VITE_API_URL
 * @param {Function} opts.executionAdapter - optional async fn(name, payload, {token, testMode})
 *                                          returning a result object, or null to use agent-studio
 * @param {Function} opts.uploadFn         - async fn(file) => url (for file upload fields)
 */
export function useWorkflowEngine({
  token,
  workflowName,
  apiUrl = "",
  executionAdapter,
  uploadFn,
} = {}) {
  const [schema, setSchema] = useState(null);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [schemaError, setSchemaError] = useState(null);

  const [values, setValues] = useState({});
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [testMode, setTestMode] = useState(false);

  // Build auth headers
  const authHeaders = () => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  // Fetch schema whenever workflowName changes
  useEffect(() => {
    if (!workflowName) {
      setSchema(null);
      setValues({});
      setResult(null);
      setValidationError("");
      return;
    }
    setLoadingSchema(true);
    setSchemaError(null);
    setResult(null);
    setValidationError("");

    // workflowName is the workflow_key (e.g. "n8n/product-shot").
    // Agent-studio uses a {workflow_key:path} route that captures slashes, so no encoding needed.
    const url = `${apiUrl}/api/v1/agent-studio/workflows/${workflowName}`;
    fetch(url, { headers: authHeaders() })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw json;
        return json;
      })
      .then((raw) => {
        // Agent-studio returns: {workflow_key, name, description, schema: {fields: [...], webhookPath}, ...}
        // adaptSchema() expects: {name, workflow_key, description, webhookPath, params: {fieldName: {...}}}
        const rawSchema = raw.schema || {};
        const params = {};
        (rawSchema.fields || []).forEach(({ name, ...meta }) => {
          params[name] = meta;
        });
        const normalized = {
          name: raw.name,
          workflow_key: raw.workflow_key,
          description: raw.description || "",
          webhookPath: rawSchema.webhookPath || null,
          submitUrl: null,
          params,
        };
        const v1 = adaptSchema(normalized);
        setSchema(v1);
        setValues(initValues(v1));
      })
      .catch(() => {
        setSchemaError("Failed to load workflow schema.");
        setSchema(null);
      })
      .finally(() => setLoadingSchema(false));
  }, [workflowName, token, apiUrl]);

  const onChange = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setValidationError("");
    setResult(null);
  };

  const reset = () => {
    setValues(initValues(schema));
    setValidationError("");
    setResult(null);
  };

  const submit = async () => {
    const err = validateValues(schema, values);
    if (err) {
      setValidationError(err);
      return;
    }

    let payload;
    try {
      payload = buildPayload(schema, values);
    } catch (e) {
      setValidationError(e.message);
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      // Priority 1: Custom execution adapter (legacy / custom routing)
      if (executionAdapter) {
        const adapterResult = await executionAdapter(workflowName, payload, {
          token,
          testMode,
        });
        if (adapterResult !== null && adapterResult !== undefined) {
          setResult({ success: true, data: adapterResult });
          return;
        }
      }

      // Priority 2: Default — POST to /api/v1/agent-studio/execute
      const r = await fetch(`${apiUrl}/api/v1/agent-studio/execute`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          workflow_key: workflowName,
          inputs: payload,
          test_mode: testMode,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw data;

      // Normalize result: agent-studio returns {success, job_id, status, message} at top level.
      // Wrap in data so WorkflowRenderer.ResultData (reads data.message + data.jobId) works.
      setResult({
        success: true,
        data: {
          jobId: data.job_id,
          job_id: data.job_id,
          message: data.message,
          status: data.status,
          estimated_time: data.estimated_time,
        },
      });
    } catch (e) {
      setResult({
        success: false,
        error: e.detail || e.error || JSON.stringify(e),
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    schema,
    loadingSchema,
    schemaError,
    values,
    onChange,
    reset,
    submit,
    loading,
    result,
    validationError,
    testMode,
    setTestMode,
    uploadFn,
  };
}
