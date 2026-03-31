import { useEffect, useState } from "react";
import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import { getAuthRole, subscribeToAuthChanges } from "./api/authStorage";
import "./App.css";

function navLinkClassName({ isActive }) {
  return isActive ? "app-nav-link active" : "app-nav-link";
}

export default function App() {
  const [role, setRole] = useState(() => getAuthRole());

  useEffect(() => {
    return subscribeToAuthChanges(() => { // Function to change the role
      setRole(getAuthRole());
    });
  }, []); // Call once on mount to subscribe to auth changes  

  const isAdmin = role === "Admin";

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Game Backlog</h1>
        <NavLink to="/user" className={navLinkClassName}>
          User
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin" className={navLinkClassName}>
            Admin
          </NavLink>
        )}
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/user" replace />} />
        <Route path="/user" element={<UserPage />} />
        <Route
          path="/admin"
          element={isAdmin ? <AdminPage /> : <Navigate to="/user" replace />}
        />
        <Route path="*" element={<p>Not Found</p>} />
      </Routes>
    </div>
  );
}
