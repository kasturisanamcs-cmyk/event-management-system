
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setErrorMessage("");

    const cleanEmail = email.trim().toLowerCase();

    // --------------------------------
    // EMAIL VALIDATION
    // --------------------------------

    if (!cleanEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // --------------------------------
    // PASSWORD VALIDATION
    // --------------------------------

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // --------------------------------
      // SUPABASE LOGIN
      // --------------------------------

      const { data: authData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

if (loginError) {
  console.error("LOGIN ERROR:", loginError);
  setErrorMessage(loginError.message);
  return;
}

      const user = authData?.user;

      if (!user) {
        setErrorMessage(
          "Login was successful, but your account could not be loaded."
        );
        return;
      }

      // --------------------------------
      // GET USER ROLE
      // --------------------------------

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);

        // Sign out because we don't know what
        // permissions this account has.
        await supabase.auth.signOut();

        setErrorMessage(
          "Your account profile could not be loaded. Please try again."
        );

        return;
      }

      if (!profile?.role) {
        await supabase.auth.signOut();

        setErrorMessage(
          "Your account does not have a valid role."
        );

        return;
      }

      // --------------------------------
// ROLE-BASED ROUTING
// --------------------------------

const role = profile.role?.trim().toUpperCase();

const allowedRoles = [
  "ADMIN",
  "ORGANIZER",
  "COMPETITION_MEMBER",
  "VOLUNTEER",
  "PARTICIPANT",
];

if (!allowedRoles.includes(role)) {
  console.error("Unknown role:", profile.role);

  await supabase.auth.signOut();

  setErrorMessage(
    "Your account has an invalid role. Please contact the administrator."
  );

  return;
}

// All authenticated users enter through the same dashboard.
// The dashboard will display controls according to the user's role.
router.push("/dashboard");
router.refresh();


    } catch (error) {
      console.error("Unexpected login error:", error);

      setErrorMessage(
        "Something went wrong while signing in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* ========================================= */}
        {/* LEFT SIDE */}
        {/* ========================================= */}

        <section className="relative hidden overflow-hidden lg:flex">

          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[130px]" />

          <div className="absolute -bottom-40 right-[-100px] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />

          <div
            className="
              absolute inset-0 opacity-20
              [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)]
              [background-size:60px_60px]
            "
          />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

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
                <span>🤖</span>
                AI-Powered Event Management
              </div>

              <h1 className="text-5xl font-bold leading-tight xl:text-6xl">
                One platform.
                <br />
                Every event.
                <br />

                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Smarter management.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
                Manage competitions, participants, volunteers, tickets and
                event operations from one intelligent platform.
              </p>

              {/* Features */}

              <div className="mt-10 grid gap-3 sm:grid-cols-2">

                <Feature
                  icon="🤖"
                  title="AI Volunteer Assignment"
                  text="Match volunteers with suitable tasks."
                />

                <Feature
                  icon="🎫"
                  title="QR Ticket Verification"
                  text="Fast and secure event entry."
                />

                <Feature
                  icon="📅"
                  title="Event Management"
                  text="Manage competitions and schedules."
                />

                <Feature
                  icon="📊"
                  title="Event Analytics"
                  text="Track registrations and attendance."
                />

              </div>

            </div>

            {/* Footer */}

            <p className="text-sm text-slate-600">
              © 2026 EventNest. Smart Event Management System.
            </p>

          </div>

        </section>

        {/* ========================================= */}
        {/* RIGHT SIDE */}
        {/* ========================================= */}

        <section className="relative flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">

          <div className="pointer-events-none absolute right-[-150px] top-[-150px] h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[120px] lg:hidden" />

          <div className="relative w-full max-w-md">

            {/* Mobile logo */}

            <div className="mb-10 flex justify-center lg:hidden">

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

            <div className="mb-8">

              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">
                Welcome back
              </p>

              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Sign in to EventNest
              </h2>

              <p className="mt-4 leading-6 text-slate-400">
                Enter your account details to continue.
              </p>

            </div>

            {/* Login card */}

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">

              <form
                className="space-y-6"
                onSubmit={handleSubmit}
              >

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
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  />

                </div>

                {/* Password */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-200"
                    >
                      Password
                    </label>

                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-400 transition hover:text-blue-300"
                    >
                      Forgot password?
                    </Link>

                  </div>

                  <div className="relative">

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading}
                      className="
                        w-full rounded-xl border border-white/10
                        bg-[#0b1224] px-4 py-3.5 pr-12
                        text-sm text-white outline-none
                        transition
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

                </div>

                {/* Remember */}

                <div className="flex items-center gap-3">

                  <input
                    id="remember"
                    type="checkbox"
                    disabled={loading}
                    className="h-4 w-4 rounded border-white/20 bg-transparent accent-blue-600"
                  />

                  <label
                    htmlFor="remember"
                    className="text-sm text-slate-400"
                  >
                    Remember me
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

                {/* Sign in */}

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
                    ? "Signing In..."
                    : "Sign In"}

                  {!loading && (
                    <span className="transition group-hover:translate-x-1">
                      →
                    </span>
                  )}

                </button>

              </form>

              {/* Divider */}

              <div className="my-7 flex items-center gap-4">

                <div className="h-px flex-1 bg-white/10" />

                <span className="text-xs text-slate-600">
                  OR
                </span>

                <div className="h-px flex-1 bg-white/10" />

              </div>

              {/* Register */}

              <div className="text-center">

                <p className="text-sm text-slate-500">
                  Don't have an EventNest account?
                </p>

                <Link
                  href="/register"
                  className="mt-2 inline-block font-semibold text-blue-400 transition hover:text-blue-300"
                >
                  Create an account →
                </Link>

              </div>

            </div>

            {/* Security */}

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">
              <span>🔒</span>
              Your account information is protected.
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-slate-600">
              Your account type is automatically recognized after sign in.
              <br />
              No role selection is required.
            </p>

          </div>

        </section>

      </div>
    </main>
  );
}

/* ========================================= */
/* FEATURE COMPONENT */
/* ========================================= */

function Feature({ icon, title, text }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-blue-400/20 hover:bg-white/[0.06]">

      <div className="flex items-start gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-lg">
          {icon}
        </div>

        <div>

          <p className="text-sm font-semibold text-slate-200">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {text}
          </p>

        </div>

      </div>

    </div>
  );
}

