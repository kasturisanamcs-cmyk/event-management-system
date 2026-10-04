import "./globals.css";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export const metadata = {
  title: "EventNest",
  description: "Smart Event Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}