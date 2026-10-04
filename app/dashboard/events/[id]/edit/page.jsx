"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditEventPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    registration_deadline: "",
    venue: "",
  });

  const [eventStatus, setEventStatus] = useState("DRAFT");

  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------------------------
  // LOAD EVENT
  // --------------------------------------------------

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  async function loadEvent() {
    const supabase = createClient();

    try {
      setLoadingEvent(true);
      setError("");

      // Check login
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        router.push("/login");
        return;
      }

      // Load event
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select(
          `
          id,
          name,
          description,
          start_date,
          end_date,
          registration_deadline,
          venue,
          event_image,
          status,
          created_by
        `
        )
        .eq("id", id)
        .single();

      if (eventError) {
        throw eventError;
      }

      if (!eventData) {
        throw new Error("Event not found.");
      }

      // Check role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      const role = profile?.role?.trim().toUpperCase();

      // Only ADMIN or event creator can edit
      const isAdmin = role === "ADMIN";
      const isCreator = eventData.created_by === user.id;

      if (!isAdmin && !isCreator) {
        setError("You are not authorized to edit this event.");
        return;
      }

      setForm({
        name: eventData.name || "",
        description: eventData.description || "",
        start_date: eventData.start_date || "",
        end_date: eventData.end_date || "",
        registration_deadline:
          eventData.registration_deadline || "",
        venue: eventData.venue || "",
      });

      setEventStatus(eventData.status || "DRAFT");
      setCurrentImageUrl(eventData.event_image || "");
    } catch (err) {
      console.error("Load event error:", err);

      setError(
        err?.message || "Something went wrong while loading the event."
      );
    } finally {
      setLoadingEvent(false);
    }
  }

  // --------------------------------------------------
  // DATE HELPERS
  // --------------------------------------------------

  function getMaxEndDate(startDate) {
    if (!startDate) {
      return "";
    }

    const date = new Date(`${startDate}T00:00:00`);

    date.setDate(date.getDate() + 4);

    return date.toISOString().split("T")[0];
  }

  // --------------------------------------------------
  // FORM CHANGE
  // --------------------------------------------------

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      // Start date changed
      if (name === "start_date") {
        const maxEndDate = getMaxEndDate(value);

        // End date cannot be before start
        // and cannot exceed 5 calendar days
        if (
          prev.end_date &&
          (prev.end_date < value || prev.end_date > maxEndDate)
        ) {
          updated.end_date = "";
        }

        // Registration deadline cannot be after start
        if (
          prev.registration_deadline &&
          prev.registration_deadline > value
        ) {
          updated.registration_deadline = "";
        }
      }

      return updated;
    });
  }

  // --------------------------------------------------
  // IMAGE CHANGE
  // --------------------------------------------------

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    setError("");

    if (!file) {
      return;
    }

    // Allowed image types
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Invalid image type. Please upload PNG, JPG, JPEG or WEBP."
      );

      e.target.value = "";
      return;
    }

    // Maximum 5 MB
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Image must be smaller than 5 MB.");

      e.target.value = "";
      return;
    }

    // Remove previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl = URL.createObjectURL(file);

    setSelectedImage(file);
    setPreviewUrl(newPreviewUrl);
  }

  // --------------------------------------------------
  // REMOVE NEW IMAGE
  // --------------------------------------------------

  function removeNewImage() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(null);
    setPreviewUrl("");

    const imageInput = document.getElementById("event_image");

    if (imageInput) {
      imageInput.value = "";
    }
  }

  // --------------------------------------------------
  // SAVE CHANGES
  // --------------------------------------------------

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const supabase = createClient();

      // --------------------------------------------
      // CHECK LOGIN
      // --------------------------------------------

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        router.push("/login");
        return;
      }

      // --------------------------------------------
      // CHECK ROLE
      // --------------------------------------------

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      const role = profile?.role?.trim().toUpperCase();

      // --------------------------------------------
      // LOAD EVENT OWNER
      // --------------------------------------------

      const { data: existingEvent, error: existingError } =
        await supabase
          .from("events")
          .select("created_by, event_image")
          .eq("id", id)
          .single();

      if (existingError) {
        throw existingError;
      }

      const isAdmin = role === "ADMIN";
      const isCreator = existingEvent.created_by === user.id;

      if (!isAdmin && !isCreator) {
        setError("You are not authorized to edit this event.");
        return;
      }

      // --------------------------------------------
      // BASIC VALIDATION
      // --------------------------------------------

      if (
        !form.name.trim() ||
        !form.description.trim() ||
        !form.start_date ||
        !form.end_date ||
        !form.registration_deadline ||
        !form.venue.trim()
      ) {
        setError("Please fill in all fields.");
        return;
      }

      // --------------------------------------------
      // DATE VALIDATION
      // --------------------------------------------

      if (form.start_date > form.end_date) {
        setError("End date cannot be before start date.");
        return;
      }

      // --------------------------------------------
      // MAXIMUM 5 DAYS
      // --------------------------------------------

      const maxEndDate = getMaxEndDate(form.start_date);

      if (form.end_date > maxEndDate) {
        setError(
          "Event duration cannot be more than 5 calendar days."
        );
        return;
      }

      // --------------------------------------------
      // REGISTRATION DEADLINE
      // --------------------------------------------

      if (form.registration_deadline > form.start_date) {
        setError(
          "Registration deadline cannot be after the event start date."
        );
        return;
      }

      // --------------------------------------------
      // IMAGE
      // --------------------------------------------

      let imageUrl = existingEvent.event_image || "";

      // Only upload if user selected a NEW image
      if (selectedImage) {
        const fileExtension =
          selectedImage.name.split(".").pop()?.toLowerCase() ||
          "jpg";

        const fileName = `${user.id}/${crypto.randomUUID()}.${fileExtension}`;

        // Upload new image
        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(fileName, selectedImage, {
            cacheControl: "3600",
            upsert: false,
            contentType: selectedImage.type,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("images")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      // --------------------------------------------
      // UPDATE EVENT
      // --------------------------------------------

      const { error: updateError } = await supabase
        .from("events")
        .update({
          name: form.name.trim(),
          description: form.description.trim(),
          start_date: form.start_date,
          end_date: form.end_date,
          registration_deadline: form.registration_deadline,
          venue: form.venue.trim(),
          event_image: imageUrl,
        })
        .eq("id", id);

      if (updateError) {
        throw updateError;
      }

      // --------------------------------------------
      // SUCCESS
      // --------------------------------------------

      setSuccess("Event updated successfully!");

      setTimeout(() => {
        router.push(`/dashboard/events/${id}`);
        router.refresh();
      }, 800);
    } catch (err) {
      console.error("Edit event error:", err);

      setError(
        err?.message ||
          "Something went wrong while updating the event."
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loadingEvent) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#020817] text-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading event...
          </p>
        </div>
      </main>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const maxEndDate = getMaxEndDate(form.start_date);

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-[#020817] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">

        {/* Back */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 text-sm text-slate-400 transition hover:text-white"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            EventNest
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Edit Event
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Update your event information and replace the event
            banner whenever needed.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl sm:p-8"
        >
          <div className="space-y-6">

            {/* Event Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Event Name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* EVENT IMAGE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Event Banner / Poster
              </label>

              {/* NEW IMAGE PREVIEW */}
              {previewUrl ? (
                <div className="overflow-hidden rounded-xl border border-blue-500/30 bg-black/20">
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="New event poster preview"
                      className="max-h-[400px] w-full object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-white/10 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-200">
                        {selectedImage?.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {selectedImage
                          ? `${(
                              selectedImage.size /
                              1024 /
                              1024
                            ).toFixed(2)} MB`
                          : ""}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <label
                        htmlFor="event_image"
                        className="cursor-pointer rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5"
                      >
                        Change
                      </label>

                      <button
                        type="button"
                        onClick={removeNewImage}
                        className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : currentImageUrl ? (
                /* CURRENT IMAGE */
                <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
                  <div className="relative">
                    <img
                      src={currentImageUrl}
                      alt="Current event poster"
                      className="max-h-[400px] w-full object-contain"
                    />
                  </div>

                  <div className="flex flex-col gap-3 border-t border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        Current Event Poster
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Choose another image below to replace it.
                      </p>
                    </div>

                    <label
                      htmlFor="event_image"
                      className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-blue-500"
                    >
                      Replace Image
                    </label>
                  </div>
                </div>
              ) : (
                /* NO IMAGE */
                <label
                  htmlFor="event_image"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-6 py-10 text-center transition hover:border-blue-500/50 hover:bg-blue-500/[0.03]"
                >
                  <div className="mb-3 text-4xl">
                    🖼️
                  </div>

                  <p className="font-medium text-slate-200">
                    Choose Event Poster
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    PNG, JPG, JPEG or WEBP • Maximum 5 MB
                  </p>

                  <span className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold">
                    Choose Image
                  </span>
                </label>
              )}

              <input
                id="event_image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />

              <p className="mt-2 text-xs text-slate-500">
                Leave the current image unchanged if you don't want
                to replace it.
              </p>
            </div>

            {/* Dates */}
            <div className="grid gap-5 sm:grid-cols-2">

              {/* Start Date */}
              <div>
                <label
                  htmlFor="start_date"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Start Date
                </label>

                <input
                  id="start_date"
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  min={today}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                />
              </div>

              {/* End Date */}
              <div>
                <label
                  htmlFor="end_date"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  End Date
                </label>

                <input
                  id="end_date"
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  min={form.start_date || today}
                  max={maxEndDate || undefined}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Event duration can be a maximum of 5 calendar days.
                </p>
              </div>
            </div>

            {/* Registration Deadline */}
            <div>
              <label
                htmlFor="registration_deadline"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Registration Deadline
              </label>

              <input
                id="registration_deadline"
                type="date"
                name="registration_deadline"
                value={form.registration_deadline}
                min={today}
                max={form.start_date || undefined}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
              />

              <p className="mt-2 text-xs text-slate-500">
                Registration must close on or before the event starts.
              </p>
            </div>

            {/* Venue */}
            <div>
              <label
                htmlFor="venue"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Venue
              </label>

              <input
                id="venue"
                type="text"
                name="venue"
                value={form.venue}
                onChange={handleChange}
                placeholder="e.g. ABC College"
                className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-slate-500">
                Current Event Status
              </p>

              <p className="mt-1 font-semibold text-white">
                {eventStatus}
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Event status is preserved while editing.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-6 py-3.5 font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Saving Changes..."
                : "Save Changes →"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}