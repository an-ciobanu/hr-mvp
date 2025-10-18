import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function EmployeeListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["employees"],
    queryFn: getAllUsers,
  });
  const navigate = useNavigate();

  if (isLoading) return <div>Loading employees...</div>;
  if (error || data?.error)
    return <div>Error: {error?.message || data?.error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">All Employees</h2>
      <ul className="space-y-2">
        {data?.users?.map((user) => (
          <li
            key={user.id}
            className="border p-3 rounded cursor-pointer hover:bg-blue-50"
            onClick={() => navigate(`/employees/${user.id}`)}
          >
            <span className="font-semibold">{user.name}</span>
            <span className="ml-2 text-sm text-gray-500">({user.email})</span>
            <span className="ml-2 text-xs text-gray-400">{user.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
