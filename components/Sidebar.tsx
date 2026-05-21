"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Brain,
  ClipboardList,
  FolderKanban,
  Globe2,
  LayoutDashboard,
  Megaphone,
  Menu,
  MessageSquareQuote,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Target,
  Tv,
  X
} from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/useSidebar";
import { permissions, type Role } from "@/lib/auth/permissions";

const analyticsItems = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/seo-analytics", label: "SEO Analytics", icon: BarChart3 },
  { href: "/aeo-analytics", label: "AEO Analytics", icon: Brain },
  { href: "/geo-analytics", label: "GEO Analytics", icon: Globe2 },
  { href: "/google-ads-analytics", label: "Google Ads", icon: Megaphone },
  { href: "/criteo-ads-analytics", label: "Criteo Ads", icon: Target },
  { href: "/vibe-ads-analytics", label: "Vibe.co", icon: Tv }
];

const workflowItems = [
  { href: "/keywords", label: "SEO Recommendation", icon: Search },
  { href: "/aeo-prompts", label: "AEO Recommendation", icon: MessageSquareQuote },
  { href: "/blog-pipeline/status", label: "Blog Pipeline", icon: FolderKanban }
];

const adminItems = [{ href: "/admin/audit-log", label: "Audit Log", icon: ClipboardList }];

const expandedWidth = "lg:w-72";
const collapsedWidth = "lg:w-[4.75rem]";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

function NavLink({
  item,
  pathname,
  showLabels,
  onNavigate
}: {
  item: NavItem;
  pathname: string;
  showLabels: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  const active = pathname === item.href;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={!showLabels ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl text-sm font-medium transition-colors",
        showLabels ? "px-4 py-3" : "justify-center px-0 py-3",
        active ? "bg-slate-800 text-white shadow-soft" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {showLabels ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );
}

export function Sidebar({ userRole }: { userRole: Role | null }) {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen, ready } = useSidebar();
  const showAdmin = userRole !== null && permissions.canViewAuditLog(userRole);

  function closeMobile() {
    setMobileOpen(false);
  }

  function ToggleButton({ className }: { className?: string }) {
    return (
      <button
        type="button"
        onClick={toggleCollapsed}
        className={cn(
          "shrink-0 rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-slate-600 hover:bg-slate-900 hover:text-white",
          className
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </button>
    );
  }

  function NavLinks({ showLabels }: { showLabels: boolean }) {
    return (
      <>
        {analyticsItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} showLabels={showLabels} onNavigate={closeMobile} />
        ))}
        {showLabels ? (
          <p className="mb-1 mt-4 px-4 text-[10px] font-semibold uppercase tracking-widest text-slate-600">Workflow</p>
        ) : (
          <div className="my-2 border-t border-slate-800" />
        )}
        {workflowItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} showLabels={showLabels} onNavigate={closeMobile} />
        ))}
        {showAdmin ? (
          <>
            {showLabels ? (
              <p className="mb-1 mt-4 px-4 text-[10px] font-semibold uppercase tracking-widest text-slate-600">Admin</p>
            ) : (
              <div className="my-2 border-t border-slate-800" />
            )}
            {adminItems.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} showLabels={showLabels} onNavigate={closeMobile} />
            ))}
          </>
        ) : null}
      </>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-xl bg-cyan-500/15 p-2 text-cyan-300">
            <img src="/logo.svg" alt="" className="h-5 w-5 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[10px] uppercase tracking-[0.28em] text-slate-500">Energy bits</p>
            <h1 className="truncate text-sm font-semibold text-white">Content Dashboard</h1>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg border border-slate-700 p-2 text-slate-300"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/60 transition-opacity lg:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeMobile}
        aria-hidden={!mobileOpen}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(100vw-3rem,18rem)] flex-col border-r border-slate-800 bg-slate-950 text-slate-200 transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
          <p className="text-sm font-semibold text-white">Menu</p>
          <button type="button" onClick={closeMobile} className="rounded-lg border border-slate-700 p-2" aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <NavLinks showLabels />
        </nav>
        <div className="border-t border-slate-800 p-3">
          <SignOutButton />
        </div>
      </aside>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-slate-800 bg-slate-950 text-slate-200 transition-[width] duration-300 lg:flex",
          ready && collapsed ? collapsedWidth : expandedWidth,
          !ready && expandedWidth
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 border-b border-slate-800 py-4",
            collapsed ? "justify-center px-2" : "px-4"
          )}
        >
          <ToggleButton />
          {!collapsed ? (
            <>
              <div className="rounded-xl bg-cyan-500/15 p-2 text-cyan-300">
                <img src="/logo.svg" alt="" className="h-6 w-6 object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs uppercase tracking-[0.28em] text-slate-500">Energy bits</p>
                <h1 className="truncate text-sm font-semibold text-white">Content Dashboard</h1>
              </div>
            </>
          ) : null}
        </div>

        <nav className={cn("flex-1 space-y-1 overflow-y-auto py-4", collapsed ? "px-2" : "px-3")}>
          <NavLinks showLabels={!collapsed} />
        </nav>

        <div className={cn("border-t border-slate-800 p-3", collapsed ? "px-2" : "")}>
          <SignOutButton collapsed={collapsed} />
        </div>
      </aside>
    </>
  );
}
