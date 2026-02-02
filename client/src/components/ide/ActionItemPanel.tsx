import { useState } from "react";
import { Calendar, CheckSquare, Plus, Clock, User, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { type ActionItem, type ExecObject } from "@shared/schema";
import { STATUS_COLORS, type ActionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ActionItemPanelProps {
  actionItems: ActionItem[];
  objects: ExecObject[];
  onCreateActionItem: (data: { title: string; status: string; dueDate?: Date; relatedObjectId?: string }) => void;
  onUpdateStatus: (id: string, status: ActionStatus) => void;
  onDeleteActionItem: (id: string) => void;
  relatedObjectId?: string | null;
}

export function ActionItemPanel({
  actionItems,
  objects,
  onCreateActionItem,
  onUpdateStatus,
  onDeleteActionItem,
  relatedObjectId,
}: ActionItemPanelProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState<Date | undefined>();
  const [filter, setFilter] = useState<"all" | "open" | "done">("open");

  const filteredItems = actionItems.filter(item => {
    if (filter === "open") return item.status !== "done";
    if (filter === "done") return item.status === "done";
    return true;
  });

  const groupedItems = {
    doing: filteredItems.filter(item => item.status === "doing"),
    todo: filteredItems.filter(item => item.status === "todo"),
    blocked: filteredItems.filter(item => item.status === "blocked"),
    done: filteredItems.filter(item => item.status === "done"),
  };

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    onCreateActionItem({
      title: newTitle,
      status: "todo",
      dueDate: newDueDate,
      relatedObjectId: relatedObjectId || undefined,
    });
    setNewTitle("");
    setNewDueDate(undefined);
    setShowCreate(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">Action Items</h3>
          <Badge variant="secondary">{filteredItems.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="h-7 w-[90px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={() => setShowCreate(!showCreate)}
            data-testid="button-add-action-item"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showCreate && (
        <div className="p-3 border-b bg-muted/30 space-y-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Action item title..."
            className="h-8"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            data-testid="input-action-item-title"
          />
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-7 text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {newDueDate ? format(newDueDate, "MMM d") : "Due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={newDueDate}
                  onSelect={setNewDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="flex-1" />
            <Button variant="ghost" className="h-7" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button className="h-7" onClick={handleCreate} disabled={!newTitle.trim()} data-testid="button-save-action-item">
              Add
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 ide-scrollbar">
        <div className="p-2 space-y-3">
          {(["doing", "todo", "blocked", "done"] as const).map(status => {
            const items = groupedItems[status];
            if (items.length === 0) return null;
            
            return (
              <div key={status} className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-1">
                  <Badge className={cn("capitalize", STATUS_COLORS[status])}>
                    {status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{items.length}</span>
                </div>
                {items.map(item => {
                  const relatedObj = objects.find(o => o.id === item.relatedObjectId);
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-2 p-2 rounded-md hover-elevate group"
                      data-testid={`action-item-row-${item.id}`}
                    >
                      <Select
                        value={item.status}
                        onValueChange={(v) => onUpdateStatus(item.id, v as ActionStatus)}
                      >
                        <SelectTrigger className="h-5 w-5 p-0 border-0 bg-transparent [&>svg]:hidden">
                          <div className={cn("h-4 w-4 rounded border-2", 
                            item.status === "done" ? "bg-chart-2 border-chart-2" : "border-muted-foreground"
                          )} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="doing">In Progress</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm", item.status === "done" && "line-through text-muted-foreground")}>
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.dueDate && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(item.dueDate), "MMM d")}
                            </span>
                          )}
                          {relatedObj && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <span className="capitalize">{relatedObj.objectType?.replace("_", " ")}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => onDeleteActionItem(item.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {filteredItems.length === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-8">
              No action items {filter === "open" ? "to do" : filter === "done" ? "completed" : ""}
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
