export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
          EventNest
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          Welcome to your dashboard
        </h2>

        <p className="mt-3 text-slate-400">
          Manage your events, competitions, people and operations from one
          place.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Events"
          value="0"
          description="Total events"
        />

        <DashboardCard
          title="Competitions"
          value="0"
          description="Total competitions"
        />

        <DashboardCard
          title="Participants"
          value="0"
          description="Registered participants"
        />

        <DashboardCard
          title="Volunteers"
          value="0"
          description="Assigned volunteers"
        />
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <h3 className="text-lg font-semibold">
          Getting started
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Your EventNest dashboard is ready. Once your event is created,
          important event information will appear here.
        </p>
      </div>
    </div>
  );
}

function DashboardCard({ title, value, description }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-slate-500">{title}</p>

      <p className="mt-3 text-3xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-600">
        {description}
      </p>
    </div>
  );
}