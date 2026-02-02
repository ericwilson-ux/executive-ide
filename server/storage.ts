import { eq, desc, and, like, or } from "drizzle-orm";
import { db } from "./db";
import {
  workspaces,
  folderNodes,
  objects,
  notes,
  tags,
  noteLinks,
  actionItems,
  goalPeriods,
  objectTags,
  openTabs,
  type InsertWorkspace,
  type Workspace,
  type InsertFolderNode,
  type FolderNode,
  type InsertObject,
  type ExecObject,
  type InsertNote,
  type Note,
  type InsertTag,
  type Tag,
  type InsertNoteLink,
  type NoteLink,
  type InsertActionItem,
  type ActionItem,
  type InsertGoalPeriod,
  type GoalPeriod,
} from "@shared/schema";

export interface IStorage {
  // Workspaces
  getWorkspace(id: string): Promise<Workspace | undefined>;
  createWorkspace(data: InsertWorkspace): Promise<Workspace>;
  getDefaultWorkspace(): Promise<Workspace>;

  // Folder Nodes
  getFolderNodes(workspaceId: string): Promise<FolderNode[]>;
  getFolderNode(id: string): Promise<FolderNode | undefined>;
  createFolderNode(data: InsertFolderNode): Promise<FolderNode>;
  updateFolderNode(id: string, data: Partial<InsertFolderNode>): Promise<FolderNode | undefined>;
  deleteFolderNode(id: string): Promise<void>;

  // Objects
  getObjects(workspaceId: string): Promise<ExecObject[]>;
  getObject(id: string): Promise<ExecObject | undefined>;
  createObject(data: InsertObject): Promise<ExecObject>;
  updateObject(id: string, data: Partial<InsertObject>): Promise<ExecObject | undefined>;
  deleteObject(id: string): Promise<void>;
  searchObjects(workspaceId: string, query: string): Promise<ExecObject[]>;

  // Notes
  getNotes(workspaceId: string): Promise<Note[]>;
  getNotesByObjectId(objectId: string): Promise<Note[]>;
  getNote(id: string): Promise<Note | undefined>;
  createNote(data: InsertNote): Promise<Note>;
  updateNote(id: string, data: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: string): Promise<void>;
  searchNotes(workspaceId: string, query: string): Promise<Note[]>;

  // Tags
  getTags(workspaceId: string): Promise<Tag[]>;
  getTag(id: string): Promise<Tag | undefined>;
  createTag(data: InsertTag): Promise<Tag>;
  updateTag(id: string, data: Partial<InsertTag>): Promise<Tag | undefined>;
  deleteTag(id: string): Promise<void>;

  // Note Links
  getNoteLinks(noteId: string): Promise<NoteLink[]>;
  createNoteLink(data: InsertNoteLink): Promise<NoteLink>;
  deleteNoteLinksByNoteId(noteId: string): Promise<void>;

  // Action Items
  getActionItems(workspaceId: string): Promise<ActionItem[]>;
  getActionItemsByObjectId(objectId: string): Promise<ActionItem[]>;
  getActionItem(id: string): Promise<ActionItem | undefined>;
  createActionItem(data: InsertActionItem): Promise<ActionItem>;
  updateActionItem(id: string, data: Partial<InsertActionItem>): Promise<ActionItem | undefined>;
  deleteActionItem(id: string): Promise<void>;

  // Goal Periods
  getGoalPeriods(workspaceId: string): Promise<GoalPeriod[]>;
  getGoalPeriod(id: string): Promise<GoalPeriod | undefined>;
  createGoalPeriod(data: InsertGoalPeriod): Promise<GoalPeriod>;
  updateGoalPeriod(id: string, data: Partial<InsertGoalPeriod>): Promise<GoalPeriod | undefined>;
  deleteGoalPeriod(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Workspaces
  async getWorkspace(id: string): Promise<Workspace | undefined> {
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id));
    return workspace;
  }

  async createWorkspace(data: InsertWorkspace): Promise<Workspace> {
    const [workspace] = await db.insert(workspaces).values(data).returning();
    return workspace;
  }

  async getDefaultWorkspace(): Promise<Workspace> {
    const [workspace] = await db.select().from(workspaces).limit(1);
    if (workspace) return workspace;
    
    // Create default workspace if none exists
    const [newWorkspace] = await db.insert(workspaces).values({ name: "My Workspace" }).returning();
    return newWorkspace;
  }

  // Folder Nodes
  async getFolderNodes(workspaceId: string): Promise<FolderNode[]> {
    return db.select().from(folderNodes).where(eq(folderNodes.workspaceId, workspaceId)).orderBy(folderNodes.sortOrder);
  }

  async getFolderNode(id: string): Promise<FolderNode | undefined> {
    const [folder] = await db.select().from(folderNodes).where(eq(folderNodes.id, id));
    return folder;
  }

  async createFolderNode(data: InsertFolderNode): Promise<FolderNode> {
    const [folder] = await db.insert(folderNodes).values(data).returning();
    return folder;
  }

  async updateFolderNode(id: string, data: Partial<InsertFolderNode>): Promise<FolderNode | undefined> {
    const [folder] = await db.update(folderNodes).set(data).where(eq(folderNodes.id, id)).returning();
    return folder;
  }

  async deleteFolderNode(id: string): Promise<void> {
    await db.delete(folderNodes).where(eq(folderNodes.id, id));
  }

  // Objects
  async getObjects(workspaceId: string): Promise<ExecObject[]> {
    return db.select().from(objects).where(eq(objects.workspaceId, workspaceId)).orderBy(desc(objects.createdAt));
  }

  async getObject(id: string): Promise<ExecObject | undefined> {
    const [obj] = await db.select().from(objects).where(eq(objects.id, id));
    return obj;
  }

  async createObject(data: InsertObject): Promise<ExecObject> {
    const [obj] = await db.insert(objects).values({
      ...data,
      updatedAt: new Date(),
    }).returning();
    return obj;
  }

  async updateObject(id: string, data: Partial<InsertObject>): Promise<ExecObject | undefined> {
    const [obj] = await db.update(objects).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(objects.id, id)).returning();
    return obj;
  }

  async deleteObject(id: string): Promise<void> {
    await db.delete(objects).where(eq(objects.id, id));
  }

  async searchObjects(workspaceId: string, query: string): Promise<ExecObject[]> {
    return db.select().from(objects).where(
      and(
        eq(objects.workspaceId, workspaceId),
        or(
          like(objects.title, `%${query}%`),
          like(objects.description, `%${query}%`)
        )
      )
    );
  }

  // Notes
  async getNotes(workspaceId: string): Promise<Note[]> {
    return db.select().from(notes).where(eq(notes.workspaceId, workspaceId)).orderBy(desc(notes.updatedAt));
  }

  async getNotesByObjectId(objectId: string): Promise<Note[]> {
    return db.select().from(notes).where(eq(notes.objectId, objectId)).orderBy(desc(notes.updatedAt));
  }

  async getNote(id: string): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note;
  }

  async createNote(data: InsertNote): Promise<Note> {
    const [note] = await db.insert(notes).values({
      ...data,
      updatedAt: new Date(),
    }).returning();
    return note;
  }

  async updateNote(id: string, data: Partial<InsertNote>): Promise<Note | undefined> {
    const [note] = await db.update(notes).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(notes.id, id)).returning();
    return note;
  }

  async deleteNote(id: string): Promise<void> {
    await db.delete(noteLinks).where(eq(noteLinks.noteId, id));
    await db.delete(notes).where(eq(notes.id, id));
  }

  async searchNotes(workspaceId: string, query: string): Promise<Note[]> {
    return db.select().from(notes).where(
      and(
        eq(notes.workspaceId, workspaceId),
        like(notes.title, `%${query}%`)
      )
    );
  }

  // Tags
  async getTags(workspaceId: string): Promise<Tag[]> {
    return db.select().from(tags).where(eq(tags.workspaceId, workspaceId)).orderBy(tags.name);
  }

  async getTag(id: string): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag;
  }

  async createTag(data: InsertTag): Promise<Tag> {
    const [tag] = await db.insert(tags).values(data).returning();
    return tag;
  }

  async updateTag(id: string, data: Partial<InsertTag>): Promise<Tag | undefined> {
    const [tag] = await db.update(tags).set(data).where(eq(tags.id, id)).returning();
    return tag;
  }

  async deleteTag(id: string): Promise<void> {
    await db.delete(objectTags).where(eq(objectTags.tagId, id));
    await db.delete(tags).where(eq(tags.id, id));
  }

  // Note Links
  async getNoteLinks(noteId: string): Promise<NoteLink[]> {
    return db.select().from(noteLinks).where(eq(noteLinks.noteId, noteId));
  }

  async createNoteLink(data: InsertNoteLink): Promise<NoteLink> {
    const [link] = await db.insert(noteLinks).values(data).returning();
    return link;
  }

  async deleteNoteLinksByNoteId(noteId: string): Promise<void> {
    await db.delete(noteLinks).where(eq(noteLinks.noteId, noteId));
  }

  // Action Items
  async getActionItems(workspaceId: string): Promise<ActionItem[]> {
    return db.select().from(actionItems).where(eq(actionItems.workspaceId, workspaceId)).orderBy(desc(actionItems.createdAt));
  }

  async getActionItemsByObjectId(objectId: string): Promise<ActionItem[]> {
    return db.select().from(actionItems).where(eq(actionItems.relatedObjectId, objectId)).orderBy(desc(actionItems.createdAt));
  }

  async getActionItem(id: string): Promise<ActionItem | undefined> {
    const [item] = await db.select().from(actionItems).where(eq(actionItems.id, id));
    return item;
  }

  async createActionItem(data: InsertActionItem): Promise<ActionItem> {
    const [item] = await db.insert(actionItems).values({
      ...data,
      updatedAt: new Date(),
    }).returning();
    return item;
  }

  async updateActionItem(id: string, data: Partial<InsertActionItem>): Promise<ActionItem | undefined> {
    const [item] = await db.update(actionItems).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(actionItems.id, id)).returning();
    return item;
  }

  async deleteActionItem(id: string): Promise<void> {
    await db.delete(actionItems).where(eq(actionItems.id, id));
  }

  // Goal Periods
  async getGoalPeriods(workspaceId: string): Promise<GoalPeriod[]> {
    return db.select().from(goalPeriods).where(eq(goalPeriods.workspaceId, workspaceId)).orderBy(desc(goalPeriods.periodStartDate));
  }

  async getGoalPeriod(id: string): Promise<GoalPeriod | undefined> {
    const [period] = await db.select().from(goalPeriods).where(eq(goalPeriods.id, id));
    return period;
  }

  async createGoalPeriod(data: InsertGoalPeriod): Promise<GoalPeriod> {
    const [period] = await db.insert(goalPeriods).values({
      ...data,
      updatedAt: new Date(),
    }).returning();
    return period;
  }

  async updateGoalPeriod(id: string, data: Partial<InsertGoalPeriod>): Promise<GoalPeriod | undefined> {
    const [period] = await db.update(goalPeriods).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(goalPeriods.id, id)).returning();
    return period;
  }

  async deleteGoalPeriod(id: string): Promise<void> {
    await db.delete(goalPeriods).where(eq(goalPeriods.id, id));
  }
}

export const storage = new DatabaseStorage();
