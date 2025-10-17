import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../Auth/AuthContext";
import { getAbsencesForUser } from "../../lib/api";
import { useNavigate } from "react-router-dom";

export default function AbsenceList() {
  const { data: auth, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const userId = auth?.user?.id;
  const { data, isLoading, error } = useQuery({
    queryKey: ["absences", userId],
    queryFn: () => getAbsencesForUser(userId),
    enabled: !!userId,
  });

  if (authLoading || isLoading) return <div>Loading absences...</div>;
  if (error || data?.error)
    return <div>Error: {error?.message || data?.error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Your Absences</h2>
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => navigate("/absences/request")}
      >
        Request Absence
      </button>
      {data?.absences?.length ? (
        <ul className="space-y-2">
          {data.absences.map((absence) => (
            <li key={absence.id} className="border p-3 rounded">
              <div>
                <span className="font-semibold">
                  {absence.start_date} to {absence.end_date}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  ({absence.status})
                </span>
              </div>
              <div className="text-gray-700">Reason: {absence.reason}</div>
            </li>
          ))}
        </ul>
      ) : (
        <div>No absences found.</div>
      )}
    </div>
  );
}
