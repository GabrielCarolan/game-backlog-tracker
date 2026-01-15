const API_BASE = "http://localhost:5045";

async function parseError(res) {
  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    let errJson;
    try {
      errJson = await res.json();
    } catch {
      // If content-type says JSON but body isn't valid JSON
      const text = await res.text();
      return text.slice(0, 200);
    }
    return (
      errJson.title ||
      (errJson.errors ? JSON.stringify(errJson.errors) : JSON.stringify(errJson))
    );
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

// GET /api/games
export function getGames() {
  return requestJson("/api/games");
}

// POST /api/games
export function addGame(game) {
  return requestJson("/api/games", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(game),
  });
}

// DELETE /api/games/{id}
export async function deleteGame(id) {
  await requestJson(`/api/games/${id}`, { method: "DELETE" });
}

// PUT /api/games/{id}
export async function updateGame(id, game) {
  await requestJson(`/api/games/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(game),
  });
}
