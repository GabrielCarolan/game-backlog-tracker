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
      // If content-type says JSON but body isn't valid JSON
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

  // 204 No Content (common for PUT/DELETE)
  if (res.status === 204) return null;

  // Some successful responses may have no body
  const contentLength = res.headers.get("content-length");
  if (contentLength === "0") return null;

  // Default: assume JSON on success
  return await res.json();
}

// GET /api/log
export function getLog() {
    return requestJson("/api/log");
}

// POST /api/log
// DTO: { gameId, platform, status, rating, notes}
export function addToLog(log) {
    return requestJson("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(log),
    });
}

// PUT /api/log/{id}
// DTO: {platform, status, rating, notes } 
export async function updateLogEntry(id, log) {
    await requestJson(`/api/log/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(log),
    });
}

// DELETE /api/log/{id}
export async function deleteLogEntry(id) {
    await requestJson(`/api/log/${id}`, { method: "DELETE" });
}
