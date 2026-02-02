import { Command, Target, FolderKanban, FileText, Users, CheckSquare, Keyboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WelcomePaneProps {
  onOpenCommandPalette: () => void;
}

export function WelcomePane({ onOpenCommandPalette }: WelcomePaneProps) {
  const shortcuts = [
    { keys: ["Cmd", "K"], description: "Open command palette" },
    { keys: ["Cmd", "N"], description: "New note" },
    { keys: ["Cmd", "Enter"], description: "Save note" },
    { keys: ["@"], description: "Mention object" },
    { keys: ["#"], description: "Add tag" },
  ];

  const categories = [
    { icon: Target, label: "Priorities", description: "Track your key goals and focus areas" },
    { icon: FolderKanban, label: "Projects", description: "Manage ongoing initiatives" },
    { icon: FileText, label: "Notes", description: "Write and organize your thoughts" },
    { icon: Users, label: "People", description: "Keep track of key stakeholders" },
    { icon: CheckSquare, label: "Action Items", description: "Capture and complete tasks" },
  ];

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Executive IDE</h1>
          <p className="text-muted-foreground">
            Your personal command center for managing priorities, projects, and actions.
          </p>
        </div>

        <Card className="hover-elevate cursor-pointer" onClick={onOpenCommandPalette} data-testid="card-command-palette">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
              <Command className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Command Palette</p>
              <p className="text-sm text-muted-foreground">
                Quick access to everything with keyboard shortcuts
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="font-mono text-xs">Cmd</Badge>
              <span className="text-muted-foreground">+</span>
              <Badge variant="outline" className="font-mono text-xs">K</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {categories.map(({ icon: Icon, label, description }) => (
            <Card key={label} className="text-center p-4">
              <Icon className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Keyboard className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Keyboard Shortcuts</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {shortcuts.map(({ keys, description }) => (
                <div key={description} className="flex items-center justify-between py-1.5 px-2 rounded-md bg-muted/30">
                  <span className="text-sm text-muted-foreground">{description}</span>
                  <div className="flex items-center gap-1">
                    {keys.map((key, i) => (
                      <span key={i}>
                        {i > 0 && <span className="text-muted-foreground mx-0.5">+</span>}
                        <Badge variant="outline" className="font-mono text-xs">{key}</Badge>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Select an item from the sidebar or use the command palette to get started.
        </p>
      </div>
    </div>
  );
}
