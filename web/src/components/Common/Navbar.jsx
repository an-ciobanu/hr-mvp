import { Link } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";

export default function Navbar() {
  const { data } = useAuth();
  const loggedIn = data && data.ok;
  const isManager = loggedIn && data.user?.role === "manager";

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
          {isManager && (
            <Link
              to="/manager"
              className="btn"
              style={{ background: "#fff", color: "#2563eb" }}
            >
              Manager Panel
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
