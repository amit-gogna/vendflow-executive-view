import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

interface AppLayoutProps {
  children: React.ReactNode;
  /** Wide working surfaces (tables, workspaces) use the full width. */
  width?: "reading" | "wide";
}

export function AppLayout({ children, width = "reading" }: AppLayoutProps) {
  return (
    <div className="min-h-screen min-w-[1180px] bg-background">
      <AppSidebar />
      <div className="ml-[248px] flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex-1 px-8 py-7">
          <div className={width === "wide" ? "mx-auto max-w-[1280px]" : "mx-auto max-w-[1080px]"}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
