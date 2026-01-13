// - useState: lets this component store state (data that changes over time)
// - useEffect: lets this component run side-effects (like fetching data)
// - getGames: your API helper that calls the backend
import { useEffect, useState } from "react";
import { getGames, addGame } from "./api/gamesApi";

// A React component is just a function that returns UI
function App() {
  // List Status
  // games   -> array of games from the API
  // loading -> whether the API call is still in progress
  // error   -> error message if something goes wrong
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //Form state
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [status, setStatus] = useState(0); // 0,1,2,3... depends on your enum
  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Reusable loader (so we can refresh after POST)
  async function loadGames() {
    setError("");
    const data = await getGames();
    setGames(data);
  }

  // useEffect with [] runs once when the component first mounts
  useEffect(() => {
    // We wrap async logic in an IIFE because useEffect itself
    // cannot be marked async
    (async () => {
      try {
        //Call the backend API
        const data = await getGames();
        // Store the result in state (triggers re-render)
        setGames(data);
      } catch (e) {
        // If something fails, store a readable error message
        setError(e?.message ?? "Something went wrong");
      } finally {
        // Whether success or failure, stop the loading state
        setLoading(false);
      }
    })();
  }, []); // Empty dependency array = run once

  async function handleSubmit(e) {
    e.preventDefault(); // prevents full page refresh
    setFormError("");

    // Tiny client-side check (backend will also validate)
    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }

    setSubmitting(true);
    try {
      // Build the DTO we send to the API
      // (We send numbers as numbers; optional fields can be null/omitted)
      const newGameDto = {
        title: title.trim(),
        platform: platform.trim() || null,
        releaseYear: releaseYear ? Number(releaseYear) : null,
        status: Number(status),
        rating: rating ? Number(rating) : null,
        notes: notes.trim() || null,
      };

      await addGame(newGameDto);

      //Clear the form
      setTitle("");
      setPlatform("");
      setReleaseYear("");
      setStatus(0);
      setRating("");
      setNotes("");

      // Refresh list from server (ensures we get the new ID, etc.)
      await loadGames();
    } catch (e2) {
      setFormError(e2?.message ?? "Failed to add game");
    } finally {
      setSubmitting(false);
    }
    
  }

  // React re-runs this whenever state changes
  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 700 }}>
      <h1>Game Backlog</h1>

      {/* Add Game Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 16, padding: 12, border: "1px solid #ddd"}}>
        <h2 style={{ marginTop: 0 }}>Add a Game</h2>

        {formError && <p style={{ color: "crimson" }}>{formError}</p>}

        <div style={{ display: "grid", gap: 8}}>
          <label>
            Title (required)
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", padding: 8}}
            />
          </label>

          <label>
            Platform
            <input
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              style={{ width: "100%", padding: 8}}
            />
          </label>

          <label>
            Release Year
            <input
              value={releaseYear}
              onChange={(e) => setReleaseYear(e.target.value)}
              inputMode="numeric"
              style={{ width: "100%", padding: 8 }}
            />
          </label>

          <label>
            Status 
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            >
              {/* These labels are just UI; the numbers must match your backend enum */}
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
              style={{ width: "100%", padding: 8}}
              />
          </label>

          <button type="submit" disabled={submitting} style={{ padding: 10}}>
            {submitting ? "Adding..." : "Add Game"}
          </button>
        </div>
      </form>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && (
        games.length === 0 ? (
          //No games case
          <p>No games yet.</p>
        ) : (
          // Games list
          <ul>
            {games.map((g) => (
              <li key={g.id}>
                <strong>{g.title ?? "(No title)"}</strong>
                {g.platform ? ` — ${g.platform}` : ""}
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}

// Makes this component available to the rest of the app
export default App;
