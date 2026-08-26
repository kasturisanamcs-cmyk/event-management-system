"use client";

import Link from "next/link";

export default function TicketDetailsPage() {
  return (
    <div className="min-h-screen bg-[#071225] text-white">

      {/* Header */}
      <header className="border-b border-white/10 bg-[#08152b]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <Link
            href="/participant/tickets"
            className="text-sm text-gray-400 transition hover:text-white"
          >
            ← Back to My Tickets
          </Link>

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 font-bold">
              E
            </div>

            <div className="hidden sm:block">
              <h1 className="font-bold">
                EventHub AI
              </h1>

              <p className="text-xs text-gray-500">
                Smart Event Management
              </p>
            </div>

          </div>

        </div>
      </header>


      {/* Main */}
      <main className="mx-auto max-w-5xl px-6 py-10">

        {/* Heading */}
        <div className="mb-8 text-center">

          <p className="text-sm font-medium uppercase tracking-widest text-blue-400">
            Digital Event Ticket
          </p>

          <h1 className="mt-3 text-3xl font-bold lg:text-4xl">
            Your Event Pass
          </h1>

          <p className="mt-2 text-gray-400">
            Present this ticket and QR code at the event entrance.
          </p>

        </div>


        {/* Ticket */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b1a32] shadow-2xl">

          {/* Ticket Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/30 via-cyan-500/10 to-purple-600/20 p-7">

            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative">

              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                <div>

                  <p className="text-sm font-medium text-blue-300">
                    EVENT TICKET
                  </p>

                  <h2 className="mt-2 text-3xl font-bold">
                    Tech Hackathon 2026
                  </h2>

                  <p className="mt-2 text-gray-400">
                    Technology Competition
                  </p>

                </div>

                <div className="w-fit rounded-full border border-green-400/20 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-400">
                  ✓ Confirmed
                </div>

              </div>

            </div>

          </div>


          {/* Ticket Body */}
          <div className="grid lg:grid-cols-[1fr_280px]">

            {/* Details */}
            <div className="p-7 lg:p-10">

              <div className="grid gap-6 sm:grid-cols-2">

                <Info
                  icon="👤"
                  label="Participant"
                  value="Participant User"
                />

                <Info
                  icon="🔢"
                  label="Registration ID"
                  value="EVT-2026-00124"
                />

                <Info
                  icon="📅"
                  label="Date"
                  value="20 August 2026"
                />

                <Info
                  icon="◷"
                  label="Time"
                  value="10:00 AM – 5:00 PM"
                />

                <Info
                  icon="📍"
                  label="Venue"
                  value="Main Auditorium"
                />

                <Info
                  icon="🎟️"
                  label="Ticket Type"
                  value="Participant"
                />

              </div>


              {/* Divider */}
              <div className="my-8 h-px bg-white/10" />


              {/* Important */}
              <div className="rounded-2xl border border-blue-400/10 bg-blue-500/5 p-5">

                <p className="font-semibold text-blue-300">
                  Important
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Please carry your college ID card and show this QR
                  code at the event entrance for verification.
                </p>

              </div>


              {/* Actions */}
              <div className="mt-7 flex flex-wrap gap-3">

                <button
                  onClick={() => window.print()}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
                >
                  🖨️ Print Ticket
                </button>

                <Link
                  href="/participant/tickets"
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold transition hover:bg-white/[0.08]"
                >
                  Back to My Tickets
                </Link>

              </div>

            </div>


            {/* QR Section */}
            <div className="flex flex-col items-center justify-center border-t border-white/10 bg-[#08152b]/70 p-8 lg:border-l lg:border-t-0">

              <p className="mb-5 text-sm font-medium text-gray-400">
                Scan at Entrance
              </p>

              {/* QR */}
              <div className="rounded-2xl bg-white p-4 shadow-xl">

                <div className="grid h-48 w-48 grid-cols-12 gap-0.5">

                  {qrPattern.map((filled, index) => (

                    <div
                      key={index}
                      className={filled ? "bg-black" : "bg-white"}
                    />

                  ))}

                </div>

              </div>

              <p className="mt-5 text-center text-xs text-gray-500">
                Registration ID
              </p>

              <p className="mt-1 font-mono text-sm font-semibold text-gray-300">
                EVT-2026-00124
              </p>

            </div>

          </div>


          {/* Bottom */}
          <div className="border-t border-dashed border-white/15 px-7 py-5 text-center text-xs text-gray-500">
            This ticket is valid only for the registered participant.
          </div>

        </div>

      </main>

    </div>
  );
}


/* ================= INFO ================= */

function Info({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-xs text-gray-500">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-gray-200">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}


/* ================= DEMO QR ================= */

const qrPattern = [
  1,1,1,1,1,0,1,0,1,1,1,1,
  1,0,0,0,1,1,0,1,0,0,0,1,
  1,0,1,0,1,0,1,0,1,0,1,1,
  1,0,0,0,1,1,1,1,0,0,0,1,
  1,1,1,1,1,0,1,0,1,1,1,1,
  0,1,0,1,0,1,0,1,0,1,0,1,
  1,0,1,1,1,0,1,0,1,0,1,0,
  0,1,1,0,1,1,0,1,1,1,0,1,
  1,1,0,1,0,0,1,0,1,1,1,0,
  1,0,1,0,1,1,0,1,0,1,0,1,
  0,1,0,1,1,0,1,1,1,0,1,0,
  1,1,1,0,1,1,0,1,0,1,1,1,
];