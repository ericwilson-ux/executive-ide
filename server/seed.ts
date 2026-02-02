import { storage } from "./storage";

export async function seedDatabase() {
  try {
    // Check if we already have data
    const workspace = await storage.getDefaultWorkspace();
    const existingObjects = await storage.getObjects(workspace.id);
    
    if (existingObjects.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding database with sample data...");

    // Create sample priorities
    const priority1 = await storage.createObject({
      workspaceId: workspace.id,
      objectType: "priority",
      title: "Q1 Revenue Growth",
      description: "Focus on increasing monthly recurring revenue by 25% through product improvements and customer success initiatives.",
      status: "active",
    });

    const priority2 = await storage.createObject({
      workspaceId: workspace.id,
      objectType: "priority",
      title: "Team Expansion",
      description: "Hire 3 senior engineers and 2 product designers by end of quarter.",
      status: "active",
    });

    // Create sample projects
    const project1 = await storage.createObject({
      workspaceId: workspace.id,
      objectType: "project",
      title: "Mobile App Launch",
      description: "Complete development and launch of iOS and Android mobile applications with feature parity to web.",
      status: "active",
    });

    const project2 = await storage.createObject({
      workspaceId: workspace.id,
      objectType: "project",
      title: "API v2 Migration",
      description: "Migrate all customers from API v1 to v2 with improved rate limits and new endpoints.",
      status: "active",
    });

    const project3 = await storage.createObject({
      workspaceId: workspace.id,
      objectType: "project",
      title: "Customer Dashboard Redesign",
      description: "Redesign the analytics dashboard with new visualizations and export capabilities.",
      status: "on_hold",
    });

    // Create sample people
    const person1 = await storage.createObject({
      workspaceId: workspace.id,
      objectType: "person",
      title: "Sarah Chen",
      description: "VP of Engineering. Key stakeholder for technical decisions and team growth.",
      status: "active",
    });

    const person2 = await storage.createObject({
      workspaceId: workspace.id,
      objectType: "person",
      title: "Marcus Williams",
      description: "Head of Product. Owns roadmap and feature prioritization.",
      status: "active",
    });

    const person3 = await storage.createObject({
      workspaceId: workspace.id,
      objectType: "person",
      title: "Elena Rodriguez",
      description: "Customer Success Lead. Primary contact for enterprise accounts.",
      status: "active",
    });

    // Create sample notes
    await storage.createNote({
      workspaceId: workspace.id,
      objectId: project1.id,
      title: "Mobile App Architecture Discussion",
      content: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Architecture Overview" }] },
          { type: "paragraph", content: [{ type: "text", text: "Discussed the mobile app architecture with the team. Key decisions:" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "React Native for cross-platform development" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Redux Toolkit for state management" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "REST API with GraphQL for complex queries" }] }] },
          ]},
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Next Steps" }] },
          { type: "paragraph", content: [{ type: "text", text: "Create detailed technical specification by Friday." }] },
        ],
      },
      noteKind: "meeting",
      pinned: true,
    });

    await storage.createNote({
      workspaceId: workspace.id,
      objectId: priority1.id,
      title: "Weekly Revenue Review",
      content: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Week 3 Review" }] },
          { type: "paragraph", content: [{ type: "text", text: "Current MRR: $245,000 (up 8% from last month)" }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Key Wins" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Closed enterprise deal with TechCorp ($15k/mo)" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Reduced churn by 2% through proactive outreach" }] }] },
          ]},
        ],
      },
      noteKind: "weekly",
      pinned: false,
    });

    await storage.createNote({
      workspaceId: workspace.id,
      objectId: person1.id,
      title: "1:1 with Sarah - Engineering Updates",
      content: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Discussion Points" }] },
          { type: "bulletList", content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Team morale is high after successful launch" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Need to prioritize tech debt in Q2" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Hiring pipeline looks strong - 3 candidates in final round" }] }] },
          ]},
          { type: "paragraph", content: [{ type: "text", text: "Follow up next week on hiring decisions." }] },
        ],
      },
      noteKind: "meeting",
      pinned: false,
    });

    // Create sample action items
    await storage.createActionItem({
      workspaceId: workspace.id,
      title: "Review mobile app wireframes",
      description: "Review and provide feedback on v2 wireframes from design team",
      status: "todo",
      relatedObjectId: project1.id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    });

    await storage.createActionItem({
      workspaceId: workspace.id,
      title: "Finalize API v2 migration plan",
      status: "doing",
      relatedObjectId: project2.id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    });

    await storage.createActionItem({
      workspaceId: workspace.id,
      title: "Schedule engineering team retro",
      status: "todo",
      relatedObjectId: person1.id,
    });

    await storage.createActionItem({
      workspaceId: workspace.id,
      title: "Prepare Q1 revenue presentation",
      status: "doing",
      relatedObjectId: priority1.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    await storage.createActionItem({
      workspaceId: workspace.id,
      title: "Interview senior engineer candidate",
      status: "todo",
      relatedObjectId: priority2.id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    });

    // Create sample tags
    await storage.createTag({
      workspaceId: workspace.id,
      name: "urgent",
      color: "#ef4444",
    });

    await storage.createTag({
      workspaceId: workspace.id,
      name: "technical",
      color: "#3b82f6",
    });

    await storage.createTag({
      workspaceId: workspace.id,
      name: "growth",
      color: "#22c55e",
    });

    await storage.createTag({
      workspaceId: workspace.id,
      name: "hiring",
      color: "#a855f7",
    });

    await storage.createTag({
      workspaceId: workspace.id,
      name: "strategy",
      color: "#f59e0b",
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
