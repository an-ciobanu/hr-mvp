import { useNavigate } from "react-router-dom";

/**
 * ProfileView displays a user's profile.
 * @param {object} props
 * @param {object} props.profile - Profile data
 * @param {object} [props.user] - User data (optional)
 * @param {array} [props.feedback] - Feedback array (optional)
 */
export default function ProfileView({ profile, user, feedback }) {
  const navigate = useNavigate();

  if (!profile) return <div className="alert">No profile data.</div>;

  return (
    <div className="card" style={{ maxWidth: 500, margin: "2rem auto" }}>
      <h2 style={{ marginBottom: "1rem" }}>{user?.name || "My Profile"}</h2>
      {user && (
        <button
          className="btn"
          style={{ float: "right", marginTop: "-2.5rem" }}
          onClick={() => navigate("/profile/edit")}
        >
          Edit Profile
        </button>
      )}
      {user && (
        <div style={{ marginBottom: ".5rem" }}>
          <strong>Email:</strong> {user.email}
        </div>
      )}
      {user && (
        <div style={{ marginBottom: ".5rem" }}>
          <strong>Role:</strong> {user.role}
        </div>
      )}
      {user && (
        <div style={{ marginBottom: ".5rem" }}>
          <strong>Department:</strong> {user.department}
        </div>
      )}
      <hr />
      <div style={{ marginBottom: ".5rem" }}>
        <strong>Phone:</strong> {profile.phone}
      </div>
      <div style={{ marginBottom: ".5rem" }}>
        <strong>Address:</strong> {profile.address}
      </div>
      <div style={{ marginBottom: ".5rem" }}>
        <strong>Emergency Contact:</strong> {profile.emergency_contact?.name} (
        {profile.emergency_contact?.relationship}),{" "}
        {profile.emergency_contact?.phone}
      </div>
      <div style={{ marginBottom: ".5rem" }}>
        <strong>Bio:</strong> {profile.bio}
      </div>
      <div style={{ marginBottom: ".5rem" }}>
        <strong>Start Date:</strong> {profile.start_date}
      </div>
      {profile.salary_sensitive && (
        <div style={{ marginBottom: ".5rem" }}>
          <strong>Salary:</strong> {profile.salary_sensitive.amount}{" "}
          {profile.salary_sensitive.currency}
        </div>
      )}
      {!Array.isArray(feedback) && feedback !== null && (
        <div className="alert" style={{ color: "red" }}>
          Feedback data is not an array: {JSON.stringify(feedback)}
        </div>
      )}
      {Array.isArray(feedback) && feedback.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Feedback Received</h3>
          <ul className="space-y-2">
            {feedback.map((fb) => (
              <li key={fb.id} className="border p-2 rounded">
                <div>
                  <strong>From:</strong> {fb.author_user_id}
                </div>
                <div>
                  <strong>Message:</strong> {fb.body_polished || fb.body_raw}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(fb.created_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
