"use client";

import { useParams, useRouter } from "next/navigation";

export default function OrganizerInvitePage() {
  const params = useParams();
  const router = useRouter();

  function handleAcceptInvitation() {
    router.push(`/register?invite=${params.token}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center shadow-2xl">
        <h1 className="text-3xl font-bold">
          EventNest Organizer Invitation
        </h1>

        <p className="mt-4 text-gray-300">
          You have been invited to become an organizer.
        </p>

        <p className="mt-2 text-sm text-gray-400">
          Accept the invitation to create your organizer account.
        </p>

        <button
          onClick={handleAcceptInvitation}
          className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700"
        >
          Accept Invitation
        </button>
      </div>
    </div>
  );
}