// - useState: lets this component store state (data that changes over time)
// - useEffect: lets this component run side-effects (like fetching data)
// - getGames: your API helper that calls the backend
import { useEffect, useState } from "react";
import { getGames } from "./api/gamesApi";

// A React component is just a function that returns UI
function App() {
  // games   -> array of games from the API
  // loading -> whether the API call is still in progress
  // error   -> error message if something goes wrong
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // React re-runs this whenever state changes
  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h1>Game Backlog</h1>

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
