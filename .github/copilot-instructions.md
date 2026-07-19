# GitHub Copilot Instructions

This repository contains a permanent AI Knowledge Base.

Before performing any task:

You MUST load the project knowledge context.

Required reading order:

1. .ai-memory/START_HERE.md
2. .ai-memory/AI_CONTEXT.md
3. .ai-memory/CURRENT_STATE.md
   Then identify and read only the relevant Feature and Module documentation.
   Do not start implementation before understanding the related documentation.
4. Read all relevant markdown files.
5. Understand the project before reading the source code.
6. After every implementation update all affected documentation.
   Never leave the Knowledge Base outdated.

Documentation is part of the implementation.

# AI Maintenance Policy

This document is part of the project source code.

Every AI assistant MUST follow these rules.

Before changing code:

1. Read START_HERE.md
2. Read AI_CONTEXT.md
3. Read CURRENT_STATE.md
4. Read every related markdown document.
5. Understand the architecture.
6. Understand the business rules.
7. Understand dependencies.
   After changing code:

8. Update every affected markdown file.
9. Update CURRENT_STATE.md when needed.
10. Update CHANGELOG.md.
11. Update TODO.md.
12. Update BUGS.md if necessary.
13. Update MODULE_INDEX.md if new modules are added.
14. Create documentation for every newly created module.
15. Archive documentation for removed modules.
16. Keep every document synchronized with the implementation.
    A task is NOT complete until documentation is synchronized.

Documentation has the same priority as the source code.
