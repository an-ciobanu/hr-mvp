import ProfileView from "../components/Profile/ProfileView";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMyProfile, getProfileById, getFeedbackForUser } from "../lib/api";
import { useAuth } from "../components/Auth/AuthContext";

export default function ProfileViewPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const isOtherUser = !!userId;
  const { data, isLoading } = useQuery({
    queryKey: isOtherUser ? ["profile", userId] : ["me"],
    queryFn: isOtherUser ? () => getProfileById(userId) : getMyProfile,
    retry: false,
  });
  const { data: auth } = useAuth();
  // Fetch feedback if viewing another user and logged-in user is their manager
  const isDirectManager =
    isOtherUser &&
    auth?.user &&
    data?.profile &&
    data?.profile.manager_id === auth.user.id;
  const shouldShowFeedback = isDirectManager;

  const { data: feedbackData } = useQuery({
    queryKey: ["feedback", userId],
    queryFn: () => getFeedbackForUser(userId),
    enabled: shouldShowFeedback,
    staleTime: 0,
    cacheTime: 0,
  });

  const feedback =
    shouldShowFeedback && feedbackData?.feedback ? feedbackData.feedback : null;

  if (isLoading) {
    return <div className="card">Loading profile...</div>;
  }
  if (!data || !data.ok)
    return <div className="alert">Could not load profile.</div>;

  const profile = data.profile;
  const user = data.user || null;

  return (
    <>
      {isDirectManager && (
        <div style={{ maxWidth: 500, margin: "2rem auto", textAlign: "right" }}>
          <button
            className="btn"
            style={{ marginBottom: "1rem" }}
            onClick={() => navigate(`/employees/${userId}/edit`)}
          >
            Edit Profile
          </button>
        </div>
      )}
      <ProfileView profile={profile} user={user} feedback={feedback} />
    </>
  );
}
