"use client";

import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-[#071225] text-white">

      {/* Header */}
      <header className="border-b border-white/10 bg-[#08152b]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">

          <Link
            href="/participant/dashboard"
            className="text-sm text-gray-400 transition hover:text-white"
          >
            ← Dashboard
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

        {/* Success Message */}
        <div className="mb-8 text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-4xl">
            ✓
          </div>

          <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-green-400">
            Payment Successful
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            You're Registered! 🎉
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-gray-400">
            Your registration for Tech Hackathon 2026 has been confirmed.
            Keep this ticket safe and show the QR code at the event entrance.
          </p>

        </div>


        {/* Ticket */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl">

          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-500/10 p-6 sm:p-8">

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

              <div>

                <p className="text-sm font-medium text-blue-400">
                  EVENT TICKET
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  Tech Hackathon 2026
                </h2>

              </div>

              <div className="w-fit rounded-full border border-green-400/20 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-400">
                ✓ Confirmed
              </div>

            </div>

          </div>


          {/* Ticket Body */}
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_260px]">

            {/* Details */}
            <div>

              <div className="grid gap-5 sm:grid-cols-2">

                <TicketInfo
                  label="Participant"
                  value="Participant User"
                  icon="👤"
                />

                <TicketInfo
                  label="Registration ID"
                  value="EVT-2026-00124"
                  icon="🔢"
                />

                <TicketInfo
                  label="Date"
                  value="20 August 2026"
                  icon="📅"
                />

                <TicketInfo
                  label="Time"
                  value="10:00 AM"
                  icon="◷"
                />

                <TicketInfo
                  label="Venue"
                  value="Main Auditorium"
                  icon="📍"
                />

                <TicketInfo
                  label="Ticket Type"
                  value="Participant"
                  icon="🎟️"
                />

              </div>


              {/* Important Notice */}
              <div className="mt-8 rounded-2xl border border-yellow-500/10 bg-yellow-500/5 p-5">

                <div className="flex gap-3">

                  <span className="text-xl">
                    ⚠️
                  </span>

                  <div>

                    <h3 className="font-semibold text-yellow-400">
                      Important
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-gray-400">
                      Please bring your college ID and this ticket.
                      The QR code will be scanned at the event entrance.
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* QR Section */}
            <div className="flex flex-col items-center justify-center">

              <div className="rounded-2xl bg-white p-5 shadow-xl">

                {/* Demo QR Pattern */}
                <div className="grid h-48 w-48 grid-cols-7 gap-1 bg-white">

                  {qrPattern.map((filled, index) => (
                    <div
                      key={index}
                      className={filled ? "bg-black" : "bg-white"}
                    />
                  ))}

                </div>

              </div>

              <p className="mt-4 text-center text-sm font-medium">
                Scan at entrance
              </p>

              <p className="mt-1 text-center text-xs text-gray-500">
                EVT-2026-00124
              </p>

            </div>

          </div>


          {/* Ticket Footer */}
<div className="border-t border-dashed border-white/10 p-6 sm:p-8">

  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

    {/* Print */}
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 font-semibold transition hover:bg-white/[0.08]"
    >
      🖨️ Print Ticket
    </button>

    {/* Download */}
    <button
      type="button"
      onClick={() => alert("Download feature will be connected later.")}
      className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 font-semibold transition hover:bg-white/[0.08]"
    >
      📥 Download Ticket
    </button>

    {/* My Tickets */}
    <Link
      href="/participant/tickets"
      className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold transition hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/20"
    >
      🎫 View My Tickets
    </Link>

    {/* Dashboard */}
    <Link
      href="/participant/dashboard"
      className="rounded-xl border border-white/10 px-5 py-3 text-center font-semibold transition hover:bg-white/[0.05]"
    >
      ← Dashboard
    </Link>

  </div>

</div>

        </div>


        {/* Success Footer */}
        <div className="mt-8 text-center">

          <p className="text-sm text-gray-500">
            A confirmation will also be available in your
            <Link
              href="/participant/tickets"
              className="ml-1 text-blue-400 hover:text-blue-300"
            >
              My Tickets
            </Link>
            section.
          </p>

        </div>

      </section>

    </main>
  );
}


/* ================= TICKET INFO ================= */

function TicketInfo({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

      <div className="flex items-start gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-xs text-gray-500">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-semibold">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}


/* ================= DEMO QR ================= */

/*
  This is only a visual QR-style pattern for the frontend.

  It is NOT a real scannable QR code.

  Later, when we connect the database/backend,
  we will generate a real QR code containing
  the registration/ticket ID.
*/

const qrPattern = [
  1,1,1,1,1,0,1,
  1,0,0,0,1,1,0,
  1,0,1,0,1,0,1,
  1,0,0,0,1,1,1,
  1,1,1,1,1,0,1,
  0,1,0,1,0,1,0,
  1,0,1,1,1,0,1,

  1,0,1,0,1,1,0,
  0,1,0,1,0,0,1,
  1,1,1,0,1,1,0,
  0,0,1,1,0,1,1,
  1,0,1,0,1,0,1,
  0,1,1,1,0,1,0,
  1,0,0,1,1,0,1,

  1,1,1,1,1,0,1,
  1,0,0,0,1,1,0,
  1,0,1,0,1,0,1,
  1,0,0,0,1,1,1,
  1,1,1,1,1,0,1,
  0,1,0,1,0,1,0,
  1,1,0,0,1,0,1,
];