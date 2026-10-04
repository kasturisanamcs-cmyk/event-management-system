"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { createClient } from "@/lib/supabase/client";

export default function CompetitionMemberScanPage() {
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);

  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scannerStarted, setScannerStarted] = useState(false);

  // -----------------------------------------
  // Get access token
  // -----------------------------------------
  async function getAccessToken() {
    const supabase = createClient();

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.access_token) {
      throw new Error("Please log in again.");
    }

    return session.access_token;
  }

  // -----------------------------------------
  // Stop scanner
  // -----------------------------------------
  async function stopScanner() {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (error) {
        console.error("Scanner stop error:", error);
      }

      try {
        await scannerRef.current.clear();
      } catch (error) {
        console.error("Scanner clear error:", error);
      }

      scannerRef.current = null;
    }

    setScannerStarted(false);
  }

  // -----------------------------------------
  // Verify QR
  // -----------------------------------------
  async function verifyQr(qrToken) {
    if (isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;
    setLoading(true);
    setMessage("");
    setResult(null);

    try {
      await stopScanner();

      const accessToken = await getAccessToken();

      const response = await fetch(
        "/api/competition-member/qr/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            qrToken,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "QR verification failed."
        );
      }

      setResult(data);

      if (data.success) {
        setMessage(
          data.message || "Check-in successful."
        );
      } else {
        setMessage(
          data.message || "QR verification failed."
        );
      }
    } catch (error) {
      console.error("QR verification error:", error);

      setMessage(
        error.message ||
          "Something went wrong while verifying the QR."
      );
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
    }
  }

  // -----------------------------------------
  // Start scanner
  // -----------------------------------------
  async function startScanner() {
    try {
      setMessage("");
      setResult(null);

      if (scannerRef.current) {
        await stopScanner();
      }

      const scanner = new Html5Qrcode(
        "eventnest-qr-reader"
      );

      scannerRef.current = scanner;

      await scanner.start(
        {
          facingMode: "environment",
        },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        },
        async (decodedText) => {
          await verifyQr(decodedText);
        },
        () => {
          // Ignore normal scanning failures.
        }
      );

      setScannerStarted(true);
    } catch (error) {
      console.error("Scanner start error:", error);

      setMessage(
        "Unable to start camera. Please allow camera permission and try again."
      );

      scannerRef.current = null;
      setScannerStarted(false);
    }
  }

  // -----------------------------------------
  // Cleanup
  // -----------------------------------------
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {});
      }
    };
  }, []);

  // -----------------------------------------
  // UI
  // -----------------------------------------
  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">
            COMPETITION MEMBER
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl">
            QR Check-In
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Scan a participant's EventNest ticket QR
            code to verify their entry.
          </p>
        </div>

        {/* Scanner Card */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl sm:p-8">

          <div className="mb-5">
            <h2 className="text-xl font-semibold">
              Scan Ticket
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Ask the participant to display their
              EventNest QR code.
            </p>
          </div>

          {/* Camera */}
          <div
            id="eventnest-qr-reader"
            className="mx-auto max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-black"
          />

          {/* Start Scanner */}
          {!scannerStarted && !loading && (
            <button
              type="button"
              onClick={startScanner}
              className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
            >
              Start Camera Scanner
            </button>
          )}

          {/* Stop Scanner */}
          {scannerStarted && !loading && (
            <button
              type="button"
              onClick={stopScanner}
              className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
            >
              Stop Scanner
            </button>
          )}

          {/* Loading */}
          {loading && (
            <div className="mt-5 rounded-xl border border-blue-900/50 bg-blue-950/30 p-4 text-center text-sm text-blue-300">
              Verifying QR code...
            </div>
          )}

          {/* Message */}
          {message && (
            <div
              className={`mt-5 rounded-xl border p-4 text-center font-medium ${
                result?.success
                  ? "border-green-800 bg-green-950/30 text-green-300"
                  : "border-red-800 bg-red-950/30 text-red-300"
              }`}
            >
              {message}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950 p-5">

              <h3 className="mb-4 text-lg font-semibold">
                Check-In Result
              </h3>

              <div className="space-y-3 text-sm">

                <div className="flex justify-between gap-4 border-b border-slate-800 pb-3">
                  <span className="text-slate-400">
                    Participant
                  </span>

                  <span className="font-semibold text-white">
                    {result.participant?.name ||
                      "—"}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-slate-800 pb-3">
                  <span className="text-slate-400">
                    Registration
                  </span>

                  <span className="font-semibold text-white">
                    {result.registration
                      ?.registration_number ||
                      "—"}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-slate-800 pb-3">
                  <span className="text-slate-400">
                    Ticket
                  </span>

                  <span className="font-semibold text-white">
                    {result.ticket
                      ?.ticket_number ||
                      "—"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">
                    Competition
                  </span>

                  <span className="font-semibold text-white">
                    {result.competition?.name ||
                      "—"}
                  </span>
                </div>

                {result.checked_in_at && (
                  <div className="flex justify-between gap-4 border-t border-slate-800 pt-3">
                    <span className="text-slate-400">
                      Checked In
                    </span>

                    <span className="font-semibold text-green-400">
                      {new Date(
                        result.checked_in_at
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Scan Another */}
              <button
                type="button"
                onClick={startScanner}
                className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
              >
                Scan Another Ticket
              </button>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}