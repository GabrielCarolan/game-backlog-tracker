import { useEffect, useState } from "react";
import { getGames, addGame, deleteGame, updateGame } from "../api/gamesApi";
import "./AdminPage.css";

export default function AdminPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPlatform, setEditPlatform] = useState("");
  const [editReleaseYear, setEditReleaseYear] = useState("");
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  async function loadGames() {
    setError("");
    const data = await getGames();
    setGames(data);
  }

  useEffect(() => {
    (async () => {
      try {
        await loadGames();
      } catch (e) {
        setError(e?.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }

    setSubmitting(true);
    try {
      const newGameDto = {
        title: title.trim(),
        platform: platform.trim() || null,
        releaseYear: releaseYear ? Number(releaseYear) : null,
      };

      await addGame(newGameDto);

      setTitle("");
      setPlatform("");
      setReleaseYear("");

      await loadGames();
    } catch (e2) {
      setFormError(e2?.message ?? "Failed to add game");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id, titleValue) {
    const confirmed = window.confirm(`Are you sure you want to delete "${titleValue}"?`);
    if (!confirmed) return;

    try {
      await deleteGame(id);
      await loadGames();
    } catch (e) {
      alert(e?.message ?? "Failed to delete game");
    }
  }

  function startEdit(game) {
    setEditError("");
    setEditingId(game.id);

    setEditTitle(game.title ?? "");
    setEditPlatform(game.platform ?? "");
    setEditReleaseYear(game.releaseYear ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError("");
  }

  async function saveEdit(id) {
    setEditError("");
    setEditSaving(true);

    try {
      if (!editTitle.trim()) {
        setEditError("Title is required.");
        return;
      }

      const updateDto = {
        title: editTitle.trim(),
        platform: editPlatform.trim() || null,
        releaseYear: editReleaseYear ? Number(editReleaseYear) : null,
      };

      await updateGame(id, updateDto);

      setEditingId(null);
      await loadGames();
    } catch (e) {
      setEditError(e?.message ?? "Failed to update game");
    } finally {
      setEditSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <h2>Admin Mode</h2>
      <p className="page-subtitle">Manage the game catalog (add/edit/delete).</p>

      <form onSubmit={handleSubmit} className="form-card">
        <h3 className="form-title">Add a Game</h3>
        {formError && <p className="text-error">{formError}</p>}

        <div className="form-grid">
          <label>
            Title (required)
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="field-control"
            />
          </label>

          <label>
            Platform
            <input
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="field-control"
            />
          </label>

          <label>
            Release Year
            <input
              value={releaseYear}
              onChange={(e) => setReleaseYear(e.target.value)}
              inputMode="numeric"
              className="field-control"
            />
          </label>

          <button type="submit" disabled={submitting} className="btn">
            {submitting ? "Adding..." : "Add Game"}
          </button>
        </div>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="text-error">{error}</p>}

      {!loading &&
        !error &&
        (games.length === 0 ? (
          <p>No games yet.</p>
        ) : (
          <ul>
            {games.map((g) => (
              <li key={g.id} className="game-list-item">
                {editingId === g.id ? (
                  <div className="edit-card">
                    <strong>Editing</strong>
                    {editError && <p className="text-error">{editError}</p>}

                    <div className="form-grid">
                      <label>
                        Title
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="field-control"
                        />
                      </label>

                      <label>
                        Platform
                        <input
                          value={editPlatform}
                          onChange={(e) => setEditPlatform(e.target.value)}
                          className="field-control"
                        />
                      </label>

                      <label>
                        Release Year
                        <input
                          value={editReleaseYear}
                          onChange={(e) => setEditReleaseYear(e.target.value)}
                          inputMode="numeric"
                          className="field-control"
                        />
                      </label>

                      <div className="actions-row">
                        <button
                          type="button"
                          onClick={() => saveEdit(g.id)}
                          disabled={editSaving}
                        >
                          {editSaving ? "Saving..." : "Save"}
                        </button>
                        <button type="button" onClick={cancelEdit} disabled={editSaving}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <strong>{g.title ?? "(No title)"}</strong>
                    {g.platform ? ` - ${g.platform}` : ""}
                    <div className="actions-row-spaced">
                      <button
                        type="button"
                        onClick={() => startEdit(g)}
                        className="mr-8"
                      >
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(g.id, g.title)}>
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}
