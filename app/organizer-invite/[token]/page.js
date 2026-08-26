"use client";

import { useParams } from "next/navigation";

export default function OrganizerInvitePage() {
  const params = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          EventNest Organizer Invitation
        </h1>

        <p className="mt-4 text-gray-300">
          Invitation token:
        </p>

        <p className="mt-2 text-blue-400 break-all">
          {params.token}
        </p>

        <button className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold">
          Accept Invitation
        </button>
      </div>
    </div>
  );
}