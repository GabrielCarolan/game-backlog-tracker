import { useEffect, useMemo, useState } from "react";
import { getGames } from "../api/gamesApi";
import { getLog, addToLog, updateLogEntry, deleteLogEntry } from "../api/logApi";
import { login, register } from "../api/authApi";
import { clearAuthToken, getAuthToken, setAuthToken } from "../api/authStorage";
import "./UserPage.css";

function statusLabel(statusNum) {
  switch (Number(statusNum)) {
    case 0:
      return "Not Played";
    case 1:
      return "Backlogged";
    case 2:
      return "Playing";
    case 3:
      return "Played";
    default:
      return `Status ${statusNum}`;
  }
}

export default function UserPage() {
  const [games, setGames] = useState([]);
  const [log, setLog] = useState([]);
  const [token, setToken] = useState(() => getAuthToken());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [selectedGameId, setSelectedGameId] = useState("");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState(0);
  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [editPlatform, setEditPlatform] = useState("");
  const [editStatus, setEditStatus] = useState(0);
  const [editRating, setEditRating] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const gameTitleById = useMemo(() => {
    const map = new Map();
    for (const g of games) {
      map.set(g.id, g.title ?? ` (Game ${g.id})`);
    }
    return map;
  }, [games]);

  async function loadAll() {
    setError("");
    const gamesData = await getGames();
    setGames(gamesData);

    if (!token) {
      setLog([]);
      return;
    }

    const logData = await getLog();
    setLog(logData);
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await loadAll();
      } catch (e) {
        setError(e?.message ?? "Failed to load games");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError("");
    setAuthSubmitting(true);

    try {
      const authRequest = {
        email: authEmail.trim(),
        password: authPassword,
      };

      const authResponse =
        authMode === "register"
          ? await register(authRequest)
          : await login(authRequest);

      setAuthToken(authResponse.token);
      setToken(authResponse.token);
      setAuthPassword("");
      setError("");
    } catch (e2) {
      setAuthError(e2?.message ?? "Authentication failed");
    } finally {
      setAuthSubmitting(false);
    }
  }

  function handleLogout() {
    clearAuthToken();
    setToken("");
    setLog([]);
    setAuthPassword("");
    setAuthError("");
  }

  function handleGameSelect(e) {
    const newId = e.target.value;
    setSelectedGameId(newId);

    if (!platform.trim() && newId) {
      const selected = games.find((g) => String(g.id) === String(newId));
      const defaultPlatform = selected?.platform ?? "";
      if (defaultPlatform) setPlatform(defaultPlatform);
    }
  }

  async function handleAddToLog(e) {
    e.preventDefault();
    setFormError("");

    if (!selectedGameId) {
      setFormError("Choose a game first.");
      return;
    }

    setSubmitting(true);
    try {
      const logDto = {
        gameId: Number(selectedGameId),
        platform: platform.trim() || null,
        status: Number(status),
        rating: rating ? Number(rating) : null,
        notes: notes.trim() || null,
      };

      await addToLog(logDto);

      setSelectedGameId("");
      setPlatform("");
      setStatus(0);
      setRating("");
      setNotes("");

      await loadAll();
    } catch (e2) {
      if (e2?.message?.includes("401")) {
        clearAuthToken();
        setToken("");
      }
      setFormError(e2?.message ?? "Failed to add to log");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(entry) {
    setEditError("");
    setEditingId(entry.id);

    setEditPlatform(entry.platform ?? "");
    setEditStatus(entry.status ?? 0);
    setEditRating(entry.rating ?? "");
    setEditNotes(entry.notes ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError("");
  }

  async function saveEdit(id) {
    setEditError("");
    setEditSaving(true);

    try {
      const dto = {
        platform: editPlatform.trim() || null,
        status: Number(editStatus),
        rating: editRating ? Number(editRating) : null,
        notes: editNotes.trim() || null,
      };

      await updateLogEntry(id, dto);

      setEditingId(null);
      await loadAll();
    } catch (e2) {
      if (e2?.message?.includes("401")) {
        clearAuthToken();
        setToken("");
      }
      setEditError(e2?.message ?? "Failed to update log entry");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleRemove(entry) {
    const title = entry.game?.title ?? gameTitleById.get(entry.gameId) ?? `GameId ${entry.gameId}`;

    const confirmed = window.confirm(`Remove "${title}" from log?`);
    if (!confirmed) return;

    try {
      await deleteLogEntry(entry.id);
      await loadAll();
    } catch (e) {
      if (e?.message?.includes("401")) {
        clearAuthToken();
        setToken("");
      }
      alert(e?.message ?? "Failed to remove entry");
    }
  }

  return (
    <div className="user-page">
      <h2>User Mode</h2>
      <p className="page-subtitle">Browse games and manage your personal log.</p>

      <section className="section-card auth-card">
        <div className="auth-header-row">
          <div>
            <h3 className="section-title">Account</h3>
            <p className="meta-text">
              {token ? "You are signed in for log access." : "Sign in to use your log."}
            </p>
          </div>

          {token && (
            <button type="button" onClick={handleLogout} className="btn">
              Log Out
            </button>
          )}
        </div>

        {!token && (
          <>
            <div className="auth-toggle-row">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={authMode === "login" ? "btn auth-toggle-active" : "btn"}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={authMode === "register" ? "btn auth-toggle-active" : "btn"}
              >
                Register
              </button>
            </div>

            {authError && <p className="text-error">{authError}</p>}

            <form onSubmit={handleAuthSubmit} className="form-grid">
              <label>
                Email
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="field-control"
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="field-control"
                />
              </label>

              <button type="submit" disabled={authSubmitting} className="btn">
                {authSubmitting
                  ? authMode === "register"
                    ? "Registering..."
                    : "Logging in..."
                  : authMode === "register"
                    ? "Create Account"
                    : "Login"}
              </button>
            </form>
          </>
        )}
      </section>

      {loading && <p>Loading...</p>}
      {error && <p className="text-error">{error}</p>}

      {!loading && !error && (
        <div className="page-sections">
          {!token ? (
            <section className="section-card">
              <h3 className="section-title">My Log</h3>
              <p className="meta-text">Log features unlock after login.</p>
            </section>
          ) : (
            <>
          <section className="section-card">
            <h3 className="section-title">Add a Game to My Log</h3>

            {formError && <p className="text-error">{formError}</p>}

            <form onSubmit={handleAddToLog} className="form-grid">
              <label>
                Game (required)
                <select
                  value={selectedGameId}
                  onChange={handleGameSelect}
                  className="field-control"
                >
                  <option value="">-- Choose a game --</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                      {g.releaseYear ? ` (${g.releaseYear})` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Platform (optional)
                <input
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="field-control"
                />
              </label>

              <label>
                Status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="field-control"
                >
                  <option value={0}>Not Played</option>
                  <option value={1}>Backlogged</option>
                  <option value={2}>Playing</option>
                  <option value={3}>Played</option>
                </select>
              </label>

              <label>
                Rating (optional)
                <input
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  inputMode="numeric"
                  className="field-control"
                />
              </label>

              <label>
                Notes (optional)
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="field-control"
                />
              </label>

              <button type="submit" disabled={submitting} className="btn">
                {submitting ? "Adding..." : "Add to Log"}
              </button>
            </form>
          </section>

          <section className="section-card">
            <h3 className="section-title">My Log</h3>

            {log.length === 0 ? (
              <p>No log entries yet.</p>
            ) : (
              <ul className="log-list">
                {log.map((entry) => {
                  const title =
                    entry.game?.title ?? gameTitleById.get(entry.gameId) ?? `Game Id ${entry.gameId}`;

                  return (
                    <li key={entry.id} className="log-list-item">
                      {editingId === entry.id ? (
                        <div className="edit-card">
                          <strong>Editing</strong>

                          {editError && <p className="text-error">{editError}</p>}

                          <div className="form-grid">
                            <label>
                              Platform
                              <input
                                value={editPlatform}
                                onChange={(e) => setEditPlatform(e.target.value)}
                                className="field-control"
                              />
                            </label>

                            <label>
                              Status
                              <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                className="field-control"
                              >
                                <option value={0}>Not Played</option>
                                <option value={1}>Backlogged</option>
                                <option value={2}>Playing</option>
                                <option value={3}>Played</option>
                              </select>
                            </label>

                            <label>
                              Rating
                              <input
                                value={editRating}
                                onChange={(e) => setEditRating(e.target.value)}
                                inputMode="numeric"
                                className="field-control"
                              />
                            </label>

                            <label>
                              Notes
                              <textarea
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                rows={3}
                                className="field-control"
                              />
                            </label>

                            <div className="actions-row">
                              <button
                                type="button"
                                onClick={() => saveEdit(entry.id)}
                                disabled={editSaving}
                              >
                                {editSaving ? "Saving..." : "Save"}
                              </button>
                              <button type="button" onClick={() => cancelEdit} disabled={editSaving}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div>
                            <strong>{title}</strong>
                            {entry.platform ? ` - ${entry.platform}` : ""}
                          </div>

                          <div className="meta-text">
                            {statusLabel(entry.status)}
                            {entry.rating != null ? ` • Rating: ${entry.rating}` : ""}
                            {entry.notes ? ` • ${entry.notes}` : ""}
                          </div>

                          <div className="actions-row-spaced">
                            <button
                              type="button"
                              onClick={() => startEdit(entry)}
                              className="mr-8"
                            >
                              Edit
                            </button>
                            <button type="button" onClick={() => handleRemove(entry)}>
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
            </>
          )}

          <section className="section-card">
            <h3 className="section-title">Browse Catalog</h3>
            {games.length === 0 ? (
              <p>No games in the catalog yet.</p>
            ) : (
              <ul className="log-list">
                {games.map((g) => (
                  <li key={g.id}>
                    <strong>{g.title}</strong>
                    {g.releaseYear ? ` (${g.releaseYear})` : ""}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
