import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyProfile } from "../../lib/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfileEdit() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getMyProfile,
    retry: false,
  });

  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Set form state when data loads
  if (!form && data && data.ok) {
    setForm({
      phone: data.profile.phone || "",
      address: data.profile.address || "",
      emergency_contact: data.profile.emergency_contact || {
        name: "",
        phone: "",
        relationship: "",
      },
      bio: data.profile.bio || "",
      start_date: data.profile.start_date || "",
    });
  }

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${baseUrl}/api/profiles/${data.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Update failed");
      return result;
    },
    onSuccess: () => {
      setSuccess(true);
      setError("");
      queryClient.invalidateQueries(["me"]);
    },
    onError: (err) => {
      setError(err.message);
      setSuccess(false);
    },
  });

  if (isLoading || !form) return <div className="card">Loading...</div>;

  function handleChange(e) {
    const { name, value } = e.target;
    if (name.startsWith("emergency_contact.")) {
      const key = name.split(".")[1];
      setForm((f) => ({
        ...f,
        emergency_contact: { ...f.emergency_contact, [key]: value },
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    mutation.mutate(form);
  }

  return (
    <form
      className="card"
      style={{ maxWidth: 500, margin: "2rem auto" }}
      onSubmit={handleSubmit}
    >
      <h2 style={{ marginBottom: "1rem" }}>Edit Profile</h2>
      <button
        type="button"
        className="btn"
        style={{
          float: "right",
          marginTop: "-2.5rem",
          background: "#e5e7eb",
          color: "#222",
        }}
        onClick={() => navigate("/profile")}
      >
        Back to Profile
      </button>
      <label>Phone</label>
      <input name="phone" value={form.phone} onChange={handleChange} required />
      <label>Address</label>
      <input
        name="address"
        value={form.address}
        onChange={handleChange}
        required
      />
      <label>Emergency Contact Name</label>
      <input
        name="emergency_contact.name"
        value={form.emergency_contact.name}
        onChange={handleChange}
        required
      />
      <label>Emergency Contact Phone</label>
      <input
        name="emergency_contact.phone"
        value={form.emergency_contact.phone}
        onChange={handleChange}
        required
      />
      <label>Emergency Contact Relationship</label>
      <input
        name="emergency_contact.relationship"
        value={form.emergency_contact.relationship}
        onChange={handleChange}
        required
      />
      <label>Bio</label>
      <input name="bio" value={form.bio} onChange={handleChange} />
      <label>Start Date</label>
      <input
        name="start_date"
        value={form.start_date}
        onChange={handleChange}
        type="date"
      />
      <button
        className="btn"
        type="submit"
        style={{ width: "100%", marginTop: "1rem" }}
        disabled={mutation.isLoading}
      >
        {mutation.isLoading ? "Saving..." : "Save Changes"}
      </button>
      {error && (
        <div className="alert" style={{ marginTop: "1rem" }}>
          {error}
        </div>
      )}
      {success && (
        <div
          className="alert"
          style={{ marginTop: "1rem", background: "#bbf7d0" }}
        >
          Profile updated!
        </div>
      )}
    </form>
  );
}
