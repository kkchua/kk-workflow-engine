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
 * @param {string}   opts.workflowName     - selected workflow name (null to reset)
 * @param {string}   opts.apiUrl           - PA backend base URL, e.g. import.meta.env.VITE_API_URL
 * @param {string}   opts.app              - app context tag prefix, e.g. 'portfolio' or 'pa-admin'
 * @param {string}   opts.role             - role tag suffix, e.g. 'public' or 'admin'
 * @param {Function} opts.executionAdapter - optional async fn(name, payload, {token, testMode})
 *                                          returning a result object, or null to use default n8n trigger
 * @param {Function} opts.uploadFn         - async fn(file) => url (for file upload fields)
 */
export function useWorkflowEngine({
  token,
  workflowName,
  apiUrl = "",
  app = "pa-admin",
  role = "admin",
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

    const url = `${apiUrl}/api/v1/n8n/schema/${encodeURIComponent(workflowName)}?app=${app}&role=${role}`;
    fetch(url, { headers: authHeaders() })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw json;
        return json;
      })
      .then((raw) => {
        const v1 = adaptSchema(raw);
        setSchema(v1);
        setValues(initValues(v1));
      })
      .catch(() => {
        setSchemaError("Failed to load workflow schema.");
        setSchema(null);
      })
      .finally(() => setLoadingSchema(false));
  }, [workflowName, token, apiUrl, app, role]);

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
      // Priority 1: If workflow declares a direct backend submit URL, POST there
      if (schema.submitUrl) {
        const r = await fetch(`${apiUrl}${schema.submitUrl}`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });
        const data = await r.json();
        if (!r.ok) throw data;
        setResult({ success: true, data });
        return;
      }

      // Priority 2: Custom execution adapter (legacy / custom routing)
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

      // Priority 3: Default — POST to /api/v1/n8n/trigger/{workflow}
      const triggerUrl = `${apiUrl}/api/v1/n8n/trigger/${encodeURIComponent(workflowName)}?app=${app}&role=${role}`;
      const r = await fetch(triggerUrl, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ data: payload, test_mode: testMode }),
      });
      const data = await r.json();
      if (!r.ok) throw data;
      setResult({ success: true, data });
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
