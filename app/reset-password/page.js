"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function checkResetSession() {
      try {
        const supabase = createClient();

        const code = searchParams.get("code");

        if (code) {
          const { error } =
            await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("RESET CODE ERROR:", error);

            setErrorMessage(
              "This password reset link is invalid or has expired. Please request a new one."
            );

            setCheckingSession(false);
            return;
          }
        }

        const { data, error } = await supabase.auth.getSession();

        if (error || !data?.session) {
          setErrorMessage(
            "This password reset link is invalid or has expired. Please request a new one."
          );
        }
      } catch (error) {
        console.error("RESET SESSION ERROR:", error);

        setErrorMessage(
          "Unable to verify this password reset link. Please request a new one."
        );
      } finally {
        setCheckingSession(false);
      }
    }

    checkResetSession();
  }, [searchParams]);

  async function handleResetPassword(event) {
    event.preventDefault();

    if (loading) return;

    setErrorMessage("");
    setSuccessMessage("");

    if (!password) {
      setErrorMessage("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage(
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (!confirmPassword) {
      setErrorMessage("Please confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData?.session) {
        setErrorMessage(
          "Your password reset link is invalid or has expired. Please request a new one."
        );
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error("PASSWORD UPDATE ERROR:", error);

        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage(
        "Your password has been updated successfully."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error("UNEXPECTED RESET ERROR:", error);

      setErrorMessage(
        "Something went wrong while resetting your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020817] px-5 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />

          <p className="text-sm text-slate-400">
            Verifying your password reset link...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">

        {/* Background glow */}
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[130px]" />

        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />

        {/* Grid */}
        <div
          className="
            absolute inset-0 opacity-20
            [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)]
            [background-size:60px_60px]
          "
        />

        {/* Card */}
        <div className="relative z-10 w-full max-w-md">

          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-xl font-bold shadow-lg shadow-blue-500/20">
                E
              </div>

              <div>
                <p className="text-xl font-bold">
                  EventNest
                </p>

                <p className="text-xs text-slate-500">
                  Smart Event Management
                </p>
              </div>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
              Account Security
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Reset Password
            </h1>

            <p className="mt-4 leading-6 text-slate-400">
              Create a new password for your EventNest account.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">

            {/* Error */}
            {errorMessage && !successMessage && (
              <div
                role="alert"
                className="
                  mb-6 rounded-xl
                  border border-red-400/20
                  bg-red-500/10
                  px-4 py-4
                  text-sm text-red-300
                "
              >
                <p className="font-medium">
                  {errorMessage}
                </p>

                <Link
                  href="/forgot-password"
                  className="mt-3 inline-block font-semibold text-blue-400 hover:text-blue-300"
                >
                  Request a new reset link →
                </Link>
              </div>
            )}

            {/* Success */}
            {successMessage && (
              <div
                role="status"
                className="
                  mb-6 rounded-xl
                  border border-green-400/20
                  bg-green-500/10
                  px-4 py-4
                  text-sm text-green-300
                "
              >
                <p className="font-medium">
                  {successMessage}
                </p>

                <p className="mt-2 text-green-400/70">
                  Redirecting you to the login page...
                </p>
              </div>
            )}

            {/* Form */}
            {!successMessage && !errorMessage && (
              <form
                onSubmit={handleResetPassword}
                className="space-y-6"
              >

                {/* New password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    New password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter your new password"
                      autoComplete="new-password"
                      disabled={loading}
                      className="
                        w-full rounded-xl
                        border border-white/10
                        bg-[#0b1224]
                        px-4 py-3.5 pr-12
                        text-sm text-white
                        outline-none transition
                        placeholder:text-slate-600
                        focus:border-blue-500
                        focus:ring-2 focus:ring-blue-500/20
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) => !previous
                        )
                      }
                      disabled={loading}
                      className="
                        absolute right-3 top-1/2
                        -translate-y-1/2
                        rounded-lg px-2 py-1
                        text-slate-500
                        hover:text-white
                      "
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-slate-600">
                    Use at least 6 characters.
                  </p>
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Confirm new password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter your new password again"
                      autoComplete="new-password"
                      disabled={loading}
                      className="
                        w-full rounded-xl
                        border border-white/10
                        bg-[#0b1224]
                        px-4 py-3.5 pr-12
                        text-sm text-white
                        outline-none transition
                        placeholder:text-slate-600
                        focus:border-blue-500
                        focus:ring-2 focus:ring-blue-500/20
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) => !previous
                        )
                      }
                      disabled={loading}
                      className="
                        absolute right-3 top-1/2
                        -translate-y-1/2
                        rounded-lg px-2 py-1
                        text-slate-500
                        hover:text-white
                      "
                      aria-label="Toggle password visibility"
                    >
                      {showConfirmPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    flex w-full
                    items-center justify-center
                    gap-2 rounded-xl
                    bg-blue-600
                    px-5 py-3.5
                    font-semibold
                    shadow-lg shadow-blue-600/20
                    transition duration-200
                    hover:-translate-y-0.5
                    hover:bg-blue-500
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {loading
                    ? "Updating Password..."
                    : "Update Password"}

                  {!loading && <span>→</span>}
                </button>
              </form>
            )}

            {/* Back to login */}
            <div className="mt-7 border-t border-white/10 pt-6 text-center">
              <Link
                href="/login"
                className="text-sm font-semibold text-blue-400 hover:text-blue-300"
              >
                ← Back to Sign In
              </Link>
            </div>
          </div>

          {/* Security message */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">
            <span>🔒</span>
            Your password is securely managed by EventNest.
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#020817] px-5 text-white">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />

            <p className="text-sm text-slate-400">
              Loading password reset...
            </p>
          </div>
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}