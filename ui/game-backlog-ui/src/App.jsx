import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";

const linkStyle = ({ isActive }) => ({
  padding: "8px 12px",
  border: "1px solid #ddd",
  borderRadius: 8,
  textDecoration: "none",
  color: "inherit",
  background: isActive ? "#f3f3f3" : "transparent",
});

export default function App() {
  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", maxWidth: 1000, margin: "0 auto"}}>
      <header style= {{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16}}>
        <h1 style={{margin: 0, marginRight: 12}}>Game Backlog</h1>
        <NavLink to="/user" style={linkStyle}>User</NavLink>
        <NavLink to="/admin" style={linkStyle}>Admin</NavLink>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/user" replace/>} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element= {<p>Not Found</p>} />
      </Routes>
    </div>
  )
}