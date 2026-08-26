"use client";

import { useState } from "react";
import Link from "next/link";

export default function EventRegistrationPage() {
  const [teamType, setTeamType] = useState("Individual");

  return (
    <main className="min-h-screen bg-[#071225] text-white">

      {/* Header */}
      <header className="border-b border-white/10 bg-[#08152b]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">

          <Link
            href="/participant/events/details"
            className="text-sm text-gray-400 transition hover:text-white"
          >
            ← Back to Event
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 font-bold">
              E
            </div>

            <span className="font-bold">
              EventHub AI
            </span>
          </div>

        </div>
      </header>


      {/* Main */}
      <section className="mx-auto max-w-5xl px-6 py-10">

        {/* Heading */}
        <div className="mb-8">

          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
            Event Registration
          </p>

          <h1 className="text-4xl font-bold">
            Register for Tech Hackathon 2026
          </h1>

          <p className="mt-3 text-gray-400">
            Complete your details below to reserve your place in the event.
          </p>

        </div>


        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">

          {/* Registration Form */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">

            <form className="space-y-7">

              {/* Personal Details */}
              <section>

                <h2 className="text-xl font-bold">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the details that will appear on your registration.
                </p>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">

                  <Input
                    label="First Name"
                    placeholder="Enter first name"
                  />

                  <Input
                    label="Last Name"
                    placeholder="Enter last name"
                  />

                  <Input
                    label="Email Address"
                    placeholder="you@example.com"
                    type="email"
                  />

                  <Input
                    label="Phone Number"
                    placeholder="Enter phone number"
                    type="tel"
                  />

                  <Input
                    label="College / Institution"
                    placeholder="Enter college name"
                  />

                  <Input
                    label="Student ID"
                    placeholder="Enter student ID"
                  />

                </div>

              </section>


              {/* Team Details */}
              <section className="border-t border-white/10 pt-7">

                <h2 className="text-xl font-bold">
                  Participation Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Choose how you want to participate.
                </p>


                <div className="mt-5">

                  <label className="mb-3 block text-sm font-medium text-gray-200">
                    Participation Type
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">

                    <ParticipationOption
                      title="Individual"
                      description="Participate on your own"
                      selected={teamType === "Individual"}
                      onClick={() => setTeamType("Individual")}
                    />

                    <ParticipationOption
                      title="Team"
                      description="Participate with teammates"
                      selected={teamType === "Team"}
                      onClick={() => setTeamType("Team")}
                    />

                  </div>

                </div>


                {/* Team Name */}
                {teamType === "Team" && (
                  <div className="mt-5">

                    <label className="mb-2 block text-sm font-medium text-gray-200">
                      Team Name
                    </label>

                    <input
                      type="text"
                      placeholder="Enter your team name"
                      className="w-full rounded-xl border border-white/10 bg-[#0b1a32] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />

                  </div>
                )}

              </section>


              {/* Emergency Contact */}
              <section className="border-t border-white/10 pt-7">

                <h2 className="text-xl font-bold">
                  Emergency Contact
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Provide a contact person in case of an emergency.
                </p>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">

                  <Input
                    label="Contact Name"
                    placeholder="Enter contact name"
                  />

                  <Input
                    label="Contact Number"
                    placeholder="Enter contact number"
                    type="tel"
                  />

                </div>

              </section>


              {/* Agreement */}
              <section className="border-t border-white/10 pt-7">

                <label className="flex cursor-pointer items-start gap-3">

                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-blue-600"
                  />

                  <span className="text-sm leading-6 text-gray-400">
                    I confirm that the information provided is correct and
                    I agree to follow the event rules and guidelines.
                  </span>

                </label>

              </section>


              {/* Submit */}
             <Link
  href="/participant/events/details/register/payment"
  className="block w-full rounded-xl bg-blue-600 px-5 py-4 text-center font-bold transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/20"
>
  Continue to Payment →
</Link>

            </form>

          </div>


          {/* Event Summary */}
          <aside>

            <div className="sticky top-8 rounded-2xl border border-white/10 bg-[#0b1a32] p-6">

              <p className="text-sm text-gray-500">
                Event Summary
              </p>

              <h2 className="mt-3 text-xl font-bold">
                Tech Hackathon 2026
              </h2>

              <div className="my-6 h-px bg-white/10" />

              <SummaryItem
                icon="📅"
                label="Date"
                value="20 August 2026"
              />

              <SummaryItem
                icon="◷"
                label="Time"
                value="10:00 AM"
              />

              <SummaryItem
                icon="📍"
                label="Venue"
                value="Main Auditorium"
              />

              <SummaryItem
                icon="💰"
                label="Registration Fee"
                value="₹100"
              />

              <div className="mt-6 rounded-xl border border-blue-400/10 bg-blue-500/5 p-4">

                <p className="text-xs text-gray-500">
                  Available Slots
                </p>

                <p className="mt-1 text-lg font-bold text-cyan-400">
                  30 spots remaining
                </p>

              </div>

            </div>

          </aside>

        </div>

      </section>

    </main>
  );
}


/* Input */

function Input({
  label,
  placeholder,
  type = "text",
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-gray-200">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-[#0b1a32] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />

    </div>
  );
}


/* Participation Option */

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
      className={`rounded-xl border p-4 text-left transition ${
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


/* Summary Item */

function SummaryItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="mb-5 flex items-center gap-3">

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
        {icon}
      </div>

      <div>

        <p className="text-xs text-gray-500">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium">
          {value}
        </p>

      </div>

    </div>
  );
}