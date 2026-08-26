export default function Home() {
  return (
    <main className="min-h-screen bg-[#020817] text-white overflow-hidden">

      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020817]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-xl font-bold shadow-lg shadow-blue-500/20">
              E
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                EventNest
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block">
                Smart Event Management
              </p>
            </div>
          </a>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="/"
              className="text-sm font-medium text-white transition hover:text-blue-400"
            >
              Home
            </a>

            <a
              href="/events"
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Events
            </a>

            <a
              href="/about"
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              About
            </a>

            <a
              href="/login"
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Login
            </a>

            <a
              href="/register"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-blue-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-500"
            >
              Register
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xl md:hidden"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </header>


      {/* ================= HERO ================= */}
      <section className="relative">
        {/* Background glow */}
        <div className="pointer-events-none absolute left-[-200px] top-[-150px] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[140px]" />

        <div className="pointer-events-none absolute right-[-200px] top-[100px] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

        {/* Grid background */}
        <div className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-20 sm:px-8 lg:grid-cols-2 lg:px-10 lg:pb-32 lg:pt-28">

          {/* Hero Content */}
          <div>

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 backdrop-blur">
              <span>🤖</span>
              AI-Powered Event Management
            </div>

            <h2 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Manage College
              <br />
              Events with
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Intelligence.
              </span>
            </h2>

            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Automate registrations, manage competitions, assign volunteers
              using AI, verify QR tickets, organize schedules and manage your
              entire event from one intelligent platform.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">

              <a
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold shadow-xl shadow-blue-600/20 transition duration-200 hover:-translate-y-1 hover:bg-blue-500"
              >
                Get Started
                <span className="transition group-hover:translate-x-1">
                  →
                </span>
              </a>

              <a
                href="/events"
                className="inline-flex items-center justify-center rounded-xl border border-blue-500/50 bg-blue-500/5 px-7 py-3.5 font-semibold text-blue-300 transition duration-200 hover:-translate-y-1 hover:bg-blue-500/10"
              >
                Explore Events
              </a>

            </div>

            {/* Small trust indicators */}
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-500">
              <span>✓ Easy Registration</span>
              <span>✓ QR Tickets</span>
              <span>✓ AI Volunteer Assignment</span>
            </div>
          </div>


          {/* ================= HERO DASHBOARD ================= */}
          <div className="relative">

            {/* Status */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">EventNest Dashboard</p>
                <p className="text-sm text-slate-500">
                  Live event monitoring
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                Live
              </div>
            </div>


            {/* Bento Dashboard */}
            <div className="grid grid-cols-2 gap-4">

              {/* Tickets */}
              <div className="group rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.09]">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
                  🎫
                </div>

                <p className="text-sm text-slate-400">
                  Tickets Verified
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-400">
                  1,240
                </p>

                <p className="mt-2 text-xs text-emerald-400">
                  +18% this week
                </p>
              </div>


              {/* Volunteers */}
              <div className="group rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.09]">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-xl">
                  👥
                </div>

                <p className="text-sm text-slate-400">
                  Active Volunteers
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-400">
                  86
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Across 12 events
                </p>
              </div>


              {/* AI Assignment */}
              <div className="col-span-2 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1">

                <div className="flex items-start justify-between">

                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-xl">
                      🤖
                    </div>

                    <p className="mt-5 text-sm text-slate-400">
                      AI Volunteer Assignment
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      Smart Matching
                    </p>
                  </div>

                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-400">
                    Active
                  </span>

                </div>

                <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                </div>

                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>Skills matched</span>
                  <span>82%</span>
                </div>

              </div>


              {/* Events */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-purple-400/30">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-xl">
                  📅
                </div>

                <p className="text-sm text-slate-400">
                  Upcoming Events
                </p>

                <p className="mt-2 text-3xl font-bold text-purple-400">
                  12
                </p>
              </div>


              {/* Participants */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-orange-400/30">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-xl">
                  🧑‍💻
                </div>

                <p className="text-sm text-slate-400">
                  Participants
                </p>

                <p className="mt-2 text-3xl font-bold text-orange-400">
                  2.8K
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>


      {/* ================= STATS ================= */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 px-5 py-10 sm:px-8 md:grid-cols-4 lg:px-10">

          <div className="px-5 text-center">
            <p className="text-3xl font-bold sm:text-4xl">12+</p>
            <p className="mt-2 text-sm text-slate-500">
              Events Managed
            </p>
          </div>

          <div className="px-5 text-center">
            <p className="text-3xl font-bold text-blue-400 sm:text-4xl">
              2.8K+
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Participants
            </p>
          </div>

          <div className="mt-8 border-white/10 px-5 text-center sm:mt-0">
            <p className="text-3xl font-bold text-emerald-400 sm:text-4xl">
              86+
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Volunteers
            </p>
          </div>

          <div className="mt-8 border-white/10 px-5 text-center sm:mt-0">
            <p className="text-3xl font-bold text-cyan-400 sm:text-4xl">
              99%
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Ticket Verification
            </p>
          </div>

        </div>
      </section>


      {/* ================= FEATURES ================= */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">

        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Everything in one place
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Everything you need to run an event.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-400">
            EventNest brings registration, competitions, volunteers, tickets,
            schedules and communication together in one platform.
          </p>
        </div>


        {/* Bento Features */}
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {/* Large card */}
          <div className="group relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent p-8 transition duration-300 hover:-translate-y-1 hover:border-blue-400/40 lg:col-span-2">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
              🤖
            </div>

            <h3 className="mt-7 text-2xl font-bold">
              AI-Based Volunteer Assignment
            </h3>

            <p className="mt-4 max-w-xl leading-7 text-slate-400">
              Match volunteers with event tasks based on their skills,
              experience and availability. Organizers get smarter assignments
              without manually sorting every volunteer.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
                Skills
              </span>

              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
                Experience
              </span>

              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
                Availability
              </span>
            </div>

          </div>


          {/* QR */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-8 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-2xl">
              🎫
            </div>

            <h3 className="mt-7 text-xl font-bold">
              QR Ticket Verification
            </h3>

            <p className="mt-4 leading-7 text-slate-400">
              Generate digital tickets and verify participants quickly using
              QR codes at the event entrance.
            </p>

          </div>


          {/* Event management */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-8 transition duration-300 hover:-translate-y-1 hover:border-purple-400/30">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-400/10 text-2xl">
              📅
            </div>

            <h3 className="mt-7 text-xl font-bold">
              Event Management
            </h3>

            <p className="mt-4 leading-7 text-slate-400">
              Create events, competitions, schedules and announcements from
              one centralized organizer dashboard.
            </p>

          </div>


          {/* Registration */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-8 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10 text-2xl">
              📝
            </div>

            <h3 className="mt-7 text-xl font-bold">
              Simple Registration
            </h3>

            <p className="mt-4 leading-7 text-slate-400">
              Participants can discover events, register for competitions and
              manage their registrations easily.
            </p>

          </div>


          {/* Analytics */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-8 transition duration-300 hover:-translate-y-1 hover:border-orange-400/30">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-400/10 text-2xl">
              📊
            </div>

            <h3 className="mt-7 text-xl font-bold">
              Reports & Analytics
            </h3>

            <p className="mt-4 leading-7 text-slate-400">
              Organizers can monitor registrations, attendance, volunteers
              and event performance.
            </p>

          </div>

        </div>

      </section>


      {/* ================= HOW IT WORKS ================= */}
      <section className="border-y border-white/10 bg-white/[0.02]">

        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">

          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              Simple workflow
            </p>

            <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
              How EventNest works
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-slate-400">
              From event creation to attendance, everything follows a simple
              and organized workflow.
            </p>
          </div>


          <div className="mt-16 grid gap-8 md:grid-cols-4">

            {[
              ["01", "Create Event", "Organizer creates the event and competitions."],
              ["02", "Register", "Participants discover and register for events."],
              ["03", "Assign Volunteers", "AI helps match volunteers with suitable tasks."],
              ["04", "Manage Event", "QR tickets, attendance and reports are managed."],
            ].map(([number, title, description]) => (
              <div key={number} className="relative">

                <span className="text-5xl font-black text-blue-500/20">
                  {number}
                </span>

                <h3 className="mt-3 text-xl font-bold">
                  {title}
                </h3>

                <p className="mt-3 leading-6 text-slate-400">
                  {description}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="relative overflow-hidden px-5 py-24 sm:px-8">

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-blue-600/10" />

        <div className="mx-auto max-w-4xl rounded-3xl border border-blue-500/20 bg-white/[0.04] px-6 py-16 text-center backdrop-blur-xl sm:px-12">

          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Ready to get started?
          </p>

          <h2 className="mt-5 text-4xl font-bold sm:text-5xl">
            Make your next event smarter.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Bring participants, volunteers and organizers together with
            EventNest.
          </p>

          <a
            href="/register"
            className="mt-8 inline-flex rounded-xl bg-blue-600 px-8 py-3.5 font-semibold shadow-xl shadow-blue-600/20 transition duration-200 hover:-translate-y-1 hover:bg-blue-500"
          >
            Create Your Account →
          </a>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10 bg-[#010612]">

        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold">
                E
              </div>

              <span className="font-bold">
                EventNest
              </span>

            </div>

            <p className="mt-3 text-sm text-slate-500">
              Smart event management for modern events.
            </p>
          </div>


          <div className="flex flex-wrap gap-6 text-sm text-slate-500">
            <a href="/" className="transition hover:text-white">
              Home
            </a>

            <a href="/events" className="transition hover:text-white">
              Events
            </a>

            <a href="/about" className="transition hover:text-white">
              About
            </a>

            <a href="/login" className="transition hover:text-white">
              Login
            </a>
          </div>

        </div>

        <div className="border-t border-white/5 py-5 text-center text-xs text-slate-600">
          © 2026 EventNest. Smart Event Management System.
        </div>

      </footer>

    </main>
  );
}