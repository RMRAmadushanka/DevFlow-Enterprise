import type { DocumentTemplate, DocumentTemplateCategory } from "../types/document.types";

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

const TEMPLATES: DocumentTemplate[] = [
  {
    id: "tpl_eng",
    name: "Engineering Spec",
    description: "Structured technical specification for features and systems.",
    category: "engineering",
    icon: "🛠",
    tags: ["engineering", "spec"],
    contentHtml:
      "<h1>Engineering Spec</h1><h2>Overview</h2><p></p><h2>Requirements</h2><ul><li></li></ul><h2>Technical design</h2><p></p>",
    contentMarkdown:
      "# Engineering Spec\n\n## Overview\n\n## Requirements\n\n- \n\n## Technical design\n",
  },
  {
    id: "tpl_meeting",
    name: "Meeting Notes",
    description: "Capture agenda, decisions, and action items.",
    category: "meeting_notes",
    icon: "📝",
    tags: ["meeting"],
    contentHtml:
      "<h1>Meeting Notes</h1><h2>Attendees</h2><p></p><h2>Agenda</h2><ul><li></li></ul><h2>Decisions</h2><ul><li></li></ul><h2>Action items</h2><ul><li></li></ul>",
    contentMarkdown:
      "# Meeting Notes\n\n## Attendees\n\n## Agenda\n\n- \n\n## Decisions\n\n- \n\n## Action items\n\n- \n",
  },
  {
    id: "tpl_arch",
    name: "Architecture Decision",
    description: "Document architectural context, options, and decision.",
    category: "architecture",
    icon: "📐",
    tags: ["architecture", "adr"],
    contentHtml:
      "<h1>Architecture Decision Record</h1><h2>Context</h2><p></p><h2>Options</h2><p></p><h2>Decision</h2><p></p><h2>Consequences</h2><p></p>",
    contentMarkdown:
      "# Architecture Decision Record\n\n## Context\n\n## Options\n\n## Decision\n\n## Consequences\n",
  },
  {
    id: "tpl_rfc",
    name: "RFC",
    description: "Request for comments on a proposed change.",
    category: "rfc",
    icon: "💡",
    tags: ["rfc"],
    contentHtml:
      "<h1>RFC</h1><h2>Summary</h2><p></p><h2>Motivation</h2><p></p><h2>Detailed design</h2><p></p><h2>Drawbacks</h2><p></p>",
    contentMarkdown:
      "# RFC\n\n## Summary\n\n## Motivation\n\n## Detailed design\n\n## Drawbacks\n",
  },
  {
    id: "tpl_sprint_review",
    name: "Sprint Review",
    description: "Summarize completed work and demo notes.",
    category: "sprint_review",
    icon: "📘",
    tags: ["sprint", "review"],
    contentHtml:
      "<h1>Sprint Review</h1><h2>Completed work</h2><ul><li></li></ul><h2>Demo notes</h2><p></p><h2>Feedback</h2><p></p>",
    contentMarkdown:
      "# Sprint Review\n\n## Completed work\n\n- \n\n## Demo notes\n\n## Feedback\n",
  },
  {
    id: "tpl_retro",
    name: "Retrospective",
    description: "Went well, improve, and action items.",
    category: "retrospective",
    icon: "🧪",
    tags: ["retro"],
    contentHtml:
      "<h1>Retrospective</h1><h2>Went well</h2><ul><li></li></ul><h2>To improve</h2><ul><li></li></ul><h2>Actions</h2><ul><li></li></ul>",
    contentMarkdown:
      "# Retrospective\n\n## Went well\n\n- \n\n## To improve\n\n- \n\n## Actions\n\n- \n",
  },
  {
    id: "tpl_api",
    name: "API Documentation",
    description: "Describe endpoints, auth, and examples.",
    category: "api_documentation",
    icon: "📄",
    tags: ["api", "docs"],
    contentHtml:
      "<h1>API Documentation</h1><h2>Overview</h2><p></p><h2>Authentication</h2><p></p><h2>Endpoints</h2><pre><code>GET /resource</code></pre>",
    contentMarkdown:
      "# API Documentation\n\n## Overview\n\n## Authentication\n\n## Endpoints\n\n```\nGET /resource\n```\n",
  },
  {
    id: "tpl_proposal",
    name: "Project Proposal",
    description: "Pitch scope, timeline, and success metrics.",
    category: "project_proposal",
    icon: "🗂",
    tags: ["proposal"],
    contentHtml:
      "<h1>Project Proposal</h1><h2>Problem</h2><p></p><h2>Proposed solution</h2><p></p><h2>Timeline</h2><p></p><h2>Success metrics</h2><ul><li></li></ul>",
    contentMarkdown:
      "# Project Proposal\n\n## Problem\n\n## Proposed solution\n\n## Timeline\n\n## Success metrics\n\n- \n",
  },
];

export const templateService = {
  async list(category?: DocumentTemplateCategory | "all" | null): Promise<DocumentTemplate[]> {
    await delay();
    if (!category || category === "all") return [...TEMPLATES];
    return TEMPLATES.filter((t) => t.category === category);
  },

  async getById(id: string): Promise<DocumentTemplate | undefined> {
    await delay(120);
    return TEMPLATES.find((t) => t.id === id);
  },
};
