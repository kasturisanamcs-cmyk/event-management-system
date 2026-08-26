import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function CreateEventPage() {
  return (
    
<DashboardLayout
  title="Create Competition"
  description="Create a new competition for your event."
>
      <h1 className="text-3xl font-bold">
        Create Event
      </h1>

      <p className="text-gray-500 mt-2">
        Event form will be added here.
      </p>

    </DashboardLayout>
  );
}