import { Calendar, CheckSquare, FileText, Link2, Clock, User, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { type ExecObject, type Note, type ActionItem, type Tag as TagType } from "@shared/schema";
import { STATUS_COLORS, OBJECT_TYPE_COLORS, type ObjectType, type ActionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MasterPaneProps {
  object: ExecObject;
  recentNotes: Note[];
  openActionItems: ActionItem[];
  relatedTags: TagType[];
  relatedObjects: ExecObject[];
  onNoteClick?: (note: Note) => void;
  onActionItemClick?: (item: ActionItem) => void;
  onObjectClick?: (obj: ExecObject) => void;
}

export function MasterPane({
  object,
  recentNotes,
  openActionItems,
  relatedTags,
  relatedObjects,
  onNoteClick,
  onActionItemClick,
  onObjectClick,
}: MasterPaneProps) {
  const statusLabel = object.status || "active";

  return (
    <ScrollArea className="h-full ide-scrollbar">
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={cn("capitalize", OBJECT_TYPE_COLORS[object.objectType as ObjectType])}>
              {object.objectType?.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {statusLabel}
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold" data-testid="master-pane-title">{object.title}</h1>
          {object.description && (
            <p className="text-muted-foreground">{object.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Created {format(new Date(object.createdAt), "MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Updated {format(new Date(object.updatedAt), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Recent Notes</h3>
            <Badge variant="secondary">{recentNotes.length}</Badge>
          </div>
          {recentNotes.length > 0 ? (
            <div className="space-y-2">
              {recentNotes.map(note => (
                <Card 
                  key={note.id} 
                  className="cursor-pointer hover-elevate"
                  onClick={() => onNoteClick?.(note)}
                  data-testid={`note-card-${note.id}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{note.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(note.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize shrink-0">
                        {note.noteKind?.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No notes yet. Start writing in the editor below.</p>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Open Action Items</h3>
            <Badge variant="secondary">{openActionItems.length}</Badge>
          </div>
          {openActionItems.length > 0 ? (
            <div className="space-y-2">
              {openActionItems.map(item => (
                <div 
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer"
                  onClick={() => onActionItemClick?.(item)}
                  data-testid={`action-item-${item.id}`}
                >
                  <Badge 
                    
                    className={cn("capitalize shrink-0", STATUS_COLORS[item.status as ActionStatus])}
                  >
                    {item.status}
                  </Badge>
                  <span className="text-sm flex-1 truncate">{item.title}</span>
                  {item.dueDate && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(item.dueDate), "MMM d")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No open action items.</p>
          )}
        </div>

        {relatedTags.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {relatedTags.map(tag => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    style={{ borderColor: tag.color, color: tag.color }}
                    data-testid={`tag-badge-${tag.id}`}
                  >
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {relatedObjects.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Related</h3>
              </div>
              <div className="space-y-1.5">
                {relatedObjects.map(obj => (
                  <div 
                    key={obj.id}
                    className="flex items-center gap-2 p-2 rounded-md hover-elevate cursor-pointer"
                    onClick={() => onObjectClick?.(obj)}
                    data-testid={`related-object-${obj.id}`}
                  >
                    <Badge variant="secondary" className="capitalize">
                      {obj.objectType?.replace("_", " ")}
                    </Badge>
                    <span className="text-sm">{obj.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
}
