"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import type { Role } from "@/lib/auth/permissions";
import { Sidebar } from "@/components/Sidebar";
import { EditModeProvider } from "@/hooks/useEditMode";
import { SidebarProvider, useSidebar } from "@/hooks/useSidebar";
import { cn } from "@/lib/utils";

function MainShell({ children }: { children: React.ReactNode }) {
  const { collapsed, ready } = useSidebar();

  return (
    <main
      className={cn(
        "min-h-screen transition-[padding] duration-300",
        ready && collapsed ? "lg:pl-[4.75rem]" : "lg:pl-72"
      )}
    >
      <div className="mx-auto w-full max-w-[1800px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8">{children}</div>
    </main>
  );
}

const AUTH_SHELL_PATHS = ["/login", "/account-not-provisioned"];

export function AppChrome({
  children,
  userRole
}: {
  children: React.ReactNode;
  userRole: Role | null;
}) {
  const pathname = usePathname();
  const isAuthShell = AUTH_SHELL_PATHS.includes(pathname);

  if (isAuthShell) {
    return (
      <>
        {children}
        <Toaster position="bottom-right" />
      </>
    );
  }

  return (
    <EditModeProvider>
      <SidebarProvider>
        <Sidebar userRole={userRole} />
        <MainShell>{children}</MainShell>
        <Toaster position="bottom-right" />
      </SidebarProvider>
    </EditModeProvider>
  );
}
