"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CompetitionMemberPaymentsPage() {
  const supabase = createClient();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  async function getAccessToken() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    if (!session?.access_token) {
      throw new Error("Authentication required.");
    }

    return session.access_token;
  }

  async function loadPayments() {
    try {
      setLoading(true);
      setError("");

      const accessToken = await getAccessToken();

      const response = await fetch(
        "/api/competition-member/payments",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to load offline payments."
        );
      }

      setPayments(result.payments || []);
    } catch (error) {
      console.error("Load offline payments error:", error);

      setError(
        error.message ||
          "Something went wrong while loading offline payments."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  async function handleVerify(paymentId) {
    const confirmed = window.confirm(
      "Are you sure you want to verify this offline payment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(paymentId);
      setError("");

      const accessToken = await getAccessToken();

      const response = await fetch(
        "/api/competition-member/payments/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            target_payment_id: paymentId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to verify payment."
        );
      }

      window.alert(
        "Payment verified successfully. Registration is now confirmed."
      );

      await loadPayments();
    } catch (error) {
      console.error("Payment verification error:", error);

      setError(
        error.message ||
          "Something went wrong while verifying the payment."
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Offline Payments
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Verify offline payments for participants approved
            for your assigned competitions.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <p className="text-sm font-medium text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={loadPayments}
              className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              Try Again
            </button>
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
            <p className="text-slate-400">
              Loading offline payments...
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          payments.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center">
              <div className="mb-3 text-4xl">
                ₹
              </div>

              <h2 className="text-lg font-semibold">
                No Pending Offline Payments
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                There are currently no pending offline
                payments for your assigned competitions.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          payments.length > 0 && (
            <div className="space-y-5">
              {payments.map((payment) => {
                const isProcessing =
                  processingId === payment.payment_id;

                return (
                  <div
                    key={payment.payment_id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg"
                  >
                    <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                          Registration
                        </p>

                        <h2 className="mt-1 text-lg font-bold">
                          {payment.registration_number}
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">
                          {payment.competition_name}
                        </p>
                      </div>

                      <span className="w-fit rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                        {payment.payment_status}
                      </span>
                    </div>

                    <div className="grid gap-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
                      <Detail
                        label="Participant"
                        value={payment.participant_name}
                      />

                      <Detail
                        label="Email"
                        value={payment.participant_email}
                      />

                      <Detail
                        label="College"
                        value={payment.college}
                      />

                      <Detail
                        label="Amount"
                        value={`₹${payment.amount}`}
                      />

                      <Detail
                        label="Payment Method"
                        value={payment.payment_method}
                      />

                      <Detail
                        label="Registration Status"
                        value={payment.registration_status}
                      />

                      <Detail
                        label="Approved At"
                        value={
                          payment.approved_at
                            ? new Date(
                                payment.approved_at
                              ).toLocaleString()
                            : "—"
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() =>
                          handleVerify(payment.payment_id)
                        }
                        className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing
                          ? "Verifying..."
                          : "Verify Payment"}
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