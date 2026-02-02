import { useState, useMemo } from "react";
import { Search, FileText, Star, Briefcase, User, CheckSquare, Users, Tag, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ExecObject, type Note, type Tag as TagType } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objects: ExecObject[];
  notes: Note[];
  tags: TagType[];
  onSelectObject: (obj: ExecObject) => void;
  onSelectNote: (note: Note) => void;
}

type SearchResult = {
  type: "object" | "note" | "tag";
  id: string;
  title: string;
  subtitle?: string;
  objectType?: string;
};

const getIcon = (type: string, objectType?: string) => {
  if (type === "note") return FileText;
  if (type === "tag") return Tag;
  switch (objectType) {
    case "priority": return Star;
    case "project": return Briefcase;
    case "person": return User;
    case "action_item": return CheckSquare;
    case "meeting": return Users;
    default: return FileText;
  }
};

export function SearchModal({
  open,
  onOpenChange,
  objects,
  notes,
  tags,
  onSelectObject,
  onSelectNote,
}: SearchModalProps) {
  const [query, setQuery] = useState("");

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    
    const q = query.toLowerCase();
    const matches: SearchResult[] = [];

    objects.forEach(obj => {
      if (obj.title.toLowerCase().includes(q) || obj.description?.toLowerCase().includes(q)) {
        matches.push({
          type: "object",
          id: obj.id,
          title: obj.title,
          subtitle: obj.objectType?.replace("_", " "),
          objectType: obj.objectType,
        });
      }
    });

    notes.forEach(note => {
      if (note.title.toLowerCase().includes(q)) {
        matches.push({
          type: "note",
          id: note.id,
          title: note.title,
          subtitle: note.noteKind?.replace("_", " "),
        });
      }
    });

    tags.forEach(tag => {
      if (tag.name.toLowerCase().includes(q)) {
        matches.push({
          type: "tag",
          id: tag.id,
          title: `#${tag.name}`,
        });
      }
    });

    return matches.slice(0, 20);
  }, [query, objects, notes, tags]);

  const handleSelect = (result: SearchResult) => {
    if (result.type === "object") {
      const obj = objects.find(o => o.id === result.id);
      if (obj) onSelectObject(obj);
    } else if (result.type === "note") {
      const note = notes.find(n => n.id === result.id);
      if (note) onSelectNote(note);
    }
    onOpenChange(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search objects, notes, and tags..."
              className="pl-9 pr-9"
              autoFocus
              data-testid="input-search"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <ScrollArea className="max-h-[300px]">
            {results.length > 0 ? (
              <div className="space-y-1">
                {results.map(result => {
                  const Icon = getIcon(result.type, result.objectType);
                  return (
                    <div
                      key={`${result.type}-${result.id}`}
                      className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer"
                      onClick={() => handleSelect(result)}
                      data-testid={`search-result-${result.id}`}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{result.title}</p>
                      </div>
                      {result.subtitle && (
                        <Badge variant="outline" className="capitalize shrink-0">
                          {result.subtitle}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : query ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No results found for "{query}"
              </p>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Start typing to search...
              </p>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
