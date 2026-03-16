const API_BASE = "http://localhost:5045";

async function parseError(res) {
  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const errJson = await res.json();
      return (
        errJson.title ||
        (errJson.errors ? JSON.stringify(errJson.errors) : JSON.stringify(errJson))
      );
    } catch {
      const text = await res.text();
      return text.slice(0, 200);
    }
  }

  const text = await res.text();
  return text.slice(0, 200);
}

async function requestJson(path, options) {
  const res = await fetch(`${API_BASE}${path}`, options);

  if (!res.ok) {
    const message = await parseError(res);
    throw new Error(`API error ${res.status}: ${message}`);
  }

  return await res.json();
}

export function register(request) {
  return requestJson("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

export function login(request) {
  return requestJson("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}
