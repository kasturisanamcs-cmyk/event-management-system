"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
const [email, setEmail] = useState("");
const [loading, setLoading] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
const [successMessage, setSuccessMessage] = useState("");

async function handleSubmit(event) {
event.preventDefault();


if (loading) return;

setErrorMessage("");
setSuccessMessage("");

const cleanEmail = email.trim().toLowerCase();

if (!cleanEmail) {
  setErrorMessage("Please enter your email address.");
  return;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(cleanEmail)) {
  setErrorMessage("Please enter a valid email address.");
  return;
}

setLoading(true);

try {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(
    cleanEmail,
    {
      redirectTo: `${window.location.origin}/reset-password`,
    }
  );

  if (error) {
    console.error("PASSWORD RESET ERROR:", error);
    setErrorMessage(error.message);
    return;
  }

  setSuccessMessage(
    "If an account exists with this email, a password reset link has been sent. Please check your inbox."
  );

  setEmail("");
} catch (error) {
  console.error("Unexpected password reset error:", error);

  setErrorMessage(
    "Something went wrong. Please try again."
  );
} finally {
  setLoading(false);
}


}

return ( <main className="min-h-screen bg-[#020817] text-white"> <div className="flex min-h-screen items-center justify-center px-5 py-12">


    <div className="w-full max-w-md">

      {/* Logo */}

      <div className="mb-10 flex justify-center">

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
          Account recovery
        </p>

        <h1 className="text-4xl font-bold tracking-tight">
          Forgot your password?
        </h1>

        <p className="mt-4 leading-6 text-slate-400">
          Enter the email address associated with your
          EventNest account and we'll send you a password
          reset link.
        </p>

      </div>

      {/* Card */}

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
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
                w-full rounded-xl
                border border-white/10
                bg-[#0b1224]
                px-4 py-3.5
                text-sm text-white
                outline-none
                transition
                placeholder:text-slate-600
                focus:border-blue-500
                focus:ring-2 focus:ring-blue-500/20
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />

          </div>

          {/* Error */}

          {errorMessage && (
            <div
              role="alert"
              className="
                rounded-xl
                border border-red-400/20
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
                rounded-xl
                border border-emerald-400/20
                bg-emerald-500/10
                px-4 py-3
                text-sm leading-6
                text-emerald-300
              "
            >
              {successMessage}
            </div>
          )}

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
              ? "Sending Reset Link..."
              : "Send Reset Link"}
          </button>

        </form>

        {/* Back to login */}

        <div className="mt-7 text-center">

          <Link
            href="/login"
            className="
              font-semibold
              text-blue-400
              transition
              hover:text-blue-300
            "
          >
            ← Back to Sign In
          </Link>

        </div>

      </div>

      {/* Security */}

      <div className="mt-6 text-center text-xs leading-5 text-slate-600">
        🔒 Your account information is protected.
      </div>

    </div>

  </div>
</main>


);
}
