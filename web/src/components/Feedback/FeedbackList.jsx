import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../Auth/AuthContext";
import { getFeedbackForUser } from "../../lib/api";
import { useNavigate } from "react-router-dom";

export default function FeedbackList() {
  const { data: auth, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const userId = auth?.user?.id;
  const { data, isLoading, error } = useQuery({
    queryKey: ["feedback", userId],
    queryFn: () => getFeedbackForUser(userId),
    enabled: !!userId,
  });

  if (authLoading || isLoading) return <div>Loading feedback...</div>;
  if (error || data?.error)
    return <div>Error: {error?.message || data?.error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Your Feedback</h2>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => navigate("/feedback/new")}
      >
        Give Feedback
      </button>
      {data?.feedback?.length ? (
        <ul className="space-y-2">
          {data.feedback.map((fb) => (
            <li key={fb.id} className="border p-3 rounded">
              <div>
                <span className="font-semibold">From: {fb.author_user_id}</span>
                <span className="ml-2 text-sm text-gray-500">
                  {new Date(fb.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="text-gray-700">
                {fb.body_polished || fb.body_raw}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div>No feedback found.</div>
      )}
    </div>
  );
}
