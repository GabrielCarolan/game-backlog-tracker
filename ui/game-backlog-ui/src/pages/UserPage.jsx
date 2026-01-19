import { useEffect, useState } from "react";
import { getGames } from "../api/gamesApi";

export default function UserPage() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("")

    useEffect(() => {
        (async () => {
            try {
                const data = await getGames();
                setGames(data);
            } catch (e) {
                setError(e?.message ?? "Failed to load games")
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div style={{ maxWidth: 900 }}>
            <h2>User Mode</h2>
            <p style={{ marginTop: -8, color: "#555" }}>
                Browse games and manage your log (coming next).
            </p>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "crimson" }}>{error}</p>}

            {!loading && !error && (
                games.length === 0 ? (
                    <p>No games in the catalog yet. </p>
                ) : (
                    <ul>
                        {games.map((g) => (
                            <li key={g.id}>
                                <strong>{g.title}</strong>
                                {g.releaseYear ? `(${g.releaseYear})` : ""}
                            </li>
                        ))}
                    </ul>
                )
            )};
        </div>
    )
}