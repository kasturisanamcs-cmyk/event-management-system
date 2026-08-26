"use client";

import Link from "next/link";
import { useState } from "react";

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: "Participant User",
    email: "participant@example.com",
    phone: "+91 98765 43210",
    college: "ABC College of Technology",
    course: "B.Sc. Computer Science",
    year: "Third Year",
    city: "Pune, Maharashtra",
  });

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });

    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-[#071225] text-white">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/10 bg-[#08152b] p-5 lg:block">

        {/* Logo */}
        <div className="mb-10 flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-xl font-bold">
            E
          </div>

          <div>
            <h1 className="text-lg font-bold">
              EventHub AI
            </h1>

            <p className="text-xs text-gray-400">
              Smart Event Management
            </p>
          </div>

        </div>

        {/* Navigation */}
        <nav className="space-y-2">

          <NavItem
            icon="⌂"
            title="Dashboard"
            href="/participant/dashboard"
          />

          <NavItem
            icon="◈"
            title="Browse Events"
            href="/participant/events"
          />

          <NavItem
            icon="✓"
            title="My Registrations"
            href="/participant/registrations"
          />

          <NavItem
            icon="▣"
            title="My Tickets"
            href="/participant/tickets"
          />

          <NavItem
            icon="◷"
            title="Schedule"
            href="/participant/schedule"
          />

          <NavItem
            icon="🔔"
            title="Announcements"
            href="/participant/announcements"
          />

          <NavItem
            icon="👤"
            title="Profile"
            active
          />

        </nav>

        {/* Logout */}
        <div className="absolute bottom-5 left-5 right-5">

          <button
            type="button"
            onClick={() => alert("Logout will be connected later.")}
            className="w-full rounded-xl border border-white/10 px-4 py-3 text-left text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            ↪ Logout
          </button>

        </div>

      </aside>


      {/* Main */}
      <main className="lg:ml-64">

        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#08152b]/90 px-6 py-5 backdrop-blur-xl lg:px-8">

          <div>

            <h2 className="text-2xl font-bold">
              My Profile
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Manage your personal and college information.
            </p>

          </div>


          <div className="hidden items-center gap-3 sm:flex">

            <button
              type="button"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
            >
              🔔
            </button>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-2 py-2 pr-4">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-bold">
                U
              </div>

              <div>

                <p className="text-sm font-semibold">
                  Participant
                </p>

                <p className="text-xs text-gray-400">
                  Student
                </p>

              </div>

            </div>

          </div>

        </header>


        {/* Content */}
        <section className="p-6 lg:p-8">

          {/* Intro */}
          <div className="mb-8">

            <p className="mb-2 text-blue-400">
              Account Settings
            </p>

            <h1 className="text-3xl font-bold lg:text-4xl">
              Your Profile
            </h1>

            <p className="mt-2 max-w-2xl text-gray-400">
              Keep your information updated so event organizers
              can identify you correctly.
            </p>

          </div>


          {/* Profile Overview */}
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">

            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">

              {/* Avatar */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-400 text-4xl font-bold shadow-lg shadow-blue-500/20">
                {profile.name.charAt(0)}
              </div>


              {/* Info */}
              <div>

                <h2 className="text-2xl font-bold">
                  {profile.name}
                </h2>

                <p className="mt-1 text-gray-400">
                  {profile.course}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {profile.college}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">

                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                    Participant
                  </span>

                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                    Account Active
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* Form */}
          <form onSubmit={handleSave}>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 lg:p-8">

              <div className="mb-7">

                <h2 className="text-xl font-bold">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update your basic account information.
                </p>

              </div>


              {/* Personal Information */}
              <div className="grid gap-6 md:grid-cols-2">

                <InputField
                  label="Full Name"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                />

                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleChange}
                />

                <InputField
                  label="Phone Number"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                />

                <InputField
                  label="City"
                  name="city"
                  value={profile.city}
                  onChange={handleChange}
                />

              </div>


              {/* College Information */}
              <div className="mb-7 mt-10">

                <h2 className="text-xl font-bold">
                  College Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  This information may be used during event
                  registration and verification.
                </p>

              </div>


              <div className="grid gap-6 md:grid-cols-2">

                <InputField
                  label="College / Institution"
                  name="college"
                  value={profile.college}
                  onChange={handleChange}
                />


                <InputField
                  label="Course"
                  name="course"
                  value={profile.course}
                  onChange={handleChange}
                />


                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Year
                  </label>

                  <select
                    name="year"
                    value={profile.year}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-[#08152b] px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                  >

                    <option>First Year</option>
                    <option>Second Year</option>
                    <option>Third Year</option>
                    <option>Fourth Year</option>

                  </select>

                </div>

              </div>


              {/* Save Area */}
              <div className="mt-10 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">

                <div>

                  {saved && (
                    <p className="text-sm text-green-400">
                      ✓ Profile changes saved successfully.
                    </p>
                  )}

                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
                >
                  Save Changes
                </button>

              </div>

            </div>

          </form>


          {/* Security */}
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 lg:p-8">

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

              <div>

                <h2 className="font-bold">
                  🔐 Account Security
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Change your password and manage account security.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  alert("Password change will be connected later.")
                }
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5 hover:text-white"
              >
                Change Password
              </button>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}


/* ================= INPUT ================= */

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-gray-300">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-white/10 bg-[#08152b] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500"
      />

    </div>
  );
}


/* ================= NAVIGATION ================= */

function NavItem({ icon, title, href, active }) {
  return (
    <Link
      href={href || "#"}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      }`}
    >

      <span className="text-lg">
        {icon}
      </span>

      <span>
        {title}
      </span>

    </Link>
  );
}