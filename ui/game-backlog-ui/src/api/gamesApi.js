// A constant string holding the base URL of your backend API.
// "const" means this variable cannot be reassigned.
// Equivalent to: const string ApiBase = "..."; in C#
const API_BASE = "http://localhost:5045";

// "export" means other files can import this function.
// "async" means:
//   - this function can use "await"
//   - it returns a Promise (similar to Task<T> in C#)
export async function getGames() {

    // "fetch" sends an HTTP request.
    // By default, fetch() makes a GET request.
    // The string uses a *template literal* (string interpolation):
    // `${API_BASE}/api/games`
    // is equivalent to C#: $"{API_BASE}/api/games"
    //
    // "await" pauses execution until the HTTP request completes.
    // "res" is the HTTP response object.
    const res = await fetch(`${API_BASE}/api/games`);

    // "res.ok" is a boolean provided by fetch.
    // It is TRUE for status codes 200–299.
    // The "!" means "not".
    // So this reads:
    //   "If the response status is NOT successful..."
    if (!res.ok) {
        // Read the response body as plain text.
        // We do NOT use res.json() here because error responses
        // are often HTML or plain text, not JSON.
        const text = await res.text();
        // "throw" is the JavaScript equivalent of throwing an exception in C#.
        // "new Error(...)" creates an Error object.
        // The template string includes:
        //   - the HTTP status code
        //   - the first 120 characters of the response body
        //
        // text.slice(0, 120) means:
        //   "take a substring from index 0 up to index 120"
        // (similar to text.Substring(0, 120) in C#)
        throw new Error(`API error ${res.status}: ${text.slice(0, 120)}`);
    }

    // If we reach this line, the response was successful (2xx).
    // res.json() reads the response body and parses it as JSON.
    // It returns a JavaScript object or array.
    // "await" waits for the parsing to finish.
    // "return" sends the parsed data back to the caller.
    return await res.json();
}

// POST /api/games
export async function addGame(game) {
    const res = await fetch(`${API_BASE}/api/games`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(game),
    });

    if (!res.ok) {
        // Try to read error details (often JSON, somtimes text)
        const contentType = res.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) 
        {
            const errJson = await res.json();

            // Common ASP.NET validation format includes "title" and/or "errors"
            const message =
                errJson.title || (errJson.errors ? JSON.stringify(errJson.errors) : JSON.stringify(errJson));

            throw new Error(`API error ${res.status}: ${message}`);
        } else {
            const text = await res.text();
            throw new Error(`API error ${res.status}: ${text.slice(0, 200)}`);
        }
    }

    // Your API likely returns the created game (201 Created)
    return await res.json();
}

