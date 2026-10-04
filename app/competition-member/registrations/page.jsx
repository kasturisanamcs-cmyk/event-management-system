"use client";

import { useEffect, useState } from "react";

export default function CompetitionMemberRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");

  async function loadRegistrations() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/competition-member/registrations",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to load registrations."
        );
      }

      setRegistrations(result.registrations || []);
    } catch (error) {
      console.error("Load registrations error:", error);

      setError(
        error.message || "Something went wrong while loading registrations."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRegistrations();
  }, []);

  async function handleReview(registrationId, action) {
    let rejectionReason = null;

    /*
      REJECTION REASON
    */
    if (action === "REJECT") {
      rejectionReason = window.prompt(
        "Enter the reason for rejecting this registration:"
      );

      if (!rejectionReason || !rejectionReason.trim()) {
        return;
      }
    }

    /*
      CONFIRM ACTION
    */
    const actionText =
      action === "APPROVE" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} this registration?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(registrationId);
      setError("");

      /*
        CALL REVIEW API
      */
      const response = await fetch(
        "/api/competition-member/registrations/review",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            registrationId,
            action,
            rejectionReason,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to review registration."
        );
      }

      /*
        SUCCESS MESSAGE
      */
      window.alert(
        action === "APPROVE"
          ? "Registration approved successfully."
          : "Registration rejected successfully."
      );

      /*
        Reload the list so the reviewed
        registration disappears from PENDING.
      */
      await loadRegistrations();
    } catch (error) {
      console.error("Review error:", error);

      setError(
        error.message ||
          "Something went wrong while reviewing the registration."
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Registrations
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Review and manage pending participant registrations
            for your assigned competitions.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <p className="text-sm font-medium text-red-400">
              {error}
            </p>

            <button
              onClick={loadRegistrations}
              className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
            <p className="text-slate-400">
              Loading registrations...
            </p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading &&
          !error &&
          registrations.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center">
              <div className="mb-3 text-4xl">
                📋
              </div>

              <h2 className="text-lg font-semibold">
                No Pending Registrations
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                There are currently no pending registrations
                for your assigned competitions.
              </p>
            </div>
          )}

        {/* REGISTRATIONS */}
        {!loading &&
          !error &&
          registrations.length > 0 && (
            <div className="space-y-5">

              {registrations.map((registration) => {
                const isProcessing =
                  processingId ===
                  registration.registration_id;

                return (
                  <div
                    key={registration.registration_id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg"
                  >

                    {/* TOP SECTION */}
                    <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 md:flex-row md:items-start md:justify-between">

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                          Registration
                        </p>

                        <h2 className="mt-1 text-lg font-bold">
                          {registration.registration_number}
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">
                          {registration.competition_name}
                        </p>
                      </div>

                      <span className="w-fit rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                        {registration.registration_status}
                      </span>
                    </div>

                    {/* PARTICIPANT DETAILS */}
                    <div className="grid gap-5 py-5 sm:grid-cols-2 lg:grid-cols-3">

                      <Detail
                        label="Participant"
                        value={registration.participant_name}
                      />

                      <Detail
                        label="Email"
                        value={registration.participant_email}
                      />

                      <Detail
                        label="Phone"
                        value={registration.phone}
                      />

                      <Detail
                        label="College"
                        value={registration.college}
                      />

                      <Detail
                        label="Student ID"
                        value={registration.student_id}
                      />

                      <Detail
                        label="Participation"
                        value={registration.participation_type}
                      />

                      <Detail
                        label="Team"
                        value={
                          registration.team_name ||
                          "Individual"
                        }
                      />

                      <Detail
                        label="Mode"
                        value={registration.participation_mode}
                      />

                      <Detail
                        label="Registration Fee"
                        value={`₹${
                          registration.registration_fee ?? 0
                        }`}
                      />

                      <Detail
                        label="Competition Date"
                        value={registration.competition_date}
                      />

                      <Detail
                        label="Venue"
                        value={registration.venue}
                      />

                      <Detail
                        label="Registered At"
                        value={
                          registration.registered_at
                            ? new Date(
                                registration.registered_at
                              ).toLocaleString()
                            : "—"
                        }
                      />

                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">

                      {/* REJECT */}
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() =>
                          handleReview(
                            registration.registration_id,
                            "REJECT"
                          )
                        }
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing
                          ? "Processing..."
                          : "Reject"}
                      </button>

                      {/* APPROVE */}
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() =>
                          handleReview(
                            registration.registration_id,
                            "APPROVE"
                          )
                        }
                        className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing
                          ? "Processing..."
                          : "Approve"}
                      </button>

                    </div>
                  </div>
                );
              })}

            </div>
          )}

      </div>
    </div>
  );
}


/*
  DETAIL COMPONENT
*/
function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm text-slate-200">
        {value || "—"}
      </p>
    </div>
  );
}