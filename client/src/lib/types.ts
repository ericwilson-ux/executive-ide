// UI State Types
export type TabItem = {
  id: string;
  type: "object" | "note";
  title: string;
  objectType?: string;
  isActive: boolean;
};

export type SidebarItem = {
  id: string;
  title: string;
  type: "category" | "object" | "folder";
  category?: string;
  objectType?: string;
  parentId?: string | null;
  isCollapsed?: boolean;
  children?: SidebarItem[];
  icon?: string;
};

export type CategoryType = "priorities" | "projects" | "notes" | "people" | "action_items";

export type ObjectType = "priority" | "project" | "person" | "action_item" | "meeting" | "note_topic";

export type NoteKind = "general" | "daily" | "weekly" | "monthly" | "meeting" | "project_log";

export type ActionStatus = "todo" | "doing" | "blocked" | "done";

export const CATEGORY_CONFIG: Record<CategoryType, { label: string; icon: string; objectType: ObjectType }> = {
  priorities: { label: "Priorities", icon: "target", objectType: "priority" },
  projects: { label: "Projects", icon: "folder-kanban", objectType: "project" },
  notes: { label: "Notes", icon: "file-text", objectType: "note_topic" },
  people: { label: "People", icon: "users", objectType: "person" },
  action_items: { label: "Action Items", icon: "check-square", objectType: "action_item" },
};

export const OBJECT_TYPE_COLORS: Record<ObjectType, string> = {
  priority: "text-chart-5",
  project: "text-chart-1",
  person: "text-chart-2",
  action_item: "text-chart-4",
  meeting: "text-chart-3",
  note_topic: "text-muted-foreground",
};

export const STATUS_COLORS: Record<ActionStatus, string> = {
  todo: "bg-muted text-muted-foreground",
  doing: "bg-chart-1/20 text-chart-1",
  blocked: "bg-destructive/20 text-destructive",
  done: "bg-chart-2/20 text-chart-2",
};
