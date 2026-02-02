import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Search, Command, PanelLeftClose, PanelLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarTree } from "@/components/ide/SidebarTree";
import { TabBar } from "@/components/ide/TabBar";
import { MasterPane } from "@/components/ide/MasterPane";
import { NoteEditor, type NoteEditorRef } from "@/components/ide/NoteEditor";
import { CommandPalette } from "@/components/ide/CommandPalette";
import { CreateObjectDialog } from "@/components/ide/CreateObjectDialog";
import { ActionItemPanel } from "@/components/ide/ActionItemPanel";
import { WelcomePane } from "@/components/ide/WelcomePane";
import { SearchModal } from "@/components/ide/SearchModal";
import { type ExecObject, type Note, type Tag, type ActionItem, type FolderNode } from "@shared/schema";
import { type TabItem, type CategoryType, CATEGORY_CONFIG, type NoteKind, type ActionStatus } from "@/lib/types";

export default function Home() {
  const { toast } = useToast();
  const editorRef = useRef<NoteEditorRef>(null);

  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createCategory, setCreateCategory] = useState<CategoryType | null>(null);
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Data Queries
  const { data: objects = [], isLoading: loadingObjects } = useQuery<ExecObject[]>({
    queryKey: ["/api/objects"],
  });

  const { data: notes = [], isLoading: loadingNotes } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  const { data: tags = [], isLoading: loadingTags } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
  });

  const { data: actionItems = [], isLoading: loadingActionItems } = useQuery<ActionItem[]>({
    queryKey: ["/api/action-items"],
  });

  const { data: folders = [] } = useQuery<FolderNode[]>({
    queryKey: ["/api/folders"],
  });

  // Get current object
  const selectedObject = objects.find(o => o.id === selectedObjectId);
  const editingNote = notes.find(n => n.id === editingNoteId);

  // Filter data for selected object
  const objectNotes = notes.filter(n => n.objectId === selectedObjectId);
  const objectActionItems = actionItems.filter(a => a.relatedObjectId === selectedObjectId);

  // Mutations
  const createObjectMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; status: string; objectType: string }) => {
      const res = await apiRequest("POST", "/api/objects", data);
      return res.json();
    },
    onSuccess: (newObject: ExecObject) => {
      queryClient.invalidateQueries({ queryKey: ["/api/objects"] });
      openObjectTab(newObject);
      toast({ title: "Created", description: `${newObject.title} has been created.` });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to create object." });
    },
  });

  const deleteObjectMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/objects/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/objects"] });
      closeTab(id);
      if (selectedObjectId === id) setSelectedObjectId(null);
      toast({ title: "Deleted", description: "Object has been deleted." });
    },
  });

  const saveNoteMutation = useMutation({
    mutationFn: async (data: { id?: string; title: string; content: any; noteKind: string; objectId?: string }) => {
      if (data.id) {
        const res = await apiRequest("PATCH", `/api/notes/${data.id}`, data);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/notes", data);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setEditingNoteId(null);
      editorRef.current?.clear();
      toast({ title: "Saved", description: "Note has been saved." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to save note." });
    },
  });

  const createActionItemMutation = useMutation({
    mutationFn: async (data: { title: string; status: string; dueDate?: Date; relatedObjectId?: string }) => {
      const res = await apiRequest("POST", "/api/action-items", {
        ...data,
        workspaceId: "default",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/action-items"] });
      toast({ title: "Created", description: "Action item has been created." });
    },
  });

  const updateActionItemMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ActionStatus }) => {
      const res = await apiRequest("PATCH", `/api/action-items/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/action-items"] });
    },
  });

  const deleteActionItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/action-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/action-items"] });
      toast({ title: "Deleted", description: "Action item has been deleted." });
    },
  });

  // Tab Management
  const openObjectTab = useCallback((obj: ExecObject) => {
    setSelectedObjectId(obj.id);
    setEditingNoteId(null);
    setTabs(prev => {
      const existing = prev.find(t => t.id === obj.id);
      if (existing) {
        return prev.map(t => ({ ...t, isActive: t.id === obj.id }));
      }
      return [
        ...prev.map(t => ({ ...t, isActive: false })),
        { id: obj.id, type: "object" as const, title: obj.title, objectType: obj.objectType, isActive: true },
      ];
    });
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== id);
      if (prev.find(t => t.id === id)?.isActive && newTabs.length > 0) {
        newTabs[newTabs.length - 1].isActive = true;
        const activeTab = newTabs[newTabs.length - 1];
        setSelectedObjectId(activeTab.type === "object" ? activeTab.id : null);
      } else if (newTabs.length === 0) {
        setSelectedObjectId(null);
      }
      return newTabs;
    });
  }, []);

  const selectTab = useCallback((id: string) => {
    setTabs(prev => prev.map(t => ({ ...t, isActive: t.id === id })));
    const tab = tabs.find(t => t.id === id);
    if (tab?.type === "object") {
      setSelectedObjectId(id);
    }
  }, [tabs]);

  // Handlers
  const handleCreateObject = (category: CategoryType) => {
    setCreateCategory(category);
    setCreateDialogOpen(true);
  };

  const handleSubmitCreate = (data: { title: string; description: string; status: string }) => {
    if (!createCategory) return;
    const config = CATEGORY_CONFIG[createCategory];
    createObjectMutation.mutate({
      ...data,
      objectType: config.objectType,
    });
  };

  const handleSaveNote = (title: string, content: any, noteKind: NoteKind) => {
    saveNoteMutation.mutate({
      id: editingNoteId || undefined,
      title,
      content,
      noteKind,
      objectId: selectedObjectId || undefined,
    });
  };

  const handleNoteClick = (note: Note) => {
    setEditingNoteId(note.id);
    editorRef.current?.setContent(note.title, note.content, (note.noteKind as NoteKind) || "general");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        editorRef.current?.clear();
        setEditingNoteId(null);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isLoading = loadingObjects || loadingNotes || loadingTags || loadingActionItems;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-10 border-b flex items-center justify-between px-2 gap-2 bg-sidebar shrink-0">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            data-testid="button-toggle-sidebar"
          >
            {sidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
          <span className="text-sm font-semibold text-muted-foreground">Executive IDE</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            data-testid="button-open-search"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCommandPaletteOpen(true)}
            data-testid="button-open-command"
          >
            <Command className="h-4 w-4" />
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Sidebar */}
          {!sidebarCollapsed && (
            <>
              <Panel defaultSize={18} minSize={15} maxSize={30}>
                <div className="h-full bg-sidebar border-r flex flex-col">
                  <div className="p-2 border-b">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Explorer</p>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <SidebarTree
                      objects={objects}
                      folders={folders}
                      onSelectObject={openObjectTab}
                      onCreateObject={handleCreateObject}
                      onDeleteObject={(id) => deleteObjectMutation.mutate(id)}
                      onEditObject={openObjectTab}
                      selectedId={selectedObjectId}
                    />
                  </div>
                </div>
              </Panel>
              <PanelResizeHandle className="w-1 resize-handle" />
            </>
          )}

          {/* Main Area */}
          <Panel>
            <div className="h-full flex flex-col">
              <TabBar tabs={tabs} onSelectTab={selectTab} onCloseTab={closeTab} />
              
              {selectedObject ? (
                <PanelGroup direction="horizontal" className="flex-1">
                  {/* Master Pane */}
                  <Panel defaultSize={40} minSize={30}>
                    <MasterPane
                      object={selectedObject}
                      recentNotes={objectNotes}
                      openActionItems={objectActionItems.filter(a => a.status !== "done")}
                      relatedTags={tags}
                      relatedObjects={objects.filter(o => o.id !== selectedObjectId).slice(0, 5)}
                      onNoteClick={handleNoteClick}
                    />
                  </Panel>
                  <PanelResizeHandle className="w-1 resize-handle" />
                  
                  {/* Editor Pane */}
                  <Panel defaultSize={60} minSize={40}>
                    <div className="h-full flex flex-col">
                      <NoteEditor
                        ref={editorRef}
                        note={editingNote}
                        objects={objects}
                        tags={tags}
                        onSave={handleSaveNote}
                        placeholder={`Write notes about ${selectedObject.title}... Use @ to mention, # for tags`}
                        className="flex-1"
                      />
                    </div>
                  </Panel>
                </PanelGroup>
              ) : (
                <WelcomePane onOpenCommandPalette={() => setCommandPaletteOpen(true)} />
              )}
            </div>
          </Panel>

          {/* Action Items Panel */}
          {selectedObject && (
            <>
              <PanelResizeHandle className="w-1 resize-handle" />
              <Panel defaultSize={22} minSize={18} maxSize={30}>
                <div className="h-full border-l bg-sidebar">
                  <ActionItemPanel
                    actionItems={objectActionItems}
                    objects={objects}
                    onCreateActionItem={createActionItemMutation.mutate}
                    onUpdateStatus={(id, status) => updateActionItemMutation.mutate({ id, status })}
                    onDeleteActionItem={deleteActionItemMutation.mutate}
                    relatedObjectId={selectedObjectId}
                  />
                </div>
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>

      {/* Modals */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        objects={objects}
        notes={notes}
        tags={tags}
        onSelectObject={openObjectTab}
        onSelectNote={(note) => {
          if (note.objectId) {
            const obj = objects.find(o => o.id === note.objectId);
            if (obj) openObjectTab(obj);
          }
          handleNoteClick(note);
        }}
        onCreateObject={handleCreateObject}
        onCreateNote={() => {
          editorRef.current?.clear();
          setEditingNoteId(null);
        }}
      />

      <CreateObjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        category={createCategory}
        onSubmit={handleSubmitCreate}
      />

      <SearchModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        objects={objects}
        notes={notes}
        tags={tags}
        onSelectObject={openObjectTab}
        onSelectNote={(note) => {
          if (note.objectId) {
            const obj = objects.find(o => o.id === note.objectId);
            if (obj) openObjectTab(obj);
          }
          handleNoteClick(note);
        }}
      />
    </div>
  );
}
