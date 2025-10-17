import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "../../lib/api";
import { useNavigate } from "react-router-dom";

export default function ProfileView() {
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getMyProfile,
    retry: false,
  });
  const navigate = useNavigate();

  if (isLoading) return <div className="card">Loading profile...</div>;
  if (!data || !data.ok)
    return <div className="alert">Could not load profile.</div>;

  const { profile, user } = data;

  return (
    <div className="card" style={{ maxWidth: 500, margin: "2rem auto" }}>
      <h2 style={{ marginBottom: "1rem" }}>{user?.name || "My Profile"}</h2>
      <button
        className="btn"
        style={{ float: "right", marginTop: "-2.5rem" }}
        onClick={() => navigate("/profile/edit")}
      >
        Edit Profile
      </button>
      <div style={{ marginBottom: ".5rem" }}>
        <strong>Email:</strong> {user?.email}
      </div>
      <div style={{ marginBottom: ".5rem" }}>
        <strong>Role:</strong> {user?.role}
      </div>
      <div style={{ marginBottom: ".5rem" }}>
        <strong>Department:</strong> {user?.department}
      </div>
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
    </div>
  );
}
