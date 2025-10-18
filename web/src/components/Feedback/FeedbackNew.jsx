import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getAllUsers,
  postFeedback,
  enhanceFeedbackWithAI,
} from "../../lib/api";
import { useNavigate } from "react-router-dom";

export default function FeedbackNew() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["employees"],
    queryFn: getAllUsers,
  });

  const filteredUsers =
    data?.users?.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const mutation = useMutation({
    mutationFn: ({ userId, body_raw }) => postFeedback(userId, body_raw),
    onSuccess: () => {
      navigate("/feedback");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!selectedUser || !body.trim()) return;
    mutation.mutate({ userId: selectedUser.id, body_raw: body });
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Give Feedback</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Search User</label>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              const user = filteredUsers.find(
                (u) => `${u.name} (${u.email})` === e.target.value
              );
              setSelectedUser(user || null);
            }}
            list="user-list"
            placeholder="Type name or email..."
            className="border rounded px-2 py-1 w-full"
            autoComplete="off"
          />
          <datalist id="user-list">
            {filteredUsers.map((u) => (
              <option key={u.id} value={`${u.name} (${u.email})`} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block mb-1 font-medium">Feedback</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={!selectedUser || aiLoading}
            placeholder={
              selectedUser ? "Write your feedback..." : "Select a user first"
            }
            className="border rounded px-2 py-1 w-full min-h-[80px]"
            required
          />
          {selectedUser && body.trim() && (
            <button
              type="button"
              className="mt-2 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-60"
              disabled={aiLoading}
              onClick={async () => {
                setAiLoading(true);
                setError("");
                try {
                  const enhanced = await enhanceFeedbackWithAI(body);
                  setBody(enhanced);
                } catch (e) {
                  console.log(e);
                  setError("AI enhancement failed");
                } finally {
                  setAiLoading(false);
                }
              }}
            >
              {aiLoading ? "Enhancing..." : "Enhance with AI"}
            </button>
          )}
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          disabled={!selectedUser || mutation.isLoading || aiLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {mutation.isLoading ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}
