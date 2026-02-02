import { useCallback, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import { Mention } from "@tiptap/extension-mention";
import { 
  Bold, Italic, List, ListOrdered, Heading1, Heading2, 
  Quote, Code, Link2, CheckSquare, Undo, Redo, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { type ExecObject, type Tag, type Note } from "@shared/schema";
import { type NoteKind } from "@/lib/types";

interface NoteEditorProps {
  note?: Note | null;
  objects: ExecObject[];
  tags: Tag[];
  onSave: (title: string, content: any, noteKind: NoteKind) => void;
  onMentionClick?: (type: "object" | "tag", id: string) => void;
  placeholder?: string;
  className?: string;
}

export interface NoteEditorRef {
  clear: () => void;
  setContent: (title: string, content: any, noteKind: NoteKind) => void;
}

export const NoteEditor = forwardRef<NoteEditorRef, NoteEditorProps>(({
  note,
  objects,
  tags,
  onSave,
  onMentionClick,
  placeholder = "Start writing... Use @ to mention objects, # for tags",
  className,
}, ref) => {
  const [title, setTitle] = useState(note?.title || "");
  const [noteKind, setNoteKind] = useState<NoteKind>((note?.noteKind as NoteKind) || "general");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder,
        emptyNodeClass: "is-editor-empty",
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2",
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention-token",
        },
        suggestion: {
          items: ({ query }: { query: string }) => {
            return objects
              .filter(obj => obj.title.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 5)
              .map(obj => ({
                id: obj.id,
                label: obj.title,
                type: obj.objectType,
              }));
          },
          char: "@",
        },
        renderLabel: ({ node }: { node: any }) => `@${node.attrs.label}`,
      }),
      Mention.extend({ name: "tag" }).configure({
        HTMLAttributes: {
          class: "tag-token",
        },
        suggestion: {
          items: ({ query }: { query: string }) => {
            return tags
              .filter(tag => tag.name.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 5)
              .map(tag => ({
                id: tag.id,
                label: tag.name,
                color: tag.color,
              }));
          },
          char: "#",
        },
        renderLabel: ({ node }: { node: any }) => `#${node.attrs.label}`,
      }),
    ],
    content: note?.content || "",
    editorProps: {
      attributes: {
        class: "tiptap-editor focus:outline-none min-h-[200px]",
      },
    },
  });

  useEffect(() => {
    if (note && editor) {
      setTitle(note.title);
      setNoteKind((note.noteKind as NoteKind) || "general");
      editor.commands.setContent(note.content || "");
    }
  }, [note, editor]);

  useImperativeHandle(ref, () => ({
    clear: () => {
      setTitle("");
      setNoteKind("general");
      editor?.commands.clearContent();
    },
    setContent: (newTitle: string, content: any, kind: NoteKind) => {
      setTitle(newTitle);
      setNoteKind(kind);
      editor?.commands.setContent(content || "");
    },
  }));

  const handleSave = useCallback(() => {
    if (!editor || !title.trim()) return;
    const content = editor.getJSON();
    onSave(title, content, noteKind);
  }, [editor, title, noteKind, onSave]);

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    icon: Icon,
    title: buttonTitle,
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    icon: any;
    title: string;
  }) => (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", isActive && "bg-muted")}
      onClick={onClick}
      title={buttonTitle}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  if (!editor) return null;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center gap-2 p-2 border-b">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="h-8 flex-1 border-0 bg-transparent text-base font-medium focus-visible:ring-0"
          data-testid="input-note-title"
        />
        <Select value={noteKind} onValueChange={(v) => setNoteKind(v as NoteKind)}>
          <SelectTrigger className="w-[130px] h-8" data-testid="select-note-kind">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="daily">Daily Log</SelectItem>
            <SelectItem value="weekly">Weekly Goals</SelectItem>
            <SelectItem value="monthly">Monthly Goals</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="project_log">Project Log</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          size="sm" 
          onClick={handleSave}
          disabled={!title.trim()}
          data-testid="button-save-note"
        >
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
      </div>

      <div className="flex items-center gap-0.5 p-1 border-b bg-muted/30 flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          icon={Bold}
          title="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          icon={Italic}
          title="Italic"
        />
        <Separator orientation="vertical" className="h-5 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          icon={Heading1}
          title="Heading 1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          icon={Heading2}
          title="Heading 2"
        />
        <Separator orientation="vertical" className="h-5 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          icon={List}
          title="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          icon={ListOrdered}
          title="Ordered List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive("taskList")}
          icon={CheckSquare}
          title="Task List"
        />
        <Separator orientation="vertical" className="h-5 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          icon={Quote}
          title="Blockquote"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          icon={Code}
          title="Code Block"
        />
        <ToolbarButton
          onClick={() => {
            const url = window.prompt("Enter URL:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          isActive={editor.isActive("link")}
          icon={Link2}
          title="Add Link"
        />
        <div className="flex-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          icon={Undo}
          title="Undo"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          icon={Redo}
          title="Redo"
        />
      </div>

      <div className="flex-1 overflow-auto p-4 ide-scrollbar">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});

NoteEditor.displayName = "NoteEditor";
