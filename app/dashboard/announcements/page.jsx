"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function AnnouncementsPage() {
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    event_id: "",
    title: "",
    message: "",
    audience: "ALL",
    announcement_status: "PUBLISHED",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!currentUser) {
        window.location.href = "/login";
        return;
      }

      setUser(currentUser);

      // Load organizer's events
      const {
        data: eventData,
        error: eventError,
      } = await supabase
        .from("events")
        .select("id, name")
        .eq("created_by", currentUser.id)
        .order("created_at", { ascending: false });

      if (eventError) throw eventError;

      setEvents(eventData || []);

      // Load organizer's announcements
      const {
        data: announcementData,
        error: announcementError,
      } = await supabase
        .from("announcements")
        .select(
          `
            id,
            event_id,
            title,
            message,
            audience,
            announcement_status,
            created_at,
            updated_at
          `
        )
        .eq("created_by", currentUser.id)
        .order("created_at", { ascending: false });

      if (announcementError) throw announcementError;

      setAnnouncements(announcementData || []);
    } catch (err) {
      console.error("Announcements load error:", err);
      setError(err.message || "Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function resetForm() {
    setEditingId(null);

    setForm({
      event_id: "",
      title: "",
      message: "",
      audience: "ALL",
      announcement_status: "PUBLISHED",
    });

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!user) {
      setError("You are not logged in.");
      return;
    }

    if (!form.event_id) {
      setError("Please select an event.");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter an announcement title.");
      return;
    }

    if (!form.message.trim()) {
      setError("Please enter the announcement message.");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        const {
          error: updateError,
        } = await supabase
          .from("announcements")
          .update({
            event_id: form.event_id,
            title: form.title.trim(),
            message: form.message.trim(),
            audience: form.audience,
            announcement_status: form.announcement_status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)
          .eq("created_by", user.id);

        if (updateError) throw updateError;

        setSuccess("Announcement updated successfully.");
      } else {
        const {
          error: insertError,
        } = await supabase
          .from("announcements")
          .insert({
            event_id: form.event_id,
            created_by: user.id,
            title: form.title.trim(),
            message: form.message.trim(),
            audience: form.audience,
            announcement_status: form.announcement_status,
          });

        if (insertError) throw insertError;

        setSuccess("Announcement created successfully.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      console.error("Announcement save error:", err);
      setError(
        err.message || "Failed to save announcement."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(announcement) {
    setEditingId(announcement.id);

    setForm({
      event_id: announcement.event_id || "",
      title: announcement.title || "",
      message: announcement.message || "",
      audience: announcement.audience || "ALL",
      announcement_status:
        announcement.announcement_status || "PUBLISHED",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this announcement?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const {
        error: deleteError,
      } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id)
        .eq("created_by", user.id);

      if (deleteError) throw deleteError;

      setSuccess("Announcement deleted successfully.");

      if (editingId === id) {
        resetForm();
      }

      await loadData();
    } catch (err) {
      console.error("Announcement delete error:", err);
      setError(
        err.message || "Failed to delete announcement."
      );
    }
  }

  function getEventName(eventId) {
    const event = events.find(
      (item) => item.id === eventId
    );

    return event?.name || "Unknown Event";
  }

  function getAudienceLabel(audience) {
    if (audience === "PARTICIPANTS") {
      return "Participants";
    }

    if (audience === "COMPETITION_MEMBERS") {
      return "Competition Members";
    }

    return "Everyone";
  }

  function getStatusStyle(status) {
    if (status === "PUBLISHED") {
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    }

    return "border-amber-500/20 bg-amber-500/10 text-amber-400";
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6">

        {/* HEADER */}

        <div>
          <p className="text-sm font-medium text-blue-400">
            Organizer
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Announcements
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Create and manage announcements for your events.
          </p>
        </div>

        {/* SUCCESS */}

        {success && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            {success}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* CREATE / EDIT FORM */}

        <section className="rounded-2xl border border-white/10 bg-[#050b18] p-5 shadow-xl sm:p-6">

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {editingId
                  ? "Edit Announcement"
                  : "Create Announcement"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Share important information with your event audience.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Loading...
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
              <p className="font-medium text-white">
                No events found
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Create an event first before creating an announcement.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* EVENT */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Event
                </label>

                <select
                  name="event_id"
                  value={form.event_id}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50"
                >
                  <option value="">
                    Select an event
                  </option>

                  {events.map((event) => (
                    <option
                      key={event.id}
                      value={event.id}
                    >
                      {event.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* TITLE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Announcement Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Example: Competition timing updated"
                  maxLength={150}
                  className="w-full rounded-xl border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-blue-500/50"
                />
              </div>

              {/* MESSAGE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Message
                </label>

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your announcement here..."
                  rows={6}
                  maxLength={2000}
                  className="w-full resize-y rounded-xl border border-white/10 bg-[#020617] px-4 py-3 text-sm leading-6 text-white placeholder:text-slate-600 outline-none transition focus:border-blue-500/50"
                />

                <p className="mt-2 text-right text-xs text-slate-600">
                  {form.message.length}/2000
                </p>
              </div>

              {/* AUDIENCE + STATUS */}

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Audience
                  </label>

                  <select
                    name="audience"
                    value={form.audience}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50"
                  >
                    <option value="ALL">
                      Everyone
                    </option>

                    <option value="PARTICIPANTS">
                      Participants
                    </option>

                    <option value="COMPETITION_MEMBERS">
                      Competition Members
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Status
                  </label>

                  <select
                    name="announcement_status"
                    value={form.announcement_status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50"
                  >
                    <option value="PUBLISHED">
                      Published
                    </option>

                    <option value="DRAFT">
                      Draft
                    </option>
                  </select>
                </div>

              </div>

              {/* BUTTON */}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  Clear
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Announcement"
                    : "Publish Announcement"}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* ANNOUNCEMENT LIST */}

        <section className="rounded-2xl border border-white/10 bg-[#050b18] p-5 shadow-xl sm:p-6">

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Your Announcements
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage announcements created for your events.
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Loading announcements...
            </div>
          ) : announcements.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
              <p className="text-base font-semibold text-white">
                No announcements yet
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Create your first announcement using the form above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <article
                  key={announcement.id}
                  className="rounded-2xl border border-white/10 bg-[#020617] p-5 transition hover:border-white/20"
                >
                  {/* TOP */}

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(
                            announcement.announcement_status
                          )}`}
                        >
                          {announcement.announcement_status}
                        </span>

                        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-400">
                          {getAudienceLabel(
                            announcement.audience
                          )}
                        </span>

                      </div>

                      <h3 className="mt-3 break-words text-lg font-semibold text-white">
                        {announcement.title}
                      </h3>

                      <p className="mt-2 text-xs font-medium text-slate-500">
                        {getEventName(announcement.event_id)}
                      </p>
                    </div>

                    {/* ACTIONS */}

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(announcement)
                        }
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(announcement.id)
                        }
                        className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* MESSAGE */}

                  <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
                      {announcement.message}
                    </p>
                  </div>

                  {/* DATE */}

                  <div className="mt-4 flex flex-col gap-1 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      Created{" "}
                      {new Date(
                        announcement.created_at
                      ).toLocaleString()}
                    </span>

                    {announcement.updated_at !==
                      announcement.created_at && (
                      <span>
                        Updated{" "}
                        {new Date(
                          announcement.updated_at
                        ).toLocaleString()}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}