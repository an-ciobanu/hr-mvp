import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getManagerAbsences } from "../../lib/api";

const updateAbsenceStatus = async ({ id, status }) => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const res = await fetch(`${baseUrl}/api/absences/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update absence");
  return data.absence;
};

export default function ManagerAbsenceList() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["manager-absences"],
    queryFn: getManagerAbsences,
  });
  const mutation = useMutation({
    mutationFn: updateAbsenceStatus,
    onSuccess: () => queryClient.invalidateQueries(["manager-absences"]),
  });
  if (isLoading) return <div>Loading employee absences...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Employee Absence Requests</h2>
      {data?.length ? (
        <ul className="space-y-2">
          {data.map((absence) => (
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
              <div className="text-gray-500 text-xs mb-2">
                Employee: {absence.user_name} ({absence.user_email})
              </div>
              {absence.status === "requested" && (
                <div className="flex gap-2 mt-2">
                  <button
                    className="btn bg-green-600 text-white"
                    onClick={() =>
                      mutation.mutate({ id: absence.id, status: "approved" })
                    }
                    disabled={mutation.isLoading}
                  >
                    Approve
                  </button>
                  <button
                    className="btn bg-red-600 text-white"
                    onClick={() =>
                      mutation.mutate({ id: absence.id, status: "rejected" })
                    }
                    disabled={mutation.isLoading}
                  >
                    Decline
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div>No employee absence requests found.</div>
      )}
    </div>
  );
}
