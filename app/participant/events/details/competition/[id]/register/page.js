"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CompetitionRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const competitionId = params?.id;

  const [supabase] = useState(() => createClient());

  const [competition, setCompetition] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    participantName: "",
    participantEmail: "",
    phone: "",
    college: "",
    studentId: "",

    participationMode: "OFFLINE",
    participationType: "Individual",
    teamName: "",

    sessionId: "",
  });

  useEffect(() => {
    if (!competitionId) return;

    loadRegistrationPage();
  }, [competitionId]);

  async function loadRegistrationPage() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(authError.message);
      }

      if (!currentUser) {
        router.push(
          `/login?redirect=/participant/events/details/competition/${competitionId}/register`
        );
        return;
      }

      setUser(currentUser);

      const { data: competitionData, error: competitionError } =
        await supabase
          .from("competitions")
          .select(`
            id,
            event_id,
            name,
            description,
            rules,
            registration_fee,
            capacity,
            competition_date,
            start_time,
            end_time,
            check_in_start,
            check_in_end,
            late_entry_allowed,
            venue,
            status,
            poster_url
          `)
          .eq("id", competitionId)
          .eq("status", "PUBLISHED")
          .single();

      if (competitionError) {
        throw new Error(
          competitionError.message || "Unable to load competition."
        );
      }

      if (!competitionData) {
        throw new Error("Competition not found.");
      }

      setCompetition(competitionData);

      const { data: sessionData, error: sessionError } =
        await supabase.rpc("get_competition_session_availability", {
          target_competition_id: competitionId,
        });

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      const safeSessions = sessionData || [];

      setSessions(safeSessions);

      if (safeSessions.length > 0) {
        const firstAvailable = safeSessions.find(
          (session) =>
            session.available_seats === null ||
            Number(session.available_seats) > 0
        );

        if (firstAvailable) {
          setForm((previous) => ({
            ...previous,
            sessionId: firstAvailable.id,
          }));
        }
      }

      const { data: existingRegistration, error: registrationError } =
        await supabase
          .from("registrations")
          .select("id, status, registration_number")
          .eq("user_id", currentUser.id)
          .eq("competition_id", competitionId)
          .in("status", ["PENDING", "CONFIRMED"])
          .maybeSingle();

      if (registrationError) {
        console.warn(
          "Existing registration check failed:",
          registrationError.message
        );
      }

      if (existingRegistration) {
        setSuccess(
          `You are already registered for this competition. Registration number: ${
            existingRegistration.registration_number || "Pending"
          }`
        );
      }

      const metadata = currentUser.user_metadata || {};

      setForm((previous) => ({
        ...previous,
        participantEmail:
          currentUser.email || previous.participantEmail || "",
        participantName:
          metadata.full_name ||
          metadata.name ||
          previous.participantName ||
          "",
      }));
    } catch (err) {
      console.error("Registration page error:", err);

      setError(
        err.message || "Unable to load registration page."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function formatDate(dateValue) {
    if (!dateValue) return "Not specified";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatTime(timeValue) {
    if (!timeValue) return "Not specified";

    const parts = String(timeValue).split(":");

    if (parts.length < 2) {
      return timeValue;
    }

    const hours = Number(parts[0]);
    const minutes = parts[1];

    if (Number.isNaN(hours)) {
      return timeValue;
    }

    const suffix = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;

    return `${displayHour}:${minutes} ${suffix}`;
  }

  function getSelectedSession() {
    return sessions.find(
      (session) => session.id === form.sessionId
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!user) {
      setError("Please log in before registering.");
      return;
    }

    if (!competition) {
      setError("Competition information is unavailable.");
      return;
    }

    if (!form.participantName.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!form.participantEmail.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!form.college.trim()) {
      setError("Please enter your college or institution.");
      return;
    }

    if (!form.studentId.trim()) {
      setError("Please enter your student ID.");
      return;
    }

    if (!["ONLINE", "OFFLINE"].includes(form.participationMode)) {
      setError("Please select Online or Offline participation.");
      return;
    }

    if (form.participationType === "Team" && !form.teamName.trim()) {
      setError("Please enter your team name.");
      return;
    }

    if (!form.sessionId) {
      setError("Please select a session.");
      return;
    }

    const selectedSession = getSelectedSession();

    if (!selectedSession) {
      setError("Selected session could not be found.");
      return;
    }

    if (
      selectedSession.available_seats !== null &&
      Number(selectedSession.available_seats) <= 0
    ) {
      setError(
        "This session is full. Please select another session."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          competitionId: competition.id,
          sessionId: form.sessionId,

          participantName:
            form.participantName.trim(),

          participantEmail:
            form.participantEmail.trim(),

          phone:
            form.phone.trim(),

          college:
            form.college.trim(),

          studentId:
            form.studentId.trim(),

          participationMode:
            form.participationMode,

          participationType:
            form.participationType,

          teamName:
            form.participationType === "Team"
              ? form.teamName.trim()
              : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to create registration."
        );
      }

      if (result?.paymentRequired) {
        router.push(
          `/participant/payments?registrationId=${result.registrationId}`
        );
        return;
      }

      setSuccess(
        result?.message ||
          "Registration successful! Your registration has been confirmed."
      );

      setTimeout(() => {
        router.push("/participant/registrations");
      }, 1500);
    } catch (err) {
      console.error(
        "Registration submission error:",
        err
      );

      setError(
        err.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#071225] px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />

          <p className="mt-5 text-gray-400">
            Loading registration details...
          </p>
        </div>
      </main>
    );
  }

  if (error && !competition) {
    return (
      <main className="min-h-screen bg-[#071225] px-6 py-20 text-white">
        <div className="mx-auto max-w-2xl rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <h1 className="text-2xl font-bold">
            Unable to load registration
          </h1>

          <p className="mt-3 text-sm text-red-300">
            {error}
          </p>

          <Link
            href={`/participant/events/details/competition/${competitionId}`}
            className="mt-6 inline-block rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/15"
          >
            ← Back to Competition
          </Link>
        </div>
      </main>
    );
  }

  const selectedSession = getSelectedSession();

  return (
    <main className="min-h-screen bg-[#071225] text-white">
      <header className="border-b border-white/10 bg-[#08152b]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href={`/participant/events/details/competition/${competitionId}`}
            className="text-sm text-gray-400 transition hover:text-white"
          >
            ← Back to Competition
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 font-bold">
              E
            </div>

            <span className="hidden font-bold sm:block">
              EventHub AI
            </span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 sm:text-sm">
            Competition Registration
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Register for {competition?.name}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
            Complete your details, choose your participation mode,
            and select a session.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-300">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid gap-8 lg:grid-cols-[1fr_340px]"
        >
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-8">

            {/* Personal Information */}
            <section>
              <h2 className="text-xl font-bold">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Enter the details that will be used for your registration.
              </p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Input
                  label="Full Name"
                  value={form.participantName}
                  onChange={(value) =>
                    updateField("participantName", value)
                  }
                  placeholder="Enter your full name"
                  required
                />

                <Input
                  label="Email Address"
                  value={form.participantEmail}
                  onChange={(value) =>
                    updateField("participantEmail", value)
                  }
                  placeholder="you@example.com"
                  type="email"
                  required
                />

                <Input
                  label="Phone Number"
                  value={form.phone}
                  onChange={(value) =>
                    updateField("phone", value)
                  }
                  placeholder="Enter phone number"
                  type="tel"
                  required
                />

                <Input
                  label="College / Institution"
                  value={form.college}
                  onChange={(value) =>
                    updateField("college", value)
                  }
                  placeholder="Enter college name"
                  required
                />

                <Input
                  label="Student ID"
                  value={form.studentId}
                  onChange={(value) =>
                    updateField("studentId", value)
                  }
                  placeholder="Enter student ID"
                  required
                />
              </div>
            </section>

            {/* Participation Mode */}
            <section className="mt-8 border-t border-white/10 pt-8">
              <h2 className="text-xl font-bold">
                Participation Mode
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Choose how you want to participate.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <ParticipationOption
                  title="Online"
                  description="Participate remotely"
                  selected={
                    form.participationMode === "ONLINE"
                  }
                  onClick={() =>
                    updateField(
                      "participationMode",
                      "ONLINE"
                    )
                  }
                />

                <ParticipationOption
                  title="Offline"
                  description="Attend at the event venue"
                  selected={
                    form.participationMode === "OFFLINE"
                  }
                  onClick={() =>
                    updateField(
                      "participationMode",
                      "OFFLINE"
                    )
                  }
                />
              </div>
            </section>

            {/* Participation Type */}
            <section className="mt-8 border-t border-white/10 pt-8">
              <h2 className="text-xl font-bold">
                Participation Type
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Choose whether you are participating individually or as a team.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <ParticipationOption
                  title="Individual"
                  description="Participate on your own"
                  selected={
                    form.participationType === "Individual"
                  }
                  onClick={() =>
                    updateField(
                      "participationType",
                      "Individual"
                    )
                  }
                />

                <ParticipationOption
                  title="Team"
                  description="Participate with teammates"
                  selected={
                    form.participationType === "Team"
                  }
                  onClick={() =>
                    updateField(
                      "participationType",
                      "Team"
                    )
                  }
                />
              </div>

              {form.participationType === "Team" && (
                <div className="mt-5">
                  <Input
                    label="Team Name"
                    value={form.teamName}
                    onChange={(value) =>
                      updateField("teamName", value)
                    }
                    placeholder="Enter your team name"
                    required
                  />
                </div>
              )}
            </section>

            {/* Session */}
            <section className="mt-8 border-t border-white/10 pt-8">
              <h2 className="text-xl font-bold">
                Select Session
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Choose the session you want to attend.
              </p>

              {sessions.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5 text-sm text-yellow-300">
                  No sessions are currently available for this competition.
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {sessions.map((session) => {
                    const isFull =
                      session.available_seats !== null &&
                      Number(session.available_seats) <= 0;

                    const selected =
                      form.sessionId === session.id;

                    return (
                      <button
                        key={session.id}
                        type="button"
                        disabled={isFull}
                        onClick={() =>
                          updateField(
                            "sessionId",
                            session.id
                          )
                        }
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-blue-500 bg-blue-500/10"
                            : isFull
                              ? "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-60"
                              : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold">
                              {session.session_name ||
                                "Session"}
                            </p>

                            <p className="mt-1 text-sm text-gray-400">
                              {formatDate(session.session_date)}
                              {" • "}
                              {formatTime(session.start_time)}
                              {" - "}
                              {formatTime(session.end_time)}
                            </p>

                            {session.venue && (
                              <p className="mt-1 text-xs text-gray-500">
                                📍 {session.venue}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0">
                            {isFull ? (
                              <span className="rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300">
                                FULL
                              </span>
                            ) : session.available_seats === null ? (
                              <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                                Available
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                                {session.available_seats} seats available
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Agreement */}
            <section className="mt-8 border-t border-white/10 pt-8">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  id="agreement"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 accent-blue-600"
                />

                <span className="text-sm leading-6 text-gray-400">
                  I confirm that the information provided is correct
                  and I agree to follow the competition rules and
                  guidelines.
                </span>
              </label>
            </section>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                submitting ||
                !form.sessionId ||
                sessions.length === 0 ||
                Boolean(success)
              }
              className="mt-8 w-full rounded-xl bg-blue-600 px-5 py-4 font-bold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Processing Registration..."
                : success
                  ? "Registration Submitted"
                  : competition?.registration_fee &&
                      Number(competition.registration_fee) > 0
                    ? `Continue to Payment • ₹${Number(
                        competition.registration_fee
                      )}`
                    : "Complete Registration →"}
            </button>
          </div>

          {/* Summary */}
          <aside>
            <div className="sticky top-8 rounded-3xl border border-white/10 bg-[#0b1a32] p-5 sm:p-6">
              {competition?.poster_url && (
                <img
                  src={competition.poster_url}
                  alt={competition.name}
                  className="mb-6 h-44 w-full rounded-2xl object-cover"
                />
              )}

              <p className="text-xs uppercase tracking-widest text-gray-500">
                Competition Summary
              </p>

              <h2 className="mt-3 text-xl font-bold">
                {competition?.name}
              </h2>

              <div className="my-6 h-px bg-white/10" />

              <SummaryItem
                icon="📅"
                label="Date"
                value={formatDate(
                  competition?.competition_date
                )}
              />

              <SummaryItem
                icon="◷"
                label="Time"
                value={
                  competition?.start_time
                    ? `${formatTime(
                        competition.start_time
                      )}${
                        competition.end_time
                          ? ` - ${formatTime(
                              competition.end_time
                            )}`
                          : ""
                      }`
                    : "Not specified"
                }
              />

              <SummaryItem
                icon="📍"
                label="Venue"
                value={
                  competition?.venue ||
                  "Not specified"
                }
              />

              <SummaryItem
                icon="💰"
                label="Registration Fee"
                value={
                  Number(
                    competition?.registration_fee || 0
                  ) > 0
                    ? `₹${Number(
                        competition.registration_fee
                      ).toLocaleString("en-IN")}`
                    : "Free"
                }
              />

              <SummaryItem
                icon="🌐"
                label="Participation Mode"
                value={
                  form.participationMode === "ONLINE"
                    ? "Online"
                    : "Offline"
                }
              />

              {selectedSession && (
                <div className="mt-6 rounded-2xl border border-blue-400/10 bg-blue-500/5 p-4">
                  <p className="text-xs text-gray-500">
                    Selected Session
                  </p>

                  <p className="mt-1 font-semibold">
                    {selectedSession.session_name}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {formatDate(
                      selectedSession.session_date
                    )}
                    {" • "}
                    {formatTime(
                      selectedSession.start_time
                    )}
                  </p>
                </div>
              )}

              {competition?.capacity !== null &&
                competition?.capacity !== undefined && (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-gray-500">
                      Competition Capacity
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {competition.capacity} participants
                    </p>
                  </div>
                )}
            </div>
          </aside>
        </form>
      </section>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-200">
        {label}
        {required && (
          <span className="ml-1 text-blue-400">*</span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-[#0b1a32] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
  );
}

function ParticipationOption({
  title,
  description,
  selected,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-blue-500 bg-blue-500/10"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
            selected
              ? "border-blue-500 bg-blue-500"
              : "border-gray-600"
          }`}
        >
          {selected && (
            <div className="h-2 w-2 rounded-full bg-white" />
          )}
        </div>

        <div>
          <p className="font-semibold">
            {title}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

function SummaryItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-gray-500">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium">
          {value}
        </p>
      </div>
    </div>
  );
}