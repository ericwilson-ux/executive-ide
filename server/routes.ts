import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertObjectSchema, 
  insertNoteSchema, 
  insertTagSchema, 
  insertActionItemSchema,
  insertFolderNodeSchema,
  insertGoalPeriodSchema,
} from "@shared/schema";
import { z } from "zod";

// Partial schemas for updates
const updateObjectSchema = insertObjectSchema.partial();
const updateNoteSchema = insertNoteSchema.partial();
const updateTagSchema = insertTagSchema.partial();
const updateActionItemSchema = insertActionItemSchema.partial();
const updateFolderNodeSchema = insertFolderNodeSchema.partial();
const updateGoalPeriodSchema = insertGoalPeriodSchema.partial();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize default workspace
  const workspace = await storage.getDefaultWorkspace();
  const workspaceId = workspace.id;

  // Objects
  app.get("/api/objects", async (req, res) => {
    try {
      const objects = await storage.getObjects(workspaceId);
      res.json(objects);
    } catch (error) {
      console.error("Error fetching objects:", error);
      res.status(500).json({ error: "Failed to fetch objects" });
    }
  });

  app.get("/api/objects/:id", async (req, res) => {
    try {
      const object = await storage.getObject(req.params.id);
      if (!object) {
        return res.status(404).json({ error: "Object not found" });
      }
      res.json(object);
    } catch (error) {
      console.error("Error fetching object:", error);
      res.status(500).json({ error: "Failed to fetch object" });
    }
  });

  app.post("/api/objects", async (req, res) => {
    try {
      const data = insertObjectSchema.parse({
        ...req.body,
        workspaceId,
      });
      const object = await storage.createObject(data);
      res.status(201).json(object);
    } catch (error) {
      console.error("Error creating object:", error);
      res.status(400).json({ error: "Failed to create object" });
    }
  });

  app.patch("/api/objects/:id", async (req, res) => {
    try {
      const data = updateObjectSchema.parse(req.body);
      const object = await storage.updateObject(req.params.id, data);
      if (!object) {
        return res.status(404).json({ error: "Object not found" });
      }
      res.json(object);
    } catch (error) {
      console.error("Error updating object:", error);
      res.status(400).json({ error: "Failed to update object" });
    }
  });

  app.delete("/api/objects/:id", async (req, res) => {
    try {
      await storage.deleteObject(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting object:", error);
      res.status(500).json({ error: "Failed to delete object" });
    }
  });

  // Notes
  app.get("/api/notes", async (req, res) => {
    try {
      const notes = await storage.getNotes(workspaceId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/:id", async (req, res) => {
    try {
      const note = await storage.getNote(req.params.id);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      console.error("Error fetching note:", error);
      res.status(500).json({ error: "Failed to fetch note" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const data = insertNoteSchema.parse({
        ...req.body,
        workspaceId,
      });
      const note = await storage.createNote(data);
      res.status(201).json(note);
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(400).json({ error: "Failed to create note" });
    }
  });

  app.patch("/api/notes/:id", async (req, res) => {
    try {
      const data = updateNoteSchema.parse(req.body);
      const note = await storage.updateNote(req.params.id, data);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(400).json({ error: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      await storage.deleteNote(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  // Tags
  app.get("/api/tags", async (req, res) => {
    try {
      const tagList = await storage.getTags(workspaceId);
      res.json(tagList);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ error: "Failed to fetch tags" });
    }
  });

  app.post("/api/tags", async (req, res) => {
    try {
      const data = insertTagSchema.parse({
        ...req.body,
        workspaceId,
      });
      const tag = await storage.createTag(data);
      res.status(201).json(tag);
    } catch (error) {
      console.error("Error creating tag:", error);
      res.status(400).json({ error: "Failed to create tag" });
    }
  });

  app.patch("/api/tags/:id", async (req, res) => {
    try {
      const data = updateTagSchema.parse(req.body);
      const tag = await storage.updateTag(req.params.id, data);
      if (!tag) {
        return res.status(404).json({ error: "Tag not found" });
      }
      res.json(tag);
    } catch (error) {
      console.error("Error updating tag:", error);
      res.status(400).json({ error: "Failed to update tag" });
    }
  });

  app.delete("/api/tags/:id", async (req, res) => {
    try {
      await storage.deleteTag(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting tag:", error);
      res.status(500).json({ error: "Failed to delete tag" });
    }
  });

  // Action Items
  app.get("/api/action-items", async (req, res) => {
    try {
      const items = await storage.getActionItems(workspaceId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching action items:", error);
      res.status(500).json({ error: "Failed to fetch action items" });
    }
  });

  app.get("/api/action-items/:id", async (req, res) => {
    try {
      const item = await storage.getActionItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Action item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching action item:", error);
      res.status(500).json({ error: "Failed to fetch action item" });
    }
  });

  app.post("/api/action-items", async (req, res) => {
    try {
      const data = insertActionItemSchema.parse({
        ...req.body,
        workspaceId,
      });
      const item = await storage.createActionItem(data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating action item:", error);
      res.status(400).json({ error: "Failed to create action item" });
    }
  });

  app.patch("/api/action-items/:id", async (req, res) => {
    try {
      const data = updateActionItemSchema.parse(req.body);
      const item = await storage.updateActionItem(req.params.id, data);
      if (!item) {
        return res.status(404).json({ error: "Action item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating action item:", error);
      res.status(400).json({ error: "Failed to update action item" });
    }
  });

  app.delete("/api/action-items/:id", async (req, res) => {
    try {
      await storage.deleteActionItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting action item:", error);
      res.status(500).json({ error: "Failed to delete action item" });
    }
  });

  // Folders
  app.get("/api/folders", async (req, res) => {
    try {
      const folders = await storage.getFolderNodes(workspaceId);
      res.json(folders);
    } catch (error) {
      console.error("Error fetching folders:", error);
      res.status(500).json({ error: "Failed to fetch folders" });
    }
  });

  app.post("/api/folders", async (req, res) => {
    try {
      const data = insertFolderNodeSchema.parse({
        ...req.body,
        workspaceId,
      });
      const folder = await storage.createFolderNode(data);
      res.status(201).json(folder);
    } catch (error) {
      console.error("Error creating folder:", error);
      res.status(400).json({ error: "Failed to create folder" });
    }
  });

  app.patch("/api/folders/:id", async (req, res) => {
    try {
      const data = updateFolderNodeSchema.parse(req.body);
      const folder = await storage.updateFolderNode(req.params.id, data);
      if (!folder) {
        return res.status(404).json({ error: "Folder not found" });
      }
      res.json(folder);
    } catch (error) {
      console.error("Error updating folder:", error);
      res.status(400).json({ error: "Failed to update folder" });
    }
  });

  app.delete("/api/folders/:id", async (req, res) => {
    try {
      await storage.deleteFolderNode(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting folder:", error);
      res.status(500).json({ error: "Failed to delete folder" });
    }
  });

  // Goal Periods
  app.get("/api/goal-periods", async (req, res) => {
    try {
      const periods = await storage.getGoalPeriods(workspaceId);
      res.json(periods);
    } catch (error) {
      console.error("Error fetching goal periods:", error);
      res.status(500).json({ error: "Failed to fetch goal periods" });
    }
  });

  app.get("/api/goal-periods/:id", async (req, res) => {
    try {
      const period = await storage.getGoalPeriod(req.params.id);
      if (!period) {
        return res.status(404).json({ error: "Goal period not found" });
      }
      res.json(period);
    } catch (error) {
      console.error("Error fetching goal period:", error);
      res.status(500).json({ error: "Failed to fetch goal period" });
    }
  });

  app.post("/api/goal-periods", async (req, res) => {
    try {
      const data = insertGoalPeriodSchema.parse({
        ...req.body,
        workspaceId,
      });
      const period = await storage.createGoalPeriod(data);
      res.status(201).json(period);
    } catch (error) {
      console.error("Error creating goal period:", error);
      res.status(400).json({ error: "Failed to create goal period" });
    }
  });

  app.patch("/api/goal-periods/:id", async (req, res) => {
    try {
      const data = updateGoalPeriodSchema.parse(req.body);
      const period = await storage.updateGoalPeriod(req.params.id, data);
      if (!period) {
        return res.status(404).json({ error: "Goal period not found" });
      }
      res.json(period);
    } catch (error) {
      console.error("Error updating goal period:", error);
      res.status(400).json({ error: "Failed to update goal period" });
    }
  });

  app.delete("/api/goal-periods/:id", async (req, res) => {
    try {
      await storage.deleteGoalPeriod(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting goal period:", error);
      res.status(500).json({ error: "Failed to delete goal period" });
    }
  });

  // Search
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const [objects, notes] = await Promise.all([
        storage.searchObjects(workspaceId, query),
        storage.searchNotes(workspaceId, query),
      ]);
      res.json({ objects, notes });
    } catch (error) {
      console.error("Error searching:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  return httpServer;
}
