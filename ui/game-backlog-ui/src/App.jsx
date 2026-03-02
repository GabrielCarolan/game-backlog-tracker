import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import "./App.css";

function navLinkClassName({ isActive }) {
  return isActive ? "app-nav-link active" : "app-nav-link";
}

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Game Backlog</h1>
        <NavLink to="/user" className={navLinkClassName}>
          User
        </NavLink>
        <NavLink to="/admin" className={navLinkClassName}>
          Admin
        </NavLink>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/user" replace />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<p>Not Found</p>} />
      </Routes>
    </div>
  );
}
