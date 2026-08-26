import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FormSection from "@/components/dashboard/FormSection";

import TextInput from "@/components/ui/TextInput";
import TextArea from "@/components/ui/TextArea";
import SelectInput from "@/components/ui/SelectInput";

export default function CreateCompetitionPage() {
  return (
    <DashboardLayout
      title="Create Competition"
      description="Create a new competition for your college event."
    >
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ================= BASIC INFORMATION ================= */}

        <FormSection
          title="📝 Basic Information"
          description="Enter the essential details of your competition."
        >

          <div className="grid md:grid-cols-2 gap-6">

            <TextInput
              label="Competition Name"
              placeholder="Hackathon 2027"
            />

            <SelectInput
              label="Category"
              options={[
                "Technical",
                "Cultural",
                "Sports",
                "Workshop",
                "Seminar",
              ]}
            />

          </div>

          <div className="mt-6">

            <TextArea
              label="Competition Description"
              placeholder="Describe your competition..."
            />

          </div>

        </FormSection>

        {/* ================= SCHEDULE ================= */}

        <FormSection
          title="📅 Schedule"
          description="Choose when the competition will take place."
        >

          <div className="grid md:grid-cols-2 gap-6">

            <TextInput
              label="Competition Date"
              type="date"
            />

            <TextInput
              label="Registration Deadline"
              type="date"
            />

            <TextInput
              label="Start Time"
              type="time"
            />

            <TextInput
              label="End Time"
              type="time"
            />

          </div>

        </FormSection>
        {/* ================= VENUE & REGISTRATION ================= */}

<FormSection
  title="📍 Venue & Registration"
  description="Set venue details and participant registration rules."
>

  <div className="grid md:grid-cols-2 gap-6">

    <TextInput
      label="Venue"
      placeholder="Seminar Hall A"
    />

    <TextInput
      label="Building"
      placeholder="Engineering Block"
    />

    <TextInput
      label="Maximum Participants"
      type="number"
      placeholder="100"
    />

    <TextInput
      label="Registration Fee (₹)"
      type="number"
      placeholder="200"
    />

    <SelectInput
      label="Participation Type"
      options={[
        "Individual",
        "Team"
      ]}
    />

    <TextInput
      label="Maximum Team Size"
      type="number"
      placeholder="4"
    />

    <SelectInput
      label="Eligible Colleges"
      options={[
        "All Colleges",
        "Only Our College"
      ]}
    />

    <SelectInput
      label="Eligible Year"
      options={[
        "All Years",
        "First Year",
        "Second Year",
        "Third Year",
        "Final Year"
      ]}
    />

  </div>

</FormSection>
{/* ================= RULES ================= */}

<FormSection
  title="📜 Rules & Eligibility"
  description="Provide important rules and participation guidelines."
>

  <div className="space-y-6">

    <TextArea
      label="Competition Rules"
      placeholder="Example:
• Bring your college ID.
• No plagiarism allowed.
• Teams must report 30 minutes before the event.
• Judges' decision will be final."
    />

    <TextArea
      label="Required Items"
      placeholder="Example:
• Laptop
• Charger
• College ID Card
• Internet Dongle (optional)"
    />

    <TextArea
      label="Additional Instructions"
      placeholder="Any special instructions for participants..."
    />

  </div>

</FormSection>
{/* ================= PRIZE DETAILS ================= */}

<FormSection
  title="🏆 Prize Details"
  description="Specify the prizes for winners."
>

  <div className="grid md:grid-cols-2 gap-6">

    <TextInput
      label="1st Prize"
      placeholder="₹10,000 + Trophy"
    />

    <TextInput
      label="2nd Prize"
      placeholder="₹5,000"
    />

    <TextInput
      label="3rd Prize"
      placeholder="₹2,000"
    />

    <TextInput
      label="Certificates"
      placeholder="Participation / Merit"
    />

  </div>

</FormSection>
{/* ================= ORGANIZER CONTACT ================= */}

<FormSection
  title="👤 Organizer Contact"
  description="Participants can contact the organizer if they have questions."
>

  <div className="grid md:grid-cols-2 gap-6">

    <TextInput
      label="Organizer Name"
      placeholder="John Doe"
    />

    <TextInput
      label="Phone Number"
      placeholder="+91 9876543210"
    />

    <TextInput
      label="Email"
      type="email"
      placeholder="organizer@college.edu"
    />

    <TextInput
      label="Department"
      placeholder="Computer Engineering"
    />

  </div>

</FormSection>
{/* ================= BANNER ================= */}

<FormSection
  title="🖼 Competition Banner"
  description="Upload the banner that participants will see."
>

  <input
    type="file"
    accept="image/*"
    className="w-full rounded-xl border border-dashed border-slate-300 bg-white p-5"
  />

</FormSection>

      </div>
    </DashboardLayout>
  );
}