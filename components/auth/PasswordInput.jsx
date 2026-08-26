"use client";

import { useState } from "react";

export default function PasswordInput({
  label,
  placeholder,
}) {
  const [show, setShow] = useState(false);

  return (
    <div>

      <label className="block text-gray-300 mb-2">
        {label}
      </label>

      <div className="relative">

        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 pr-14 text-white placeholder-gray-500 outline-none focus:border-blue-500"
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
        >
          {show ? "🙈" : "👁"}
        </button>

      </div>

    </div>
  );
}