"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [termsAccepted, setTermsAccepted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setErrorMessage("");
    setSuccessMessage("");

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    // -----------------------------
    // FULL NAME VALIDATION
    // -----------------------------

    if (!cleanName) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (cleanName.length < 2) {
      setErrorMessage("Full name must contain at least 2 characters.");
      return;
    }

    if (cleanName.length > 100) {
      setErrorMessage("Full name is too long.");
      return;
    }

    // -----------------------------
    // EMAIL VALIDATION
    // -----------------------------

    if (!cleanEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // -----------------------------
    // PASSWORD VALIDATION
    // -----------------------------

    if (!password) {
      setErrorMessage("Please enter a password.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password.length > 72) {
      setErrorMessage("Password is too long.");
      return;
    }

    // -----------------------------
    // CONFIRM PASSWORD
    // -----------------------------

    if (!confirmPassword) {
      setErrorMessage("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    // -----------------------------
    // TERMS
    // -----------------------------

    if (!termsAccepted) {
      setErrorMessage("Please accept the Terms of Service.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // -----------------------------
      // CREATE SUPABASE AUTH ACCOUNT
      // -----------------------------

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },
        },
      });

      if (error) {
        const message = error.message.toLowerCase();

        if (
          message.includes("already registered") ||
          message.includes("already exists") ||
          message.includes("user already registered")
        ) {
          setErrorMessage(
            "An account with this email already exists. Please sign in."
          );
        } else if (message.includes("password")) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(error.message);
        }

        return;
      }

      if (!data?.user) {
        setErrorMessage(
          "Account could not be created. Please try again."
        );
        return;
      }

      // -----------------------------
      // SUCCESS
      // -----------------------------

      /*
        IMPORTANT:

        We do NOT create the profile here.

        Supabase database trigger:

        auth.users
             ↓
        profiles
             ↓
        role = PARTICIPANT
      */

      if (data.session) {
        // Email confirmation is disabled.
        setSuccessMessage(
          "Account created successfully! Redirecting..."
        );

        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 800);
      } else {
        // Email confirmation is enabled.
        setSuccessMessage(
          "Account created successfully! Please check your email to verify your account."
        );
      }
    } catch (error) {
      console.error("Registration error:", error);

      setErrorMessage(
        error?.message ||
          "Something went wrong while creating your account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* ===================================================== */}
        {/* LEFT SIDE */}
        {/* ===================================================== */}

        <section className="relative hidden overflow-hidden lg:flex">

          {/* Background glow */}
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[130px]" />

          <div className="absolute -bottom-40 right-[-100px] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />

          {/* Grid background */}
          <div
            className="
              absolute inset-0 opacity-20
              [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)]
              [background-size:60px_60px]
            "
          />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">

            {/* Logo */}
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

            {/* Main content */}
            <div className="max-w-xl">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
                <span>🚀</span>
                Join EventNest
              </div>

              <h1 className="text-5xl font-bold leading-tight xl:text-6xl">
                Everything you need
                <br />
                to make events
                <br />

                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  run smarter.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
                Create your EventNest account and become part of a
                smarter way to discover, organize and manage events.
              </p>
            </div>

            {/* Footer */}
            <p className="text-sm text-slate-600">
              © 2026 EventNest. Smart Event Management System.
            </p>
          </div>
        </section>

        {/* ===================================================== */}
        {/* RIGHT SIDE */}
        {/* ===================================================== */}

        <section className="relative flex min-h-screen items-center justify-center px-6 py-10 sm:px-8 lg:px-16 xl:px-20">

          {/* Mobile glow */}
          <div className="pointer-events-none absolute right-[-150px] top-[-150px] h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[120px] lg:hidden" />

          <div className="relative w-full max-w-xl">

            {/* Mobile logo */}
            <div className="mb-8 flex justify-center lg:hidden">

              <Link href="/" className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-xl font-bold">
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
            <div className="mb-7">

              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
                Get started
              </p>

              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Create your account
              </h2>

              <p className="mt-4 leading-6 text-slate-400">
                Join EventNest and start managing your event experience.
              </p>

            </div>

            {/* ================================================= */}
            {/* REGISTER CARD */}
            {/* ================================================= */}

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">

              <form
                className="space-y-5"
                onSubmit={handleSubmit}
              >

                {/* Full Name */}
                <div>

                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(event.target.value)
                    }
                    placeholder="Enter your full name"
                    autoComplete="name"
                    disabled={loading}
                    className="
                      w-full rounded-xl border border-white/10
                      bg-[#0b1224] px-4 py-3.5
                      text-sm text-white outline-none
                      transition
                      placeholder:text-slate-600
                      focus:border-blue-500
                      focus:ring-2 focus:ring-blue-500/20
                      disabled:cursor-not-allowed disabled:opacity-60
                    "
                  />

                </div>

                {/* Email */}
                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                    className="
                      w-full rounded-xl border border-white/10
                      bg-[#0b1224] px-4 py-3.5
                      text-sm text-white outline-none
                      transition
                      placeholder:text-slate-600
                      focus:border-blue-500
                      focus:ring-2 focus:ring-blue-500/20
                      disabled:cursor-not-allowed disabled:opacity-60
                    "
                  />

                </div>

                {/* Password */}
                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      disabled={loading}
                      className="
                        w-full rounded-xl border border-white/10
                        bg-[#0b1224] px-4 py-3.5 pr-12
                        text-sm text-white outline-none
                        transition
                        placeholder:text-slate-600
                        focus:border-blue-500
                        focus:ring-2 focus:ring-blue-500/20
                        disabled:cursor-not-allowed disabled:opacity-60
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      disabled={loading}
                      className="
                        absolute right-3 top-1/2
                        -translate-y-1/2 rounded-lg
                        px-2 py-1 text-slate-500
                        transition hover:text-white
                        disabled:cursor-not-allowed
                      "
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>

                  </div>

                  <p className="mt-2 text-xs text-slate-600">
                    Use at least 8 characters.
                  </p>

                </div>

                {/* Confirm Password */}
                <div>

                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Confirm password
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
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      disabled={loading}
                      className="
                        w-full rounded-xl border border-white/10
                        bg-[#0b1224] px-4 py-3.5 pr-12
                        text-sm text-white outline-none
                        transition
                        placeholder:text-slate-600
                        focus:border-blue-500
                        focus:ring-2 focus:ring-blue-500/20
                        disabled:cursor-not-allowed disabled:opacity-60
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
                        -translate-y-1/2 rounded-lg
                        px-2 py-1 text-slate-500
                        transition hover:text-white
                        disabled:cursor-not-allowed
                      "
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? "🙈" : "👁"}
                    </button>

                  </div>

                </div>

                {/* Terms */}
                <div className="flex items-start gap-3 pt-1">

                  <input
                    id="terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) =>
                      setTermsAccepted(event.target.checked)
                    }
                    disabled={loading}
                    className="
                      mt-1 h-4 w-4 rounded
                      border-white/20 bg-transparent
                      accent-blue-600
                    "
                  />

                  <label
                    htmlFor="terms"
                    className="text-xs leading-5 text-slate-500"
                  >
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </label>

                </div>

                {/* Error */}
                {errorMessage && (
                  <div
                    role="alert"
                    className="
                      rounded-xl border
                      border-red-400/20
                      bg-red-500/10
                      px-4 py-3
                      text-sm text-red-300
                    "
                  >
                    {errorMessage}
                  </div>
                )}

                {/* Success */}
                {successMessage && (
                  <div
                    role="status"
                    className="
                      rounded-xl border
                      border-emerald-400/20
                      bg-emerald-500/10
                      px-4 py-3
                      text-sm text-emerald-300
                    "
                  >
                    {successMessage}
                  </div>
                )}

                {/* Create Account */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    group flex w-full
                    items-center justify-center
                    gap-2 rounded-xl
                    bg-blue-600 px-5 py-3.5
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
                    ? "Creating Account..."
                    : "Create Account"}

                  {!loading && (
                    <span className="transition group-hover:translate-x-1">
                      →
                    </span>
                  )}
                </button>

              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">

                <div className="h-px flex-1 bg-white/10" />

                <span className="text-xs text-slate-600">
                  ALREADY HAVE AN ACCOUNT?
                </span>

                <div className="h-px flex-1 bg-white/10" />

              </div>

              {/* Login */}
              <div className="text-center">

                <Link
                  href="/login"
                  className="font-semibold text-blue-400 transition hover:text-blue-300"
                >
                  Sign in to EventNest →
                </Link>

              </div>

            </div>

            {/* Security note */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">
              <span>🔒</span>
              Your information is protected.
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}