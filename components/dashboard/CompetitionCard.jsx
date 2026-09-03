export default function CompetitionCard({
  title,
  category,
  date,
  participants,
  status,
}) {
  const isPublished = status === "Published";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {title}
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            {category}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isPublished
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {status}
        </span>
      </div>

      {/* Details */}
      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Date</span>
          <span className="font-medium text-slate-900">
            {date}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Participants</span>
          <span className="font-medium text-slate-900">
            {participants}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          className="flex-1 border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition"
        >
          View
        </button>

        <button
          type="button"
          className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition"
        >
          Manage
        </button>
      </div>
    </div>
  );
}