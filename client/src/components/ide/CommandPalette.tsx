import { useState, useEffect, useCallback } from "react";
import { Command as CommandIcon, Search, Plus, FileText, Target, FolderKanban, Users, CheckSquare, Star, User, Briefcase } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { type ExecObject, type Note, type Tag } from "@shared/schema";
import { type CategoryType, CATEGORY_CONFIG } from "@/lib/types";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objects: ExecObject[];
  notes: Note[];
  tags: Tag[];
  onSelectObject: (obj: ExecObject) => void;
  onSelectNote: (note: Note) => void;
  onCreateObject: (category: CategoryType) => void;
  onCreateNote: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  objects,
  notes,
  tags,
  onSelectObject,
  onSelectNote,
  onCreateObject,
  onCreateNote,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setSearch("");
    }
  }, [open]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "p") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const getObjectIcon = (objectType: string) => {
    switch (objectType) {
      case "priority": return Star;
      case "project": return Briefcase;
      case "person": return User;
      case "action_item": return CheckSquare;
      case "meeting": return Users;
      default: return FileText;
    }
  };

  const getCategoryIcon = (category: CategoryType) => {
    switch (category) {
      case "priorities": return Target;
      case "projects": return FolderKanban;
      case "notes": return FileText;
      case "people": return Users;
      case "action_items": return CheckSquare;
    }
  };

  const filteredObjects = objects.filter(obj =>
    obj.title.toLowerCase().includes(search.toLowerCase())
  );

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search objects, notes, or type a command..." 
        value={search}
        onValueChange={setSearch}
        data-testid="input-command-search"
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Quick Actions">
          <CommandItem 
            onSelect={() => { onCreateNote(); onOpenChange(false); }}
            data-testid="command-new-note"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Note
            <span className="ml-auto text-xs text-muted-foreground">Cmd+N</span>
          </CommandItem>
          {(Object.keys(CATEGORY_CONFIG) as CategoryType[]).map(category => {
            const Icon = getCategoryIcon(category);
            const config = CATEGORY_CONFIG[category];
            return (
              <CommandItem 
                key={category}
                onSelect={() => { onCreateObject(category); onOpenChange(false); }}
                data-testid={`command-new-${category}`}
              >
                <Plus className="mr-2 h-4 w-4" />
                New {config.label.slice(0, -1)}
              </CommandItem>
            );
          })}
        </CommandGroup>

        {filteredObjects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Objects">
              {filteredObjects.slice(0, 10).map(obj => {
                const Icon = getObjectIcon(obj.objectType);
                return (
                  <CommandItem
                    key={obj.id}
                    onSelect={() => { onSelectObject(obj); onOpenChange(false); }}
                    data-testid={`command-object-${obj.id}`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {obj.title}
                    <span className="ml-auto text-xs text-muted-foreground capitalize">
                      {obj.objectType?.replace("_", " ")}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}

        {filteredNotes.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Notes">
              {filteredNotes.slice(0, 10).map(note => (
                <CommandItem
                  key={note.id}
                  onSelect={() => { onSelectNote(note); onOpenChange(false); }}
                  data-testid={`command-note-${note.id}`}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {note.title}
                  <span className="ml-auto text-xs text-muted-foreground capitalize">
                    {note.noteKind?.replace("_", " ")}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
