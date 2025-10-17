import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { postAbsenceRequest } from "../../lib/api";

export default function AbsenceRequest() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: postAbsenceRequest,
    onSuccess: () => {
      navigate("/absences");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    mutation.mutate({
      start_date: startDate,
      end_date: endDate,
      reason,
    });
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Request Absence</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Reason</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          disabled={mutation.isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {mutation.isLoading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}
