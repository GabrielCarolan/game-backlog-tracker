const TOKEN_KEY = "gameBacklogToken";
const ROLE_KEY = "gameBacklogRole";
const AUTH_CHANGED_EVENT = "gameBacklogAuthChanged";


// Dispatches that custom event whenever login/logout changes storage
function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

// localStorage keeps the auth token available across refreshes and browser restarts,
// unlike a normal JS variable which disappears when the page is reloaded or closed.
export function getAuthToken() {
  return window.localStorage.getItem(TOKEN_KEY) ?? "";
}

export function getAuthRole() {
  return window.localStorage.getItem(ROLE_KEY) ?? "";
}

export function setAuthSession({ token, role }) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(ROLE_KEY, role ?? "");
  notifyAuthChanged();
}

export function clearAuthSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(ROLE_KEY);
  notifyAuthChanged();
}

export function subscribeToAuthChanges(callback) {
  window.addEventListener(AUTH_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AUTH_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
