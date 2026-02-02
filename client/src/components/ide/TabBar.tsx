import { X, Star, Briefcase, User, CheckSquare, FileText, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { type TabItem } from "@/lib/types";

interface TabBarProps {
  tabs: TabItem[];
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
}

const getTabIcon = (objectType?: string) => {
  switch (objectType) {
    case "priority": return Star;
    case "project": return Briefcase;
    case "person": return User;
    case "action_item": return CheckSquare;
    case "meeting": return Users;
    case "note_topic": return FileText;
    default: return FileText;
  }
};

export function TabBar({ tabs, onSelectTab, onCloseTab }: TabBarProps) {
  if (tabs.length === 0) return null;

  return (
    <div className="h-9 border-b bg-sidebar flex items-center">
      <ScrollArea className="w-full">
        <div className="flex h-9">
          {tabs.map(tab => {
            const Icon = getTabIcon(tab.objectType);
            return (
              <div
                key={tab.id}
                className={cn(
                  "flex items-center gap-2 px-3 h-full border-r cursor-pointer group min-w-0",
                  tab.isActive
                    ? "bg-background border-b-2 border-b-primary"
                    : "bg-sidebar hover-elevate"
                )}
                onClick={() => onSelectTab(tab.id)}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="text-sm truncate max-w-[120px]">{tab.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-4 w-4 p-0 ml-1 shrink-0",
                    tab.isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  data-testid={`button-close-tab-${tab.id}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
