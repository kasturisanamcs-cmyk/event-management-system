"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CreateEventPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    registration_deadline: "",
    venue: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Clean preview URL when component is removed
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      // Start date changes
      if (name === "start_date") {
        // End date cannot be before start date
        if (prev.end_date && prev.end_date < value) {
          updated.end_date = "";
        }

        // Registration deadline cannot be after event start
        if (
          prev.registration_deadline &&
          prev.registration_deadline > value
        ) {
          updated.registration_deadline = "";
        }
      }

      // End date changes
      if (name === "end_date") {
        // Registration deadline cannot be after start date
        if (
          prev.registration_deadline &&
          prev.registration_deadline > value
        ) {
          // Keep registration deadline if it is before start date
        }
      }

      return updated;
    });
  }

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

    // Remove old preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl = URL.createObjectURL(file);

    setSelectedImage(file);
    setPreviewUrl(newPreviewUrl);
  }

  function removeImage() {
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

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const supabase = createClient();

      // --------------------------------
      // CHECK LOGIN
      // --------------------------------

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

// --------------------------------
// CHECK USER ROLE
// --------------------------------

const {
  data: profile,
  error: profileError,
} = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .maybeSingle();

console.log("Logged in user ID:", user.id);
console.log("Profile:", profile);
console.log("Profile error:", profileError);

if (profileError) {
  throw profileError;
}

if (!profile) {
  setError("Your profile could not be found.");
  return;
}

const userRole = profile.role?.trim().toUpperCase();

console.log("User role:", userRole);


// BASIC VALIDATION
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

      // --------------------------------
      // BASIC VALIDATION
      // --------------------------------

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

      // --------------------------------
      // DATE VALIDATION
      // --------------------------------

      if (form.start_date > form.end_date) {
        setError("End date cannot be before start date.");
        return;
      }

      if (form.registration_deadline > form.start_date) {
        setError(
          "Registration deadline cannot be after the event start date."
        );
        return;
      }

      // --------------------------------
      // IMAGE REQUIRED
      // --------------------------------

      if (!selectedImage) {
        setError("Please upload an event banner/poster.");
        return;
      }

      // --------------------------------
      // UPLOAD IMAGE
      // --------------------------------

      const fileExtension =
        selectedImage.name.split(".").pop()?.toLowerCase() || "jpg";

      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExtension}`;

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

      // --------------------------------
      // GET PUBLIC IMAGE URL
      // --------------------------------

      const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;

      // --------------------------------
      // CREATE EVENT
      // --------------------------------

      const { data, error: insertError } = await supabase
        .from("events")
        .insert({
          name: form.name.trim(),
          description: form.description.trim(),
          start_date: form.start_date,
          end_date: form.end_date,
          registration_deadline: form.registration_deadline,
          venue: form.venue.trim(),
          event_image: imageUrl,
          created_by: user.id,
          status: "DRAFT",
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

    console.log("Event created:", data);

    setSuccess("Event created successfully!");

    setTimeout(() => {
      router.push("/dashboard/events");
      router.refresh();
    }, 800);

      removeImage();

    } catch (err) {
      console.error("Create event error:", err);

      setError(
        err?.message ||
          "Something went wrong while creating the event."
      );
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

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
            Create an Event
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Create your event and manage competitions, organizers,
            participants and volunteers from one place.
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
                placeholder="e.g. TechFest 2026"
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
                placeholder="Describe your event..."
                rows={5}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Event Banner */}
            <div>
              <label
                htmlFor="event_image"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Event Banner / Poster
              </label>

              {!previewUrl ? (
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
              ) : (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">

                  {/* Preview */}
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Event poster preview"
                      className="max-h-[400px] w-full object-contain"
                    />
                  </div>

                  {/* Image info */}
                  <div className="flex items-center justify-between gap-4 border-t border-white/10 p-4">

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-200">
                        {selectedImage?.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {selectedImage
                          ? `${(selectedImage.size / 1024 / 1024).toFixed(2)} MB`
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
                        onClick={removeImage}
                        className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                      >
                        Remove
                      </button>

                    </div>
                  </div>
                </div>
              )}

              <input
                id="event_image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
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
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                />
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
                ? "Creating Event..."
                : "Create Event →"}
            </button>

          </div>
        </form>

        {/* Status */}
        <p className="mt-5 text-center text-xs text-slate-600">
          New events are saved as DRAFT until you publish them.
        </p>

      </div>
    </main>
  );
}