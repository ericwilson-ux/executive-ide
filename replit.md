# Executive IDE

## Overview

Executive IDE is a personal command center web application for managing priorities, projects, notes, people, and action items. It provides an IDE-inspired workspace with relationship-driven tagging, allowing users to create interconnected content through mentions and tags. The application features a hierarchical folder structure, rich text note editing, and a unified interface for tracking goals and tasks.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS
- **Rich Text Editor**: TipTap (ProseMirror-based) with custom extensions for mentions, task lists, and code blocks
- **Layout**: Resizable panel system using react-resizable-panels for IDE-style split views
- **Theming**: Dark/light mode support with CSS variables and a custom ThemeProvider

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **API Design**: RESTful endpoints under `/api/*` prefix
- **Build System**: esbuild for server bundling, Vite for client bundling
- **Development**: Hot module replacement via Vite middleware in development mode

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (connection via `DATABASE_URL` environment variable)
- **Schema Location**: `shared/schema.ts` contains all table definitions using drizzle-orm/pg-core
- **Migrations**: Drizzle Kit with migrations output to `./migrations` directory

### Data Model
The application uses a relationship database approach with these core entities:
- **Workspaces**: Top-level container for all user data
- **FolderNodes**: Tree structure for sidebar navigation with categories (priorities, projects, notes, people, action_items)
- **Objects**: Generic entity type supporting priority, project, person, action_item, meeting, and note_topic types
- **Notes**: Rich text content with support for daily/weekly/monthly/meeting/project logs
- **Tags**: User-defined labels for cross-referencing content
- **NoteLinks**: Junction table linking notes to objects and tags (relationship mentions)
- **ActionItems**: Task tracking with status (todo, doing, blocked, done) and due dates
- **GoalPeriods**: Time-based goal tracking

### Path Aliases
- `@/*` → `./client/src/*` (client code)
- `@shared/*` → `./shared/*` (shared types and schema)
- `@assets` → `./attached_assets` (static assets)

## External Dependencies

### Database
- **PostgreSQL**: Primary database, configured via `DATABASE_URL` environment variable
- **pg**: Node.js PostgreSQL client for database connections

### UI Framework
- **Radix UI**: Full suite of accessible, unstyled primitives (dialog, dropdown, tabs, etc.)
- **Tailwind CSS**: Utility-first CSS framework with custom theme configuration
- **class-variance-authority**: Component variant management for shadcn/ui

### Rich Text Editing
- **TipTap**: Headless editor framework with extensions for:
  - StarterKit (basic formatting)
  - Mention (@ mentions for objects)
  - TaskList/TaskItem (checkbox lists)
  - Link (hyperlinks)
  - Placeholder
  - CodeBlockLowlight (syntax highlighting)

### Development Tools
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server-side bundling
- **drizzle-kit**: Database migration tooling
- **TypeScript**: Type checking across client, server, and shared code

### Replit-Specific
- `@replit/vite-plugin-runtime-error-modal`: Error overlay in development
- `@replit/vite-plugin-cartographer`: Development tooling
- `@replit/vite-plugin-dev-banner`: Development environment indicator