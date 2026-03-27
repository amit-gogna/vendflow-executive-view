import { Search, Bell, ChevronDown, User } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-sm">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search vendors, proposals, rates…"
          className="h-9 w-full rounded-md border border-input bg-surface-sunken pl-9 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground md:inline-block">
          ⌘K
        </kbd>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Org switcher */}
        <button className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground">
            A
          </span>
          <span className="hidden md:inline">Acme Corp</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
        </button>

        {/* User */}
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-muted">
          <User className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
