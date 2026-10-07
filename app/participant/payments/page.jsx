"use client";

import Script from "next/script";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const registrationId = searchParams.get("registrationId");

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [paymentReady, setPaymentReady] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    if (!registrationId) {
      setError("Registration ID is missing.");
      setLoading(false);
      return;
    }

    loadPaymentOrder();
  }, [registrationId]);

  async function loadPaymentOrder() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to prepare online payment."
        );
      }

      if (data.alreadyConfirmed) {
        router.replace("/participant/registrations");
        return;
      }

      setPaymentInfo(data);
    } catch (err) {
      console.error("Payment preparation error:", err);

      setError(
        err.message || "Unable to prepare online payment."
      );
    } finally {
      setLoading(false);
    }
  }

  async function startPayment() {
    if (!paymentInfo || paying) return;

    if (!window.Razorpay) {
      setError(
        "Razorpay Checkout is still loading. Please try again."
      );
      return;
    }

    try {
      setPaying(true);
      setError("");

      const options = {
        key: paymentInfo.keyId,
        amount: paymentInfo.amount,
        currency: paymentInfo.currency || "INR",
        name: "EventNest",
        description: `Registration for ${
          paymentInfo.competitionName || "Competition"
        }`,
        order_id: paymentInfo.orderId,

        handler: async function (response) {
          try {
            setError("");

            const verifyResponse = await fetch(
              "/api/payments/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  registrationId,
                  razorpayOrderId:
                    response.razorpay_order_id,
                  razorpayPaymentId:
                    response.razorpay_payment_id,
                  razorpaySignature:
                    response.razorpay_signature,
                }),
              }
            );

            const result = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                result.error ||
                  "Payment verification failed."
              );
            }

            router.replace(
              `/participant/registrations?payment=success&registrationId=${registrationId}`
            );
          } catch (err) {
            console.error(
              "Payment verification error:",
              err
            );

            setError(
              err.message ||
                "Payment was received but verification failed. Please contact the organizer."
            );

            setPaying(false);
          }
        },

        prefill: {
          name: "",
          email: "",
          contact: "",
        },

        theme: {
          color: "#2563eb",
        },

        modal: {
          ondismiss: function () {
            setPaying(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error(
          "Razorpay payment failed:",
          response.error
        );

        setError(
          response.error?.description ||
            "Payment failed. Please try again."
        );

        setPaying(false);
      });

      razorpay.open();
    } catch (err) {
      console.error("Razorpay error:", err);

      setError(
        err.message || "Unable to open Razorpay Checkout."
      );

      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#071225] px-6 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />

          <p className="mt-5 text-sm text-gray-400">
            Preparing secure payment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setPaymentReady(true)}
        onError={() =>
          setError(
            "Unable to load Razorpay Checkout. Please check your internet connection."
          )
        }
      />

      <main className="min-h-screen bg-[#071225] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">

          <div className="mb-8">
            <Link
              href="/participant/registrations"
              className="text-sm text-gray-400 transition hover:text-white"
            >
              ← Back to My Registrations
            </Link>

            <p className="mt-8 text-sm font-medium text-blue-400">
              EventNest Secure Payment
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Complete Your Payment
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-400 sm:text-base">
              Complete your online payment securely through
              Razorpay to confirm your competition registration.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              <p className="font-medium">Payment Error</p>

              <p className="mt-1 leading-6">
                {error}
              </p>

              <button
                type="button"
                onClick={loadPaymentOrder}
                className="mt-3 font-semibold text-white underline"
              >
                Try again
              </button>
            </div>
          )}

          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl">

            <div className="border-b border-white/10 p-6 sm:p-8">
              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl">
                  💳
                </div>

                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Competition
                  </p>

                  <h2 className="mt-1 break-words text-xl font-bold sm:text-2xl">
                    {paymentInfo?.competitionName ||
                      "Competition Registration"}
                  </h2>
                </div>

              </div>
            </div>

            <div className="p-6 sm:p-8">

              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">

                <p className="text-sm text-gray-400">
                  Amount to pay
                </p>

                <p className="mt-2 text-4xl font-bold text-white">
                  ₹
                  {(
                    Number(paymentInfo?.amount || 0) / 100
                  ).toLocaleString("en-IN")}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  Secure online payment • INR
                </p>

              </div>

              <div className="mt-6 space-y-4">

                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <span className="text-sm text-gray-500">
                    Payment method
                  </span>

                  <span className="text-sm font-medium text-blue-300">
                    Online Payment
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <span className="text-sm text-gray-500">
                    Gateway
                  </span>

                  <span className="text-sm font-medium text-gray-300">
                    Razorpay
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">
                    Registration
                  </span>

                  <span className="max-w-[55%] break-all text-right font-mono text-xs text-gray-400">
                    {registrationId}
                  </span>
                </div>

              </div>

              <button
                type="button"
                onClick={startPayment}
                disabled={
                  paying ||
                  !paymentInfo ||
                  !paymentReady
                }
                className="mt-8 w-full rounded-2xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {paying
                  ? "Processing..."
                  : !paymentReady
                  ? "Loading Secure Checkout..."
                  : `Pay ₹${(
                      Number(paymentInfo?.amount || 0) /
                      100
                    ).toLocaleString("en-IN")}`}
              </button>

              <div className="mt-5 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4">

                <p className="text-sm font-medium text-emerald-300">
                  🔒 Secure Payment
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Your payment is processed through
                  Razorpay. EventNest verifies the payment
                  securely on the server before confirming
                  your registration.
                </p>

              </div>

              <p className="mt-5 text-center text-xs leading-5 text-gray-600">
                Do not close the payment window while your
                payment is being processed.
              </p>

            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default function ParticipantPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#071225] px-6 text-white">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />

            <p className="mt-5 text-sm text-gray-400">
              Loading payment page...
            </p>
          </div>
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}