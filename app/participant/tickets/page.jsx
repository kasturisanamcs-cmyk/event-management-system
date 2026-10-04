"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createClient } from "@/lib/supabase/client";

export default function ParticipantTicketsPage() {
  const supabase = createClient();

  const ticketRef = useRef(null);

  const [registrations, setRegistrations] = useState([]);
  const [selectedRegistration, setSelectedRegistration] =
    useState("");

  const [ticket, setTicket] = useState(null);
  const [qrImage, setQrImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [error, setError] = useState("");

  /* ==========================================================
     GET ACCESS TOKEN
  ========================================================== */

  async function getAccessToken() {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    if (!session?.access_token) {
      throw new Error("Authentication required.");
    }

    return session.access_token;
  }

  /* ==========================================================
     LOAD CONFIRMED REGISTRATIONS
  ========================================================== */

  async function loadRegistrations() {
    try {
      setLoading(true);
      setError("");

      const accessToken = await getAccessToken();

      const response = await fetch(
        "/api/participant/registration",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to load registrations."
        );
      }

      const formattedRegistrations =
        (result.registrations || []).map(
          (registration) => ({
            id: registration.result_id,

            registration_number:
              registration.result_registration_number,

            status:
              registration.result_status,

            participant_name:
              registration.result_participant_name,

            participant_email:
              registration.result_participant_email,

            college:
              registration.result_college,

            competition: {
              id:
                registration.result_competition_id,

              name:
                registration.result_competition_name,

              competition_date:
                registration.result_competition_date,

              start_time:
                registration.result_start_time,

              end_time:
                registration.result_end_time,

              venue:
                registration.result_venue,
            },
          })
        );

      setRegistrations(
        formattedRegistrations
      );

      if (
        formattedRegistrations.length > 0
      ) {
        setSelectedRegistration(
          formattedRegistrations[0].id
        );
      }
    } catch (error) {
      console.error(
        "Load registrations error:",
        error
      );

      setError(
        error.message ||
          "Failed to load confirmed registrations."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ==========================================================
     GENERATE TICKET
  ========================================================== */

  async function generateTicket(registrationId) {
    try {
      setGenerating(true);
      setError("");
      setTicket(null);
      setQrImage("");

      const accessToken =
        await getAccessToken();

      const response = await fetch(
        "/api/participant/ticket",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Bearer ${accessToken}`,
          },

          body: JSON.stringify({
            registrationId,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to generate ticket."
        );
      }

      /*
       * Normalize status because the API/database
       * currently returns ticket_status.
       */
      const generatedTicket = {
        ...result.ticket,

        status:
          result.ticket?.status ||
          result.ticket?.ticket_status ||
          "ACTIVE",
      };

      setTicket(generatedTicket);

      const qrDataUrl =
        await QRCode.toDataURL(
          generatedTicket.qr_token,
          {
            width: 500,
            margin: 2,
            errorCorrectionLevel: "H",
          }
        );

      setQrImage(qrDataUrl);
    } catch (error) {
      console.error(
        "Generate ticket error:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while generating the ticket."
      );
    } finally {
      setGenerating(false);
    }
  }

  /* ==========================================================
     DOWNLOAD TICKET AS PDF
  ========================================================== */

  async function downloadTicket() {
    if (!ticketRef.current || !ticket) {
      return;
    }

    try {
      setDownloading(true);
      setError("");

      const canvas =
        await html2canvas(
          ticketRef.current,
          {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false,
          }
        );

      const imageData =
        canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 10;

      const availableWidth =
        pageWidth - margin * 2;

      const imageRatio =
        canvas.height / canvas.width;

      let imageWidth =
        availableWidth;

      let imageHeight =
        imageWidth * imageRatio;

      /*
       * If ticket is taller than A4,
       * scale it down to fit.
       */
      const availableHeight =
        pageHeight - margin * 2;

      if (
        imageHeight >
        availableHeight
      ) {
        imageHeight =
          availableHeight;

        imageWidth =
          imageHeight / imageRatio;
      }

      const x =
        (pageWidth - imageWidth) / 2;

      const y = margin;

      pdf.addImage(
        imageData,
        "PNG",
        x,
        y,
        imageWidth,
        imageHeight
      );

      const safeTicketNumber =
        (
          ticket.ticket_number ||
          "eventnest-ticket"
        )
          .replace(
            /[^a-zA-Z0-9-_]/g,
            "-"
          );

      pdf.save(
        `${safeTicketNumber}.pdf`
      );
    } catch (error) {
      console.error(
        "Download ticket error:",
        error
      );

      setError(
        "Unable to download the ticket. Please try again."
      );
    } finally {
      setDownloading(false);
    }
  }

  /* ==========================================================
     PRINT TICKET
  ========================================================== */

  function printTicket() {
    if (!ticketRef.current || !ticket) {
      return;
    }

    window.print();
  }

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    loadRegistrations();
  }, []);

  /* ==========================================================
     SELECTED REGISTRATION
  ========================================================== */

  const selectedRegistrationData =
    registrations.find(
      (registration) =>
        registration.id ===
        selectedRegistration
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#020617] px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-8">

      <div className="mx-auto max-w-5xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6 sm:mb-8">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            EventNest
          </p>

          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            My Tickets & QR
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Generate, download and present your
            EventNest competition ticket.
          </p>

        </div>


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">

            <p className="text-sm text-red-400">
              {error}
            </p>

            <button
              onClick={loadRegistrations}
              className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900"
            >
              Try Again
            </button>

          </div>
        )}


        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center">

            <p className="text-slate-400">
              Loading confirmed registrations...
            </p>

          </div>
        )}


        {/* ==================================================
            EMPTY
        ================================================== */}

        {!loading &&
          !error &&
          registrations.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center sm:p-10">

              <h2 className="text-xl font-semibold">
                No Confirmed Registrations
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                A ticket becomes available after
                your registration and payment are
                confirmed.
              </p>

            </div>
          )}


        {/* ==================================================
            REGISTRATIONS + TICKET
        ================================================== */}

        {!loading &&
          !error &&
          registrations.length > 0 && (
            <>

              {/* Competition selector */}
              <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Select Competition
                </label>

                <select
                  value={selectedRegistration}
                  onChange={(event) => {
                    setSelectedRegistration(
                      event.target.value
                    );

                    setTicket(null);
                    setQrImage("");
                    setError("");
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                >

                  {registrations.map(
                    (registration) => (
                      <option
                        key={
                          registration.id
                        }
                        value={
                          registration.id
                        }
                      >
                        {
                          registration
                            .competition
                            ?.name
                        }{" "}
                        —{" "}
                        {
                          registration
                            .registration_number
                        }
                      </option>
                    )
                  )}

                </select>


                <button
                  onClick={() =>
                    generateTicket(
                      selectedRegistration
                    )
                  }
                  disabled={
                    generating ||
                    !selectedRegistration
                  }
                  className="mt-4 w-full rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {generating
                    ? "Generating Ticket..."
                    : "Generate / View Ticket"}
                </button>

              </div>


              {/* =================================================
                  TICKET
              ================================================= */}

              {ticket && (
                <>

                  <div
                    ref={ticketRef}
                    data-ticket-print="true"
className="mx-auto max-w-md overflow-hidden rounded-3xl border border-slate-300 bg-white text-slate-900 shadow-2xl"
                  >

                    {/* Ticket Header */}
                    <div className="bg-slate-900 px-5 py-6 text-center text-white sm:px-6">

                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                        EventNest
                      </p>

                      <h2 className="mt-2 text-2xl font-bold">
                        Competition Ticket
                      </h2>

                      <p className="mt-2 text-xs text-slate-400">
                        Present this ticket at check-in
                      </p>

                    </div>


                    {/* Ticket Body */}
                    <div className="p-5 sm:p-6">

                      {/* Competition */}
                      <div className="text-center">

                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Competition
                        </p>

                        <p className="mt-1 break-words text-xl font-bold">
                          {
                            selectedRegistrationData
                              ?.competition
                              ?.name
                          }
                        </p>

                      </div>


                      {/* Ticket Number */}
                      <div className="mt-5 text-center">

                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Ticket Number
                        </p>

                        <p className="mt-1 break-all text-base font-bold sm:text-lg">
                          {
                            ticket.ticket_number
                          }
                        </p>

                      </div>


                      {/* QR */}
                      <div className="my-6 flex justify-center">

                        {qrImage && (
                          <div className="rounded-2xl border border-slate-200 bg-white p-2">

                            <img
                              src={qrImage}
                              alt="Secure EventNest ticket QR code"
                              className="h-56 w-56 sm:h-64 sm:w-64"
                            />

                          </div>
                        )}

                      </div>


                      {/* Details */}
                      <div className="space-y-4 border-t border-slate-200 pt-5">

                        <TicketDetail
                          label="Participant"
                          value={
                            selectedRegistrationData
                              ?.participant_name
                          }
                        />

                        <TicketDetail
                          label="Registration"
                          value={
                            selectedRegistrationData
                              ?.registration_number
                          }
                        />

                        <TicketDetail
                          label="Status"
                          value={
                            ticket.status ||
                            ticket.ticket_status ||
                            "ACTIVE"
                          }
                        />

                        <TicketDetail
                          label="Venue"
                          value={
                            selectedRegistrationData
                              ?.competition
                              ?.venue
                          }
                        />

                        <TicketDetail
                          label="Date"
                          value={
                            selectedRegistrationData
                              ?.competition
                              ?.competition_date
                          }
                        />

                        <TicketDetail
                          label="Start Time"
                          value={
                            selectedRegistrationData
                              ?.competition
                              ?.start_time
                          }
                        />

                        <TicketDetail
                          label="End Time"
                          value={
                            selectedRegistrationData
                              ?.competition
                              ?.end_time
                          }
                        />

                        <TicketDetail
                          label="Issued"
                          value={
                            ticket.issued_at
                              ? new Date(
                                  ticket.issued_at
                                ).toLocaleString(
                                  "en-IN"
                                )
                              : "—"
                          }
                        />

                      </div>


                      {/* Check-in message */}
                      <div className="mt-6 rounded-xl bg-slate-100 p-4 text-center">

                        <p className="text-xs leading-5 text-slate-500">
                          Present this QR code at the
                          competition check-in counter.
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* =================================================
                      DOWNLOAD / PRINT BUTTONS
                  ================================================= */}

                  <div className="mx-auto mt-5 grid max-w-md grid-cols-1 gap-3 sm:grid-cols-2">

                    <button
                      type="button"
                      onClick={downloadTicket}
                      disabled={downloading}
                      className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span>
                        ↓
                      </span>

                      {downloading
                        ? "Creating PDF..."
                        : "Download Ticket"}
                    </button>


                    <button
                      type="button"
                      onClick={printTicket}
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
                    >
                      <span>
                        ⎙
                      </span>

                      Print Ticket
                    </button>

                  </div>


                  <p className="mx-auto mt-3 max-w-md text-center text-xs leading-5 text-slate-500">
                    Download the ticket PDF to your
                    phone so you can present it quickly
                    at the event check-in.
                  </p>

                </>
              )}

            </>
          )}

      </div>


      {/* ========================================================
          PRINT STYLES
      ======================================================== */}

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          body * {
            visibility: hidden;
          }

          [data-ticket-print],
          [data-ticket-print] * {
            visibility: visible;
          }

          [data-ticket-print] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

    </div>
  );
}


/* ============================================================
   TICKET DETAIL
============================================================ */

function TicketDetail({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-4">

      <span className="shrink-0 text-sm text-slate-500">
        {label}
      </span>

      <span className="break-words text-right text-sm font-semibold text-slate-900">
        {value || "—"}
      </span>

    </div>
  );
}