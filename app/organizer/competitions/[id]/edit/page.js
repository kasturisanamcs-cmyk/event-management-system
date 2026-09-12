"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { createClient } from "@/lib/supabase/client";

/* =========================================================
   HELPERS
========================================================= */

function createId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function timeToMinutes(time) {
  if (!time) return null;

  const [hours, minutes] = time.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  if (
    totalMinutes === null ||
    totalMinutes === undefined ||
    Number.isNaN(totalMinutes)
  ) {
    return "";
  }

  totalMinutes = Math.max(
    0,
    Math.min(1439, totalMinutes)
  );

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}`;
}

function addThirtyMinutes(time) {
  const minutes = timeToMinutes(time);

  if (minutes === null) return "";

  return minutesToTime(minutes + 30);
}

function subtractOneMinute(time) {
  const minutes = timeToMinutes(time);

  if (minutes === null) return "";

  return minutesToTime(minutes - 1);
}

function addOneMinute(time) {
  const minutes = timeToMinutes(time);

  if (minutes === null) return "";

  return minutesToTime(minutes + 1);
}

function addDays(dateString, days) {
  if (!dateString) return "";

  const date = new Date(
    `${dateString}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMaximumSessionDate(event) {
  const eventStartDate =
    event?.start_date?.slice(0, 10);

  const eventEndDate =
    event?.end_date?.slice(0, 10);

  if (!eventStartDate) {
    return "";
  }

  const threeDaysAfter =
    addDays(eventStartDate, 3);

  if (
    eventEndDate &&
    eventEndDate < threeDaysAfter
  ) {
    return eventEndDate;
  }

  return threeDaysAfter;
}

/* =========================================================
   EMPTY SESSION
========================================================= */

function createEmptySession(number, venue = "") {
  return {
    id: createId(),

    /*
     * Existing database sessions have a real UUID.
     * New sessions have a temporary client ID.
     */
    databaseId: null,

    session_name: `Session ${number}`,

    session_date: "",

    start_time: "",

    end_time: "",

    check_in_start: "",

    check_in_end: "",

    late_entry_allowed: false,

    venue,
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function EditCompetitionPage() {
  const { id: competitionId } = useParams();
  const router = useRouter();

  const [competition, setCompetition] =
    useState(null);

  const [event, setEvent] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [sessionErrors, setSessionErrors] =
    useState({});

  /* =========================================================
     POSTER
  ========================================================= */

  const [posterFile, setPosterFile] =
    useState(null);

  const [posterPreview, setPosterPreview] =
    useState("");

  const [currentPosterUrl, setCurrentPosterUrl] =
    useState("");

  const [removeExistingPoster, setRemoveExistingPoster] =
    useState(false);

  /* =========================================================
     FORM
  ========================================================= */

  const [form, setForm] = useState({
    name: "",
    description: "",
    rules: "",
    registration_fee: "0",
    capacity: "",
    status: "DRAFT",
  });

  /* =========================================================
     SESSIONS
  ========================================================= */

  const [sessions, setSessions] =
    useState([]);

  /* =========================================================
     LOAD
  ========================================================= */

  useEffect(() => {
    if (competitionId) {
      loadCompetition();
    }
  }, [competitionId]);

  /* =========================================================
     CLEAN OBJECT URL
  ========================================================= */

  useEffect(() => {
    return () => {
      if (posterPreview) {
        URL.revokeObjectURL(
          posterPreview
        );
      }
    };
  }, [posterPreview]);

  /* =========================================================
     LOAD COMPETITION
  ========================================================= */

  async function loadCompetition() {
    const supabase = createClient();

    setLoading(true);
    setError("");

    try {
      /* -----------------------------------------
         AUTH
      ----------------------------------------- */

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user) {
        router.push("/login");
        return;
      }

      const user = session.user;

      /* -----------------------------------------
         COMPETITION
      ----------------------------------------- */

      const {
        data: competitionData,
        error: competitionError,
      } = await supabase
        .from("competitions")
        .select(`
          id,
          event_id,
          organizer_id,
          name,
          description,
          rules,
          registration_fee,
          capacity,
          competition_date,
          start_time,
          end_time,
          check_in_start,
          check_in_end,
          late_entry_allowed,
          venue,
          status,
          poster_url,
          created_at,
          events (
            id,
            name,
            description,
            start_date,
            end_date,
            registration_deadline,
            venue,
            status
          )
        `)
        .eq("id", competitionId)
        .eq("organizer_id", user.id)
        .single();

      if (competitionError) {
        console.error(
          "Competition loading error:",
          competitionError
        );

        throw new Error(
          "You do not have permission to edit this competition."
        );
      }

      if (!competitionData) {
        throw new Error(
          "Competition not found."
        );
      }

      setCompetition(
        competitionData
      );

      setEvent(
        competitionData.events
      );

      /* -----------------------------------------
         FORM
      ----------------------------------------- */

      setForm({
        name:
          competitionData.name || "",

        description:
          competitionData.description || "",

        rules:
          competitionData.rules || "",

        registration_fee:
          competitionData.registration_fee !==
          null
            ? String(
                competitionData.registration_fee
              )
            : "0",

        capacity:
          competitionData.capacity !==
            null &&
          competitionData.capacity !==
            undefined
            ? String(
                competitionData.capacity
              )
            : "",

        status:
          competitionData.status ||
          "DRAFT",
      });

      /* -----------------------------------------
         POSTER
      ----------------------------------------- */

      setCurrentPosterUrl(
        competitionData.poster_url ||
          ""
      );

      /* -----------------------------------------
         SESSIONS
      ----------------------------------------- */

      const {
        data: sessionData,
        error: sessionsError,
      } = await supabase
        .from("competition_sessions")
        .select(`
          id,
          session_name,
          session_date,
          start_time,
          end_time,
          check_in_start,
          check_in_end,
          late_entry_allowed,
          venue,
          created_at
        `)
        .eq(
          "competition_id",
          competitionId
        )
        .order(
          "session_date",
          {
            ascending: true,
          }
        )
        .order(
          "start_time",
          {
            ascending: true,
          }
        );

      if (sessionsError) {
        console.error(
          "Sessions loading error:",
          sessionsError
        );

        throw sessionsError;
      }

      /*
       * If sessions exist, load them.
       *
       * If no session exists for an older
       * competition, create one from the
       * legacy competition schedule fields.
       */

      if (
        sessionData &&
        sessionData.length > 0
      ) {
        setSessions(
          sessionData.map(
            (session, index) => ({
              id: session.id,

              databaseId: session.id,

              session_name:
                session.session_name ||
                `Session ${
                  index + 1
                }`,

              session_date:
                session.session_date ||
                "",

              start_time:
                session.start_time
                  ?.slice(0, 5) ||
                "",

              end_time:
                session.end_time
                  ?.slice(0, 5) ||
                "",

              check_in_start:
                session.check_in_start
                  ?.slice(0, 5) ||
                "",

              check_in_end:
                session.check_in_end
                  ?.slice(0, 5) ||
                "",

              late_entry_allowed:
                Boolean(
                  session.late_entry_allowed
                ),

              venue:
                session.venue ||
                competitionData.venue ||
                "",
            })
          )
        );
      } else {
        /*
         * Backward compatibility.
         *
         * Old competition may have schedule
         * stored only in competitions table.
         */

        setSessions([
          {
            id: createId(),

            databaseId: null,

            session_name:
              "Session 1",

            session_date:
              competitionData.competition_date
                ?.slice(0, 10) ||
              "",

            start_time:
              competitionData.start_time
                ?.slice(0, 5) ||
              "",

            end_time:
              competitionData.end_time
                ?.slice(0, 5) ||
              "",

            check_in_start:
              competitionData
                .check_in_start
                ?.slice(0, 5) ||
              "",

            check_in_end:
              competitionData
                .check_in_end
                ?.slice(0, 5) ||
              "",

            late_entry_allowed:
              Boolean(
                competitionData
                  .late_entry_allowed
              ),

            venue:
              competitionData.venue ||
              competitionData.events
                ?.venue ||
              "",
          },
        ]);
      }
    } catch (err) {
      console.error(
        "Edit competition loading error:",
        err
      );

      setError(
        err?.message ||
          "Could not load the competition."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  function handleChange(eventObject) {
    const {
      name,
      value,
      type,
      checked,
    } = eventObject.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  /* =========================================================
     SESSION ERROR HELPERS
  ========================================================= */

  function clearSessionFieldError(
    sessionId,
    field
  ) {
    setSessionErrors((previous) => {
      const current =
        previous[sessionId];

      if (
        !current ||
        !current[field]
      ) {
        return previous;
      }

      return {
        ...previous,

        [sessionId]: {
          ...current,

          [field]: "",
        },
      };
    });
  }

  function setSessionFieldError(
    sessionId,
    field,
    message
  ) {
    setSessionErrors((previous) => ({
      ...previous,

      [sessionId]: {
        ...(previous[sessionId] ||
          {}),

        [field]: message,
      },
    }));
  }

  /* =========================================================
     SESSION CHANGE
  ========================================================= */

  function handleSessionChange(
    sessionId,
    eventObject
  ) {
    const {
      name,
      value,
      type,
      checked,
    } = eventObject.target;

    clearSessionFieldError(
      sessionId,
      name
    );

    setSessions((previous) =>
      previous.map((session) => {
        if (
          session.id !== sessionId
        ) {
          return session;
        }

        const updatedSession = {
          ...session,

          [name]:
            type === "checkbox"
              ? checked
              : value,
        };

        /* -----------------------------------------
           DATE
        ----------------------------------------- */

        if (
          name === "session_date"
        ) {
          const minDate =
            event?.start_date?.slice(
              0,
              10
            );

          const maxDate =
            getMaximumSessionDate(
              event
            );

          if (
            minDate &&
            value &&
            value < minDate
          ) {
            setSessionFieldError(
              sessionId,
              "session_date",
              `Date cannot be before the event start date (${minDate}).`
            );

            return {
              ...updatedSession,

              session_date: "",
            };
          }

          if (
            maxDate &&
            value &&
            value > maxDate
          ) {
            setSessionFieldError(
              sessionId,
              "session_date",
              `Date cannot be more than 3 days after the event start date. Maximum allowed date is ${maxDate}.`
            );

            return {
              ...updatedSession,

              session_date: "",
            };
          }
        }

        /* -----------------------------------------
           START TIME
        ----------------------------------------- */

        if (
          name === "start_time"
        ) {
          if (
            updatedSession.end_time &&
            timeToMinutes(
              updatedSession.end_time
            ) <
              timeToMinutes(value) +
                30
          ) {
            updatedSession.end_time =
              "";
          }

          if (
            updatedSession.check_in_end &&
            timeToMinutes(
              updatedSession.check_in_end
            ) >
              timeToMinutes(value)
          ) {
            updatedSession.check_in_end =
              "";
          }

          if (
            updatedSession.check_in_start &&
            timeToMinutes(
              updatedSession.check_in_start
            ) >=
              timeToMinutes(value)
          ) {
            updatedSession.check_in_start =
              "";

            updatedSession.check_in_end =
              "";
          }
        }

        /* -----------------------------------------
           END TIME
        ----------------------------------------- */

        if (
          name === "end_time"
        ) {
          const startMinutes =
            timeToMinutes(
              updatedSession.start_time
            );

          const endMinutes =
            timeToMinutes(value);

          if (
            startMinutes !== null &&
            endMinutes !== null &&
            endMinutes <
              startMinutes + 30
          ) {
            setSessionFieldError(
              sessionId,
              "end_time",
              "End time must be at least 30 minutes after the start time."
            );

            return {
              ...updatedSession,

              end_time: "",
            };
          }
        }

        /* -----------------------------------------
           CHECK-IN START
        ----------------------------------------- */

        if (
          name ===
          "check_in_start"
        ) {
          const startMinutes =
            timeToMinutes(
              updatedSession.start_time
            );

          const checkInStartMinutes =
            timeToMinutes(value);

          if (
            startMinutes !== null &&
            checkInStartMinutes !==
              null &&
            checkInStartMinutes >=
              startMinutes
          ) {
            setSessionFieldError(
              sessionId,
              "check_in_start",
              "Check-in start must be before the session start time."
            );

            updatedSession.check_in_start =
              "";

            updatedSession.check_in_end =
              "";
          }

          if (
            updatedSession.check_in_end &&
            value &&
            timeToMinutes(
              updatedSession.check_in_end
            ) <=
              timeToMinutes(value)
          ) {
            updatedSession.check_in_end =
              "";
          }
        }

        /* -----------------------------------------
           CHECK-IN END
        ----------------------------------------- */

        if (
          name === "check_in_end"
        ) {
          const checkInStartMinutes =
            timeToMinutes(
              updatedSession.check_in_start
            );

          const checkInEndMinutes =
            timeToMinutes(value);

          const startMinutes =
            timeToMinutes(
              updatedSession.start_time
            );

          if (
            checkInStartMinutes !==
              null &&
            checkInEndMinutes !==
              null &&
            checkInEndMinutes <=
              checkInStartMinutes
          ) {
            setSessionFieldError(
              sessionId,
              "check_in_end",
              "Check-in end must be after check-in start."
            );

            return {
              ...updatedSession,

              check_in_end: "",
            };
          }

          if (
            startMinutes !== null &&
            checkInEndMinutes !==
              null &&
            checkInEndMinutes >
              startMinutes
          ) {
            setSessionFieldError(
              sessionId,
              "check_in_end",
              "Check-in end cannot be after the session start time."
            );

            return {
              ...updatedSession,

              check_in_end: "",
            };
          }
        }

        return updatedSession;
      })
    );
  }

  /* =========================================================
     ADD SESSION
  ========================================================= */

  function addSession() {
    setSessions((previous) => [
      ...previous,

      createEmptySession(
        previous.length + 1,
        event?.venue || ""
      ),
    ]);
  }

  /* =========================================================
     REMOVE SESSION
  ========================================================= */

  function removeSession(
    sessionId
  ) {
    if (sessions.length === 1) {
      setError(
        "At least one competition session is required."
      );

      return;
    }

    setSessions((previous) => {
      const remaining =
        previous.filter(
          (session) =>
            session.id !==
            sessionId
        );

      return remaining.map(
        (session, index) => ({
          ...session,

          session_name:
            `Session ${
              index + 1
            }`,
        })
      );
    });

    setSessionErrors((previous) => {
      const copy = {
        ...previous,
      };

      delete copy[sessionId];

      return copy;
    });
  }

  /* =========================================================
     POSTER
  ========================================================= */

  function handlePosterChange(
    eventObject
  ) {
    const file =
      eventObject.target.files?.[0];

    if (!file) return;

    setError("");

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setError(
        "Please select an image file for the competition poster."
      );

      eventObject.target.value =
        "";

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Competition poster must be smaller than 5 MB."
      );

      eventObject.target.value =
        "";

      return;
    }

    if (posterPreview) {
      URL.revokeObjectURL(
        posterPreview
      );
    }

    setPosterFile(file);

    setPosterPreview(
      URL.createObjectURL(file)
    );

    setRemoveExistingPoster(
      false
    );
  }

  function removePoster() {
    if (posterPreview) {
      URL.revokeObjectURL(
        posterPreview
      );
    }

    setPosterFile(null);

    setPosterPreview("");

    setRemoveExistingPoster(
      true
    );
  }

  /* =========================================================
     UPLOAD POSTER
  ========================================================= */

  async function uploadPoster(
    supabase,
    user
  ) {
    if (!posterFile) {
      return null;
    }

    const safeFileName =
      posterFile.name
        .toLowerCase()
        .replace(
          /[^a-z0-9.-]/g,
          "-"
        );

    const filePath =
      `competitions/${user.id}/${createId()}-${safeFileName}`;

    const {
      error: uploadError,
    } = await supabase.storage
      .from("images")
      .upload(
        filePath,
        posterFile,
        {
          cacheControl: "3600",

          upsert: false,

          contentType:
            posterFile.type,
        }
      );

    if (uploadError) {
      console.error(
        "Poster upload error:",
        uploadError
      );

      throw new Error(
        uploadError.message ||
          "Could not upload competition poster."
      );
    }

    const { data } =
      supabase.storage
        .from("images")
        .getPublicUrl(
          filePath
        );

    return (
      data?.publicUrl || null
    );
  }

  /* =========================================================
     VALIDATE SESSION
  ========================================================= */

  function validateSession(
    session,
    index
  ) {
    const sessionNumber =
      index + 1;

    const fieldErrors = {};

    const eventStartDate =
      event?.start_date?.slice(
        0,
        10
      );

    const maximumDate =
      getMaximumSessionDate(
        event
      );

    /* -----------------------------------------
       DATE
    ----------------------------------------- */

    if (!session.session_date) {
      fieldErrors.session_date =
        `Please select a date for Session ${sessionNumber}.`;
    } else if (
      eventStartDate &&
      session.session_date <
        eventStartDate
    ) {
      fieldErrors.session_date =
        `Session ${sessionNumber} cannot be before the event start date.`;
    } else if (
      maximumDate &&
      session.session_date >
        maximumDate
    ) {
      fieldErrors.session_date =
        `Session ${sessionNumber} cannot be more than 3 days after the event start date.`;
    }

    /* -----------------------------------------
       START
    ----------------------------------------- */

    if (!session.start_time) {
      fieldErrors.start_time =
        `Please select a start time for Session ${sessionNumber}.`;
    }

    /* -----------------------------------------
       END
    ----------------------------------------- */

    if (!session.end_time) {
      fieldErrors.end_time =
        `Please select an end time for Session ${sessionNumber}.`;
    } else if (
      session.start_time &&
      timeToMinutes(
        session.end_time
      ) <
        timeToMinutes(
          session.start_time
        ) + 30
    ) {
      fieldErrors.end_time =
        "End time must be at least 30 minutes after the start time.";
    }

    /* -----------------------------------------
       VENUE
    ----------------------------------------- */

    if (
      !session.venue.trim()
    ) {
      fieldErrors.venue =
        `Venue is required for Session ${sessionNumber}.`;
    }

    /* -----------------------------------------
       CHECK-IN PAIR
    ----------------------------------------- */

    if (
      (session.check_in_start &&
        !session.check_in_end) ||
      (!session.check_in_start &&
        session.check_in_end)
    ) {
      if (
        !session.check_in_start
      ) {
        fieldErrors.check_in_start =
          "Check-in start is required.";
      }

      if (
        !session.check_in_end
      ) {
        fieldErrors.check_in_end =
          "Check-in end is required.";
      }
    }

    /* -----------------------------------------
       CHECK-IN ORDER
    ----------------------------------------- */

    if (
      session.check_in_start &&
      session.check_in_end &&
      timeToMinutes(
        session.check_in_start
      ) >=
        timeToMinutes(
          session.check_in_end
        )
    ) {
      fieldErrors.check_in_end =
        "Check-in end must be after check-in start.";
    }

    /* -----------------------------------------
       CHECK-IN END <= SESSION START
    ----------------------------------------- */

    if (
      session.check_in_end &&
      session.start_time &&
      timeToMinutes(
        session.check_in_end
      ) >
        timeToMinutes(
          session.start_time
        )
    ) {
      fieldErrors.check_in_end =
        "Check-in end cannot be after the session start time.";
    }

    /* -----------------------------------------
       CHECK-IN START < SESSION START
    ----------------------------------------- */

    if (
      session.check_in_start &&
      session.start_time &&
      timeToMinutes(
        session.check_in_start
      ) >=
        timeToMinutes(
          session.start_time
        )
    ) {
      fieldErrors.check_in_start =
        "Check-in start must be before the session start time.";
    }

    return fieldErrors;
  }

  /* =========================================================
     SUBMIT
  ========================================================= */

  async function handleSubmit(
    eventObject
  ) {
    eventObject.preventDefault();

    setError("");

    setSessionErrors({});

    if (saving) {
      return;
    }

    /* -----------------------------------------
       BASIC VALIDATION
    ----------------------------------------- */

    if (!form.name.trim()) {
      setError(
        "Competition name is required."
      );

      return;
    }

    if (
      !form.description.trim()
    ) {
      setError(
        "Please add a short description of the competition."
      );

      return;
    }

    if (!form.rules.trim()) {
      setError(
        "Please add the competition rules."
      );

      return;
    }

    if (sessions.length === 0) {
      setError(
        "At least one competition session is required."
      );

      return;
    }

    /* -----------------------------------------
       FEE
    ----------------------------------------- */

    const registrationFee =
      Number(
        form.registration_fee
      );

    if (
      Number.isNaN(
        registrationFee
      ) ||
      registrationFee < 0
    ) {
      setError(
        "Registration fee cannot be negative."
      );

      return;
    }

    /* -----------------------------------------
       CAPACITY
    ----------------------------------------- */

    if (
      form.capacity &&
      Number(form.capacity) <= 0
    ) {
      setError(
        "Capacity must be greater than zero."
      );

      return;
    }

    /* -----------------------------------------
       SESSION VALIDATION
    ----------------------------------------- */

    const allSessionErrors = {};

    sessions.forEach(
      (session, index) => {
        const errors =
          validateSession(
            session,
            index
          );

        if (
          Object.keys(errors)
            .length > 0
        ) {
          allSessionErrors[
            session.id
          ] = errors;
        }
      }
    );

    if (
      Object.keys(
        allSessionErrors
      ).length > 0
    ) {
      setSessionErrors(
        allSessionErrors
      );

      const firstSessionId =
        sessions.find(
          (session) =>
            allSessionErrors[
              session.id
            ]
        )?.id;

      const firstErrors =
        firstSessionId
          ? allSessionErrors[
              firstSessionId
            ]
          : {};

      const firstMessage =
        Object.values(
          firstErrors
        )[0];

      setError(
        firstMessage ||
          "Please correct the highlighted session errors."
      );

      return;
    }

    /* -----------------------------------------
       SAVE
    ----------------------------------------- */

    const supabase =
      createClient();

    setSaving(true);

    try {
      /* -----------------------------------------
         AUTH
      ----------------------------------------- */

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user) {
        router.push("/login");
        return;
      }

      const user = session.user;

      /* -----------------------------------------
         VERIFY CREATOR
      ----------------------------------------- */

      const {
        data: currentCompetition,
        error:
          creatorCheckError,
      } = await supabase
        .from("competitions")
        .select(
          "id, event_id, organizer_id"
        )
        .eq(
          "id",
          competitionId
        )
        .single();

      if (creatorCheckError) {
        throw creatorCheckError;
      }

      if (
        currentCompetition.organizer_id !==
        user.id
      ) {
        throw new Error(
          "Only the competition creator can edit this competition."
        );
      }

      /* -----------------------------------------
         POSTER
      ----------------------------------------- */

      let posterUrl =
        currentPosterUrl ||
        null;

      if (posterFile) {
        posterUrl =
          await uploadPoster(
            supabase,
            user
          );
      }

      if (
        removeExistingPoster
      ) {
        posterUrl = null;
      }

      /* -----------------------------------------
         FIRST SESSION
         LEGACY COMPATIBILITY
      ----------------------------------------- */

      const firstSession =
        sessions[0];

      const competitionUpdate = {
        name:
          form.name.trim(),

        description:
          form.description.trim(),

        rules:
          form.rules.trim(),

        registration_fee:
          registrationFee,

        capacity:
          form.capacity
            ? Number(
                form.capacity
              )
            : null,

        /*
         * Existing competition columns
         * continue to mirror Session 1.
         */

        competition_date:
          firstSession.session_date,

        start_time:
          firstSession.start_time,

        end_time:
          firstSession.end_time,

        check_in_start:
          firstSession
            .check_in_start ||
          null,

        check_in_end:
          firstSession
            .check_in_end ||
          null,

        late_entry_allowed:
          firstSession
            .late_entry_allowed,

        venue:
          firstSession.venue.trim(),

        status:
          form.status,

        poster_url:
          posterUrl,
      };

      /* -----------------------------------------
         UPDATE COMPETITION
      ----------------------------------------- */

      const {
        error:
          competitionUpdateError,
      } = await supabase
        .from("competitions")
        .update(
          competitionUpdate
        )
        .eq(
          "id",
          competitionId
        )
        .eq(
          "organizer_id",
          user.id
        );

      if (
        competitionUpdateError
      ) {
        console.error(
          "Competition update error:",
          competitionUpdateError
        );

        throw competitionUpdateError;
      }

      /* -----------------------------------------
         LOAD EXISTING SESSION IDS
      ----------------------------------------- */

      const {
        data: existingSessions,
        error:
          existingSessionsError,
      } = await supabase
        .from("competition_sessions")
        .select("id")
        .eq(
          "competition_id",
          competitionId
        );

      if (
        existingSessionsError
      ) {
        throw existingSessionsError;
      }

      const existingIds =
        new Set(
          (existingSessions ||
            []).map(
            (session) =>
              session.id
          )
        );

      const keptDatabaseIds =
        new Set(
          sessions
            .filter(
              (session) =>
                session.databaseId
            )
            .map(
              (session) =>
                session.databaseId
            )
        );

      /* -----------------------------------------
         DELETE REMOVED SESSIONS
      ----------------------------------------- */

      const idsToDelete =
        Array.from(
          existingIds
        ).filter(
          (id) =>
            !keptDatabaseIds.has(
              id
            )
        );

      if (
        idsToDelete.length > 0
      ) {
        const {
          error:
            deleteSessionsError,
        } = await supabase
          .from(
            "competition_sessions"
          )
          .delete()
          .in(
            "id",
            idsToDelete
          )
          .eq(
            "competition_id",
            competitionId
          );

        if (
          deleteSessionsError
        ) {
          throw deleteSessionsError;
        }
      }

      /* -----------------------------------------
         UPDATE EXISTING SESSIONS
      ----------------------------------------- */

      const existingSessionUpdates =
        sessions.filter(
          (session) =>
            session.databaseId
        );

      for (
        const session of existingSessionUpdates
      ) {
        const {
          error:
            sessionUpdateError,
        } = await supabase
          .from(
            "competition_sessions"
          )
          .update({
            session_name:
              session.session_name,

            session_date:
              session.session_date,

            start_time:
              session.start_time,

            end_time:
              session.end_time,

            check_in_start:
              session
                .check_in_start ||
              null,

            check_in_end:
              session
                .check_in_end ||
              null,

            late_entry_allowed:
              session
                .late_entry_allowed,

            venue:
              session.venue.trim(),
          })
          .eq(
            "id",
            session.databaseId
          )
          .eq(
            "competition_id",
            competitionId
          );

        if (
          sessionUpdateError
        ) {
          throw sessionUpdateError;
        }
      }

      /* -----------------------------------------
         INSERT NEW SESSIONS
      ----------------------------------------- */

      const newSessions =
        sessions.filter(
          (session) =>
            !session.databaseId
        );

      if (
        newSessions.length > 0
      ) {
        const sessionRows =
          newSessions.map(
            (session) => ({
              competition_id:
                competitionId,

              session_name:
                session.session_name,

              session_date:
                session.session_date,

              start_time:
                session.start_time,

              end_time:
                session.end_time,

              check_in_start:
                session
                  .check_in_start ||
                null,

              check_in_end:
                session
                  .check_in_end ||
                null,

              late_entry_allowed:
                session
                  .late_entry_allowed,

              venue:
                session.venue.trim(),
            })
          );

        const {
          error:
            insertSessionsError,
        } = await supabase
          .from(
            "competition_sessions"
          )
          .insert(
            sessionRows
          );

        if (
          insertSessionsError
        ) {
          throw insertSessionsError;
        }
      }

      /* -----------------------------------------
         SUCCESS
      ----------------------------------------- */

      router.push(
        `/organizer/competitions/${competitionId}`
      );

      router.refresh();
    } catch (err) {
      console.error(
        "Edit competition error:",
        err
      );

      setError(
        err?.message ||
          "Could not update the competition. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <DashboardLayout
        title="Edit Competition"
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">
          <p className="text-slate-400">
            Loading competition...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error && !competition) {
    return (
      <DashboardLayout
        title="Edit Competition"
      >
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8">
            <h2 className="text-xl font-semibold text-red-300">
              {error}
            </h2>

            <Link
              href="/organizer/competitions"
              className="mt-5 inline-flex rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              ← Back to Competitions
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* =========================================================
     DATE LIMITS
  ========================================================= */

  const minimumSessionDate =
    event?.start_date?.slice(
      0,
      10
    ) || "";

  const maximumSessionDate =
    getMaximumSessionDate(
      event
    );

  /* =========================================================
     CURRENT POSTER
  ========================================================= */

  const displayedPoster =
    posterPreview ||
    (
      !removeExistingPoster
        ? currentPosterUrl
        : ""
    );

  /* =========================================================
     UI
  ========================================================= */

  return (
    <DashboardLayout
      title="Edit Competition"
    >
      <div className="mx-auto max-w-5xl">

        {/* BACK */}

        <Link
          href={`/organizer/competitions/${competitionId}`}
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to Competition
        </Link>

        {/* HEADER */}

        <div className="mt-6 mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            {event?.name}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Edit Competition
          </h1>

          <p className="mt-3 text-slate-400">
            Update your competition details,
            poster, and sessions.
          </p>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >

          {/* GLOBAL ERROR */}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
              {error}
            </div>
          )}

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">

            <h2 className="text-xl font-semibold text-white">
              Basic Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update the information participants
              will see.
            </p>

            <div className="mt-6 space-y-5">

              <FormField
                label="Competition Name"
                required
                help="Give your competition a short and clear name."
              >
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={
                    handleChange
                  }
                  maxLength={150}
                  required
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="Description"
                required
                help="Briefly explain what participants will do."
              >
                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  rows={5}
                  maxLength={1000}
                  required
                  className={inputClass}
                />

                <p className="mt-2 text-right text-xs text-slate-600">
                  {
                    form.description
                      .length
                  }
                  /1000
                </p>
              </FormField>

              <FormField
                label="Competition Rules"
                required
                help="Write the rules as simple points."
              >
                <textarea
                  name="rules"
                  value={form.rules}
                  onChange={
                    handleChange
                  }
                  rows={8}
                  maxLength={2000}
                  required
                  className={inputClass}
                />

                <p className="mt-2 text-right text-xs text-slate-600">
                  {form.rules.length}
                  /2000
                </p>
              </FormField>

            </div>
          </section>

          {/* =================================================
              POSTER
          ================================================= */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">

            <h2 className="text-xl font-semibold text-white">
              Competition Poster
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update the poster participants see
              while browsing competitions.
            </p>

            {displayedPoster ? (
              <div className="mt-6">

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
                  <img
                    src={
                      displayedPoster
                    }
                    alt="Competition poster"
                    className="max-h-[500px] w-full object-contain"
                  />
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">

                  <label className="cursor-pointer rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white">

                    Change Poster

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handlePosterChange
                      }
                      className="hidden"
                    />

                  </label>

                  <button
                    type="button"
                    onClick={
                      removePoster
                    }
                    className="rounded-xl border border-red-500/20 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
                  >
                    Remove Poster
                  </button>

                </div>

                {posterFile && (
                  <p className="mt-3 text-xs text-slate-500">
                    New poster selected:
                    {" "}
                    <span className="text-slate-300">
                      {posterFile.name}
                    </span>
                  </p>
                )}

              </div>
            ) : (
              <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-slate-950/40 px-6 py-12 text-center transition hover:border-blue-500/50 hover:bg-white/[0.03]">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl">
                  🖼️
                </div>

                <p className="mt-4 text-sm font-semibold text-white">
                  Upload Competition Poster
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  JPG, PNG, WEBP • Max 5 MB
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handlePosterChange
                  }
                  className="hidden"
                />

              </label>
            )}

          </section>

          {/* =================================================
              REGISTRATION
          ================================================= */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">

            <h2 className="text-xl font-semibold text-white">
              Registration
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update the registration fee and
              participant limit.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              <FormField
                label="Registration Fee"
                required
                help="Enter 0 if the competition is free."
              >
                <input
                  type="number"
                  name="registration_fee"
                  value={
                    form.registration_fee
                  }
                  onChange={
                    handleChange
                  }
                  min="0"
                  step="0.01"
                  required
                  className={inputClass}
                />
              </FormField>

              <FormField
                label="Maximum Participants"
                help="Leave empty if there is no fixed limit."
              >
                <input
                  type="number"
                  name="capacity"
                  value={
                    form.capacity
                  }
                  onChange={
                    handleChange
                  }
                  min="1"
                  placeholder="e.g. 100"
                  className={inputClass}
                />
              </FormField>

            </div>
          </section>

          {/* =================================================
              SESSIONS
          ================================================= */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

              <div>

                <h2 className="text-xl font-semibold text-white">
                  Competition Sessions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update, remove, or add sessions
                  for this competition.
                </p>

                {minimumSessionDate &&
                  maximumSessionDate && (
                    <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">

                      <p className="text-xs font-medium text-blue-300">
                        Session date range
                      </p>

                      <p className="mt-1 text-sm text-blue-200">
                        <span className="font-semibold">
                          {minimumSessionDate}
                        </span>

                        {" → "}

                        <span className="font-semibold">
                          {maximumSessionDate}
                        </span>
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Sessions can be scheduled
                        only on the event start date
                        or within the next 3 days.
                      </p>

                    </div>
                  )}

              </div>

              <button
                type="button"
                onClick={
                  addSession
                }
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                + Add Session
              </button>

            </div>

            <div className="mt-6 space-y-6">

              {sessions.map(
                (session, index) => {
                  const errors =
                    sessionErrors[
                      session.id
                    ] || {};

                  const minimumEndTime =
                    session.start_time
                      ? addThirtyMinutes(
                          session.start_time
                        )
                      : "";

                  const maximumCheckInStart =
                    session.start_time
                      ? subtractOneMinute(
                          session.start_time
                        )
                      : "";

                  const minimumCheckInEnd =
                    session.check_in_start
                      ? addOneMinute(
                          session.check_in_start
                        )
                      : "";

                  return (
                    <div
                      key={
                        session.id
                      }
                      className={`rounded-2xl border p-5 sm:p-6 ${
                        Object.keys(
                          errors
                        ).length > 0
                          ? "border-red-500/30 bg-red-500/[0.03]"
                          : "border-white/10 bg-slate-950/40"
                      }`}
                    >

                      {/* HEADER */}

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                            {
                              session.session_name
                            }
                          </p>

                          <h3 className="mt-1 text-lg font-semibold text-white">
                            Session{" "}
                            {index + 1}
                          </h3>

                        </div>

                        {sessions.length >
                          1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeSession(
                                session.id
                              )
                            }
                            className="self-start rounded-xl border border-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
                          >
                            Remove
                          </button>
                        )}

                      </div>

                      {/* DATE + VENUE */}

                      <div className="mt-6 grid gap-5 sm:grid-cols-2">

                        <FormField
                          label="Session Date"
                          required
                          help={`Allowed from ${minimumSessionDate || "event start"} to ${maximumSessionDate || "event date + 3 days"}.`}
                          error={
                            errors.session_date
                          }
                        >
                          <input
                            type="date"
                            name="session_date"
                            value={
                              session.session_date
                            }
                            onChange={(
                              eventObject
                            ) =>
                              handleSessionChange(
                                session.id,
                                eventObject
                              )
                            }
                            min={
                              minimumSessionDate ||
                              undefined
                            }
                            max={
                              maximumSessionDate ||
                              undefined
                            }
                            required
                            className={`${inputClass} ${
                              errors.session_date
                                ? inputErrorClass
                                : ""
                            }`}
                          />
                        </FormField>

                        <FormField
                          label="Venue"
                          required
                          help="Where will this session take place?"
                          error={
                            errors.venue
                          }
                        >
                          <input
                            type="text"
                            name="venue"
                            value={
                              session.venue
                            }
                            onChange={(
                              eventObject
                            ) =>
                              handleSessionChange(
                                session.id,
                                eventObject
                              )
                            }
                            required
                            placeholder="e.g. Main Auditorium"
                            className={`${inputClass} ${
                              errors.venue
                                ? inputErrorClass
                                : ""
                            }`}
                          />
                        </FormField>

                      </div>

                      {/* START + END */}

                      <div className="mt-5 grid gap-5 sm:grid-cols-2">

                        <FormField
                          label="Start Time"
                          required
                          help="Choose when the session begins."
                          error={
                            errors.start_time
                          }
                        >
                          <input
                            type="time"
                            name="start_time"
                            value={
                              session.start_time
                            }
                            onChange={(
                              eventObject
                            ) =>
                              handleSessionChange(
                                session.id,
                                eventObject
                              )
                            }
                            required
                            className={`${inputClass} ${
                              errors.start_time
                                ? inputErrorClass
                                : ""
                            }`}
                          />
                        </FormField>

                        <FormField
                          label="End Time"
                          required
                          help={
                            session.start_time
                              ? `Minimum end time: ${minimumEndTime}`
                              : "Select the start time first."
                          }
                          error={
                            errors.end_time
                          }
                        >
                          <input
                            type="time"
                            name="end_time"
                            value={
                              session.end_time
                            }
                            min={
                              minimumEndTime ||
                              undefined
                            }
                            onChange={(
                              eventObject
                            ) =>
                              handleSessionChange(
                                session.id,
                                eventObject
                              )
                            }
                            required
                            disabled={
                              !session.start_time
                            }
                            className={`${inputClass} ${
                              errors.end_time
                                ? inputErrorClass
                                : ""
                            } disabled:cursor-not-allowed disabled:opacity-50`}
                          />
                        </FormField>

                      </div>

                      {/* DURATION INFO */}

                      {session.start_time && (
                        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">

                          <p className="text-xs font-semibold text-amber-300">
                            ⏱️ Minimum session duration: 30 minutes
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Earliest allowed end time:
                            {" "}
                            <span className="font-semibold text-amber-300">
                              {minimumEndTime}
                            </span>
                          </p>

                        </div>
                      )}

                      {/* CHECK-IN */}

                      <div className="mt-6">

                        <p className="text-sm font-medium text-slate-300">
                          Check-in
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Optional check-in window
                          before the session starts.
                        </p>

                      </div>

                      <div className="mt-4 grid gap-5 sm:grid-cols-2">

                        <FormField
                          label="Check-in Start"
                          help={
                            session.start_time
                              ? `Must be before ${session.start_time}.`
                              : "Select the session start time first."
                          }
                          error={
                            errors.check_in_start
                          }
                        >
                          <input
                            type="time"
                            name="check_in_start"
                            value={
                              session.check_in_start
                            }
                            max={
                              maximumCheckInStart ||
                              undefined
                            }
                            onChange={(
                              eventObject
                            ) =>
                              handleSessionChange(
                                session.id,
                                eventObject
                              )
                            }
                            disabled={
                              !session.start_time
                            }
                            className={`${inputClass} ${
                              errors.check_in_start
                                ? inputErrorClass
                                : ""
                            } disabled:cursor-not-allowed disabled:opacity-50`}
                          />
                        </FormField>

                        <FormField
                          label="Check-in End"
                          help={
                            session.check_in_start
                              ? `Must be after ${session.check_in_start} and at or before ${session.start_time}.`
                              : "Select check-in start first."
                          }
                          error={
                            errors.check_in_end
                          }
                        >
                          <input
                            type="time"
                            name="check_in_end"
                            value={
                              session.check_in_end
                            }
                            min={
                              minimumCheckInEnd ||
                              undefined
                            }
                            max={
                              session.start_time ||
                              undefined
                            }
                            onChange={(
                              eventObject
                            ) =>
                              handleSessionChange(
                                session.id,
                                eventObject
                              )
                            }
                            disabled={
                              !session.check_in_start
                            }
                            className={`${inputClass} ${
                              errors.check_in_end
                                ? inputErrorClass
                                : ""
                            } disabled:cursor-not-allowed disabled:opacity-50`}
                          />
                        </FormField>

                      </div>

                      {/* LATE ENTRY */}

                      <label className="mt-5 flex cursor-pointer items-start gap-3">

                        <input
                          type="checkbox"
                          name="late_entry_allowed"
                          checked={
                            session.late_entry_allowed
                          }
                          onChange={(
                            eventObject
                          ) =>
                            handleSessionChange(
                              session.id,
                              eventObject
                            )
                          }
                          className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500"
                        />

                        <span>

                          <span className="block text-sm font-semibold text-white">
                            Allow late entry
                          </span>

                          <span className="mt-1 block text-xs text-slate-500">
                            Participants can enter
                            after the scheduled
                            start time.
                          </span>

                        </span>

                      </label>

                    </div>
                  );
                }
              )}

            </div>

            <button
              type="button"
              onClick={
                addSession
              }
              className="mt-6 w-full rounded-xl border border-dashed border-white/15 px-5 py-4 text-sm font-semibold text-slate-400 transition hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-blue-300"
            >
              + Add Another Session
            </button>

          </section>

          {/* =================================================
              STATUS
          ================================================= */}

          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">

            <h2 className="text-xl font-semibold text-white">
              Competition Status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Keep it as Draft while preparing.
              Publish it when participants should
              be able to see it.
            </p>

            <div className="mt-6 max-w-sm">

              <FormField
                label="Status"
                required
              >
                <select
                  name="status"
                  value={
                    form.status
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className={inputClass}
                >
                  <option value="DRAFT">
                    Draft
                  </option>

                  <option value="PUBLISHED">
                    Published
                  </option>
                </select>
              </FormField>

            </div>

          </section>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:justify-end">

            <Link
              href={`/organizer/competitions/${competitionId}`}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving Changes..."
                : "Save Changes"}
            </button>

          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
  label,
  required,
  help,
  error,
  children,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-300">

        {label}

        {required && (
          <span className="ml-1 text-red-400">
            *
          </span>
        )}

      </label>

      {children}

      {error ? (
        <p className="mt-2 flex items-start gap-1.5 text-xs font-medium leading-5 text-red-400">
          <span>⚠</span>
          <span>{error}</span>
        </p>
      ) : (
        help && (
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {help}
          </p>
        )
      )}

    </div>
  );
}

/* =========================================================
   INPUT STYLES
========================================================= */

const inputClass =
  "w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const inputErrorClass =
  "border-red-500/50 focus:border-red-500 focus:ring-red-500/20";