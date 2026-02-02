import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Workspace - top-level container
export const workspaces = pgTable("workspaces", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWorkspaceSchema = createInsertSchema(workspaces).omit({ id: true, createdAt: true });
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type Workspace = typeof workspaces.$inferSelect;

// Folder Node - tree structure for sidebar
export const folderNodes = pgTable("folder_nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar("workspace_id").notNull().references(() => workspaces.id),
  parentId: varchar("parent_id"),
  nodeType: text("node_type").notNull(), // root, category, object_collection, object
  category: text("category"), // priorities, projects, notes, people, action_items
  objectType: text("object_type"), // priority, project, person, action_item, meeting, note_topic
  title: text("title").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isCollapsed: boolean("is_collapsed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFolderNodeSchema = createInsertSchema(folderNodes).omit({ id: true, createdAt: true });
export type InsertFolderNode = z.infer<typeof insertFolderNodeSchema>;
export type FolderNode = typeof folderNodes.$inferSelect;

// Object - the items within folders (priorities, projects, people, etc.)
export const objects = pgTable("objects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar("workspace_id").notNull().references(() => workspaces.id),
  folderId: varchar("folder_id").references(() => folderNodes.id),
  objectType: text("object_type").notNull(), // priority, project, person, action_item, meeting, note_topic
  title: text("title").notNull(),
  description: text("description"),
  status: text("status"), // active, completed, on_hold, archived
  metadata: jsonb("metadata"), // flexible JSON for type-specific fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertObjectSchema = createInsertSchema(objects).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertObject = z.infer<typeof insertObjectSchema>;
export type ExecObject = typeof objects.$inferSelect;

// Tags
export const tags = pgTable("tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar("workspace_id").notNull().references(() => workspaces.id),
  name: text("name").notNull(),
  color: text("color").default("#6366f1").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTagSchema = createInsertSchema(tags).omit({ id: true, createdAt: true });
export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;

// Notes
export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar("workspace_id").notNull().references(() => workspaces.id),
  objectId: varchar("object_id").references(() => objects.id), // optional scope
  title: text("title").notNull(),
  content: jsonb("content"), // TipTap JSON content
  noteKind: text("note_kind").default("general").notNull(), // general, daily, weekly, monthly, meeting, project_log
  pinned: boolean("pinned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertNoteSchema = createInsertSchema(notes).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

// Note Links / Mentions - tracks @mentions and #tags in notes
export const noteLinks = pgTable("note_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  noteId: varchar("note_id").notNull().references(() => notes.id),
  targetType: text("target_type").notNull(), // object, tag
  targetId: varchar("target_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNoteLinkSchema = createInsertSchema(noteLinks).omit({ id: true, createdAt: true });
export type InsertNoteLink = z.infer<typeof insertNoteLinkSchema>;
export type NoteLink = typeof noteLinks.$inferSelect;

// Action Items
export const actionItems = pgTable("action_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar("workspace_id").notNull().references(() => workspaces.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("todo").notNull(), // todo, doing, blocked, done
  dueDate: timestamp("due_date"),
  ownerPersonId: varchar("owner_person_id").references(() => objects.id),
  relatedObjectId: varchar("related_object_id").references(() => objects.id),
  sourceNoteId: varchar("source_note_id").references(() => notes.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertActionItemSchema = createInsertSchema(actionItems).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertActionItem = z.infer<typeof insertActionItemSchema>;
export type ActionItem = typeof actionItems.$inferSelect;

// Goal Periods
export const goalPeriods = pgTable("goal_periods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar("workspace_id").notNull().references(() => workspaces.id),
  periodType: text("period_type").notNull(), // daily, weekly, monthly
  periodStartDate: timestamp("period_start_date").notNull(),
  summary: text("summary"),
  linkedItems: jsonb("linked_items"), // JSON array of linked priority/project/action IDs
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGoalPeriodSchema = createInsertSchema(goalPeriods).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGoalPeriod = z.infer<typeof insertGoalPeriodSchema>;
export type GoalPeriod = typeof goalPeriods.$inferSelect;

// Object Tags (join table)
export const objectTags = pgTable("object_tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  objectId: varchar("object_id").notNull().references(() => objects.id),
  tagId: varchar("tag_id").notNull().references(() => tags.id),
});

export const insertObjectTagSchema = createInsertSchema(objectTags).omit({ id: true });
export type InsertObjectTag = z.infer<typeof insertObjectTagSchema>;
export type ObjectTag = typeof objectTags.$inferSelect;

// Tab state for UI persistence
export const openTabs = pgTable("open_tabs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workspaceId: varchar("workspace_id").notNull().references(() => workspaces.id),
  targetType: text("target_type").notNull(), // object, note
  targetId: varchar("target_id").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(false).notNull(),
});

export const insertOpenTabSchema = createInsertSchema(openTabs).omit({ id: true });
export type InsertOpenTab = z.infer<typeof insertOpenTabSchema>;
export type OpenTab = typeof openTabs.$inferSelect;
