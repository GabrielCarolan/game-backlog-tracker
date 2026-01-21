import { useEffect, useMemo, useState } from "react";
import { getGames } from "../api/gamesApi";
import { getLog, addToLog, deleteLogEntry } from "../api/logApi";

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
    // Data from API
    const [games, setGames] = useState([]);
    const [log, setLog] = useState ([]);

    // Loading/error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("")

    // Add-to-log form state
    const [selectedGameId, setSelectedGameId] = useState("");
    const [platform, setPlatform] = useState("");
    const [status, setStatus] = useState(0);
    const [rating, setRating] = useState("");
    const [notes, setNotes] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    // Build a lookup map: gameId -> title (so we can show titles in the log list)
    const gameTitleById = useMemo(() => {
        const map = new Map();
        for (const g of games) {
            map.set(g.id, g.title ?? ` (Game ${g.id})`);
        }

        return map;
    }, [games]);

    // Load both catalog + log
    async function loadAll() {
        setError("");
        const [gamesData, logData] = await Promise.all([getGames(), getLog()]);
        setGames(gamesData);
        setLog(logData);
    }

    useEffect(() => {
        (async () => {
            try {
                await loadAll();
            } catch (e) {
                setError(e?.message ?? "Failed to load games")
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    function handleGameSelect(e) {
        const newId = e.target.value; //always a string
        setSelectedGameId(newId);

        // Auto-fill platform IF the input is currently empty
        // (so we don't overwrite something the user already typed)
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

            // reset form
            setSelectedGameId("");
            setPlatform("");
            setStatus(0);
            setRating("");
            setNotes("");

            await loadAll();
            } catch (e2) {
                setFormError(e2?.message ?? "Failed to add to log");
            } finally {
                setSubmitting(false);
            }
        }

        async function handleRemove(entry) {
            const title =  
                entry.game?.title ??
                gameTitleById.get(entry.gameId) ??
                `GameId ${entry.gameId}`;

            const confirmed = window.confirm(`Remove "${title}" from log?`);
            if (!confirmed) return;

            try {
                await deleteLogEntry(entry.id);
                await loadAll();
            } catch (e) {
                alert(e?.message ?? "Failed to remove entry");
            }
        }

    return (
        <div style={{ maxWidth: 900 }}>
            <h2>User Mode</h2>
            <p style={{ marginTop: -8, color: "#555" }}>
                Browse games and manage your log (coming next).
            </p>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "crimson" }}>{error}</p>}

            {!loading && !error && (
                <div style={{ display: "grid" , gap: 16}}>
                    {/* Add to Log */}
                    <section style={{padding: 12, border: "1px solid #ddd" }}>
                        <h3 style={{ marginTop: 0 }}>Add a Game to My Log</h3>

                        {formError && <p style={{ color: "crimson" }}>{formError}</p>}

                        <form onSubmit={handleAddToLog} style={{ display: "grid", gap: 8 }}>
                            <label>
                                Game (required)
                                <select
                                    value={selectedGameId}
                                    onChange={handleGameSelect}
                                    style={{ width: "100%", padding: 8 }}
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
                                    style={{ width: "100%", padding: 8 }}
                                />
                            </label>

                            <label>
                                Notes (optional)
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    style={{ width: "100%", padding: 8 }}
                                />
                            </label>

                            <button type="submit" disabled={submitting} style={{ padding: 10 }}>
                                {submitting ? "Adding..." : "Add to Log"}
                            </button>
                        </form>
                    </section>

                    {/* My Log*/}
                    <section style={{ padding: 12, border: "1px solid #ddd"}}>
                        <h3 style={{marginTop: 0 }}>My Log</h3>

                        {log.length === 0 ? (
                            <p>No log entries yet.</p>
                        ) : (
                            <ul style={{ paddingLeft: 18 }}>
                                {log.map((entry) => {
                                    const title =
                                        entry.game?.title ?? 
                                        gameTitleById.get(entry.gameId) ??
                                        `Game Id ${entry.gameId}`;

                                    return (
                                        <li key={entry.id} style={{ marginBottom: 12}}>
                                            <div>
                                                <strong>{title}</strong>
                                                {entry.platform ? ` - ${entry.platform}` : ""}
                                            </div>

                                            <div style={{ color: "#555", marginTop: 4}}>
                                                {statusLabel(entry.status)}
                                                {entry.rating != null ?  ` • Rating: ${entry.rating}` : ""}
                                                {entry.notes ? ` • ${entry.notes}` : ""}
                                            </div>

                                            <div style={{ marginTop : 6 }}>
                                                <button type="button" onClick={() => handleRemove(entry)}>
                                                    Remove
                                                </button>
                                                {/*Next: Edit log entry (PUT /api/log/{id} */}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>

                    {/*Optional: Browse Catalog (read-only) */}
                    <section style={{ padding: 12, border: "1px solid #ddd"}}>
                        <h3 style={{ marginTop: 0 }}>Browse Catalog</h3>
                        {games.length === 0 ? (
                            <p>No games in the catalog yet.</p>
                        ) : (
                            <ul style={{ paddingLeft: 18 }}>
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