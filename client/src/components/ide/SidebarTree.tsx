import { useState } from "react";
import { ChevronRight, ChevronDown, Target, FolderKanban, FileText, Users, CheckSquare, Plus, MoreHorizontal, User, Briefcase, Star, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { type ExecObject, type FolderNode } from "@shared/schema";
import { CATEGORY_CONFIG, type CategoryType, type ObjectType, OBJECT_TYPE_COLORS } from "@/lib/types";

interface SidebarTreeProps {
  objects: ExecObject[];
  folders: FolderNode[];
  onSelectObject: (obj: ExecObject) => void;
  onCreateObject: (category: CategoryType) => void;
  onDeleteObject?: (id: string) => void;
  onEditObject?: (obj: ExecObject) => void;
  selectedId?: string | null;
}

const getCategoryIcon = (category: CategoryType) => {
  switch (category) {
    case "priorities": return Target;
    case "projects": return FolderKanban;
    case "notes": return FileText;
    case "people": return Users;
    case "action_items": return CheckSquare;
  }
};

const getObjectIcon = (objectType: ObjectType) => {
  switch (objectType) {
    case "priority": return Star;
    case "project": return Briefcase;
    case "person": return User;
    case "action_item": return CheckSquare;
    case "meeting": return Users;
    case "note_topic": return FileText;
  }
};

function CategoryNode({
  category,
  objects,
  onSelectObject,
  onCreateObject,
  onDeleteObject,
  onEditObject,
  selectedId,
}: {
  category: CategoryType;
  objects: ExecObject[];
  onSelectObject: (obj: ExecObject) => void;
  onCreateObject: (category: CategoryType) => void;
  onDeleteObject?: (id: string) => void;
  onEditObject?: (obj: ExecObject) => void;
  selectedId?: string | null;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const config = CATEGORY_CONFIG[category];
  const Icon = getCategoryIcon(category);
  const categoryObjects = objects.filter(obj => {
    if (category === "priorities") return obj.objectType === "priority";
    if (category === "projects") return obj.objectType === "project";
    if (category === "people") return obj.objectType === "person";
    if (category === "action_items") return obj.objectType === "action_item";
    if (category === "notes") return obj.objectType === "note_topic" || obj.objectType === "meeting";
    return false;
  });

  return (
    <div className="mb-1">
      <div 
        className="flex items-center gap-1 px-2 py-1.5 rounded-md hover-elevate cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid={`category-${category}`}
      >
        <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </Button>
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 text-sm font-medium">{config.label}</span>
        <span className="text-xs text-muted-foreground mr-1">{categoryObjects.length}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onCreateObject(category);
          }}
          data-testid={`button-add-${category}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      {isExpanded && (
        <div className="ml-4 mt-0.5 space-y-0.5">
          {categoryObjects.map(obj => {
            const ObjIcon = getObjectIcon(obj.objectType as ObjectType);
            return (
              <div
                key={obj.id}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer group",
                  selectedId === obj.id 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "hover-elevate"
                )}
                onClick={() => onSelectObject(obj)}
                data-testid={`object-${obj.id}`}
              >
                <ObjIcon className={cn("h-3.5 w-3.5", OBJECT_TYPE_COLORS[obj.objectType as ObjectType])} />
                <span className="flex-1 text-sm truncate">{obj.title}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`button-object-menu-${obj.id}`}
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditObject?.(obj)} data-testid={`menu-edit-${obj.id}`}>
                      <Pencil className="h-3.5 w-3.5 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteObject?.(obj.id)}
                      className="text-destructive"
                      data-testid={`menu-delete-${obj.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
          {categoryObjects.length === 0 && (
            <div className="px-2 py-2 text-xs text-muted-foreground italic">
              No items yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SidebarTree({
  objects,
  folders,
  onSelectObject,
  onCreateObject,
  onDeleteObject,
  onEditObject,
  selectedId,
}: SidebarTreeProps) {
  const categories: CategoryType[] = ["priorities", "projects", "notes", "people", "action_items"];

  return (
    <ScrollArea className="h-full ide-scrollbar">
      <div className="p-2">
        {categories.map(category => (
          <CategoryNode
            key={category}
            category={category}
            objects={objects}
            onSelectObject={onSelectObject}
            onCreateObject={onCreateObject}
            onDeleteObject={onDeleteObject}
            onEditObject={onEditObject}
            selectedId={selectedId}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
