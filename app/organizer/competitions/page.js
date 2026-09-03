import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CompetitionCard from "@/components/dashboard/CompetitionCard";

export default function CompetitionsPage() {
  return (
    <DashboardLayout
      title="Competition Management"
      description="Manage all competitions from one place."
    >
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Top Bar */}

        <div className="flex flex-col md:flex-row gap-4 justify-between">

          <input
            type="text"
            placeholder="🔍 Search competition..."
            className="w-full md:w-96 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition">
            + Create Competition
          </button>

        </div>

        {/* Competition Cards */}

        <div className="grid lg:grid-cols-2 gap-6">

          <CompetitionCard
            title="Hackathon 2027"
            category="Technical"
            date="12 Aug 2027"
            participants="120"
            status="Published"
          />

          <CompetitionCard
            title="UI/UX Design Challenge"
            category="Design"
            date="13 Aug 2027"
            participants="80"
            status="Published"
          />

          <CompetitionCard
            title="Coding Contest"
            category="Programming"
            date="14 Aug 2027"
            participants="150"
            status="Draft"
          />

          <CompetitionCard
            title="Poster Presentation"
            category="Presentation"
            date="15 Aug 2027"
            participants="40"
            status="Published"
          />

        </div>

      </div>
    </DashboardLayout>
  );
}