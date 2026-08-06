# Document & Knowledge Management

Frontend feature module for enterprise documentation in DevFlow — Notion /
Confluence / GitBook–style knowledge base UI with folders, rich editing,
comments, version history, sharing, and templates.

**Scope.** UI + mock services only — no Documents backend API.

## Architecture

```
Page (app/(dashboard)/documents | projects/:id/documents)
  → DocumentsView / DocumentDetailShell / DocumentForm / TemplateGallery
    → Hooks (TanStack Query)
      → document.service.ts / comment.service.ts / template.service.ts
      → useDocumentStore (filters, view mode, sidebar, editor mode, tree expand)
```

Components never call services directly. Pages import from `@/features/documents`.

Permissions: `document.read|create|update|delete`.

## Routes

| Route | Purpose |
|-------|---------|
| `/documents` | Knowledge Base list |
| `/documents/new` | Create document |
| `/documents/:documentId` | Detail (content / comments / history / analytics / permissions) |
| `/documents/:documentId/edit` | Edit metadata + content |
| `/documents/templates` | Template gallery |
| `/documents/favorites` | Favorited documents |
| `/documents/recent` | Recently opened |
| `/documents/shared` | Shared with me / workspace shares |
| `/projects/:projectId/documents` | Project-scoped list |

## Document lifecycle

1. **Create** — blank or from template; set folder, tags, visibility, icon/cover  
2. **Edit** — TipTap rich text or Markdown (split/preview); autosave indicator (UI)  
3. **Collaborate** — comments with replies, resolve, mentions/emoji UI hooks  
4. **Share** — private / workspace / restricted / public link (UI); roles owner–viewer  
5. **Version** — history list with restore (+ compare UI affordance)  
6. **Organize** — nested folders/tree, favorites, move, archive, trash  

## Editor features

- **DocumentEditor (TipTap)** — headings, bold/italic/underline/strike, lists, quote,
  code block, table, image placeholder, divider, link, undo/redo, shortcuts  
- **MarkdownEditor** — wraps design-system Markdown editor (edit / preview / split)  
- Toolbar shows word count, reading time, autosave status from store  

## Permissions model

| Role | Access |
|------|--------|
| Owner | Full control |
| Editor | Edit content + comments |
| Commenter | Comment only |
| Viewer | Read only |

Share permission levels: View · Comment · Edit.

## Components (selected)

- Layout: `DocumentLayout`, `DocumentSidebar`, `DocumentTree`, `DocumentBreadcrumb`  
- List: `DocumentCard`, `DocumentTable`, `DocumentGrid`, filters/search/view toggle  
- Detail: `DocumentDetailShell`, `DocumentViewer`, `DocumentPreview`, analytics  
- Collab: `DocumentComments`, `CommentThread`, `DocumentHistory`  
- Modals: share, permissions, move, delete, restore version  
- Templates: `TemplateGallery`, `DocumentTemplateCard`  

## Accessibility

- Icon buttons have `aria-label` / `aria-pressed`  
- Tree expand/collapse keyboard-friendly  
- Editor toolbar buttons labeled; contenteditable / TipTap surface labeled  
- Empty and loading states expose busy/labels  
- Target WCAG AA contrast via design-system tokens  

## Folder

```
src/features/documents/
  components/
  hooks/          # useDocuments, useDocument, CRUD, history, search, …
  services/       # document, comment, template (mock)
  schemas/
  types/
  store/document.store.ts
  constants/
  utils/
  index.ts
```

## Testing strategy

Vitest + React Testing Library under `components/__tests__/`:

- Document list (`DocumentsView`)  
- TipTap editor toolbar (mocked `@tiptap/react`)  
- Markdown editor wrapper  
- Comments, version history, favorites, share, permissions, search  

Mock hooks for unit tests; mock services remain for integration later.
