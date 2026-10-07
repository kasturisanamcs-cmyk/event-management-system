"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function redirectByRole() {
      const supabase = createClient();

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (mounted) {
            router.replace("/login");
          }
          return;
        }

        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError) {
          console.error("Dashboard role error:", profileError);

          if (mounted) {
            router.replace("/login");
          }

          return;
        }

        const role = profile?.role?.trim().toUpperCase();

        if (!mounted) {
          return;
        }

        switch (role) {
          case "ADMIN":
            router.replace("/admin/dashboard");
            break;

          case "ORGANIZER":
            router.replace("/organizer/dashboard");
            break;

          case "COMPETITION_MEMBER":
            router.replace("/competition-member/dashboard");
            break;

          case "PARTICIPANT":
            router.replace("/participant/dashboard");
            break;

          default:
            console.error("Unknown user role:", role);
            router.replace("/login");
            break;
        }
      } catch (error) {
        console.error("Dashboard redirect error:", error);

        if (mounted) {
          router.replace("/login");
        }
      }
    }

    redirectByRole();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#020617]">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />

        <p className="mt-4 text-sm text-slate-400">
          Loading your dashboard...
        </p>
      </div>
    </div>
  );
}