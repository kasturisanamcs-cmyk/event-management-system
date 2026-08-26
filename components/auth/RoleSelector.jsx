"use client";

import { useState } from "react";

const roles = [
  {
    name: "Organizer",
    icon: "👨‍💼",
  },
  {
    name: "Volunteer",
    icon: "🙋",
  },
  {
    name: "Participant",
    icon: "🎓",
  },
];

export default function RoleSelector() {

  const [selected, setSelected] = useState("Organizer");

  return (
    <div>

      <label className="block text-gray-300 mb-4">
        Choose Role
      </label>

      <div className="grid grid-cols-3 gap-3">

        {roles.map((role) => (

          <button
            key={role.name}
            type="button"
            onClick={() => setSelected(role.name)}
            className={`rounded-2xl p-4 border transition ${
              selected === role.name
                ? "border-blue-500 bg-blue-600/20"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <p className="text-3xl">{role.icon}</p>

            <p className="mt-2 text-sm text-white">
              {role.name}
            </p>

          </button>

        ))}

      </div>

    </div>
  );
}