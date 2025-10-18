import { Link } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";
import { logout } from "../../lib/auth";

export default function Navbar() {
  const { data } = useAuth();
  const loggedIn = data && data.ok;
  async function handleLogout() {
    await logout();
    window.location.reload();
  }

  return (
    <nav className="navbar">
      <span className="navbar-title">HR MVP</span>
      {loggedIn && (
        <div style={{ marginLeft: "2rem", display: "flex", gap: "1rem" }}>
          <Link
            to="/profile"
            className="btn"
            style={{ background: "#fff", color: "#2563eb" }}
          >
            Profile
          </Link>
          <Link
            to="/absences"
            className="btn"
            style={{ background: "#fff", color: "#2563eb" }}
          >
            Absences
          </Link>
          <Link
            to="/feedback"
            className="btn"
            style={{ background: "#fff", color: "#2563eb" }}
          >
            Feedback
          </Link>
          <Link
            to="/employees"
            className="btn"
            style={{ background: "#fff", color: "#2563eb" }}
          >
            Employees
          </Link>
          <button
            className="btn"
            style={{ background: "#2563eb", color: "#fff" }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
