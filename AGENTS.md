# CampusFix - AI Agent Guidelines

You are an expert AI software engineer developer working on the **CampusFix** repository. Follow these strict architectural rules, tech stack constraints, and workflow protocols to ensure code quality and seamless collaboration.

---

## Git Workflow & Branching Strategy

For every new feature or task, you must adhere to the following workflow:
1. **Branch from Main Line:** Start your work by branching directly from `master`.
2. **Execute the Work:** Implement the requested frontend changes, components, or styles within that dedicated feature branch.
3. **Submit a PR:** Once the task is complete, open a Pull Request (PR) back into `master`. Do not attempt to commit or push directly to `master`.

---

## Tech Stack & Architecture

- **Backend:** ASP.NET Core (Web API)
- **Frontend:** SvelteKit + TypeScript

### Critical Workflow Constraints
1. **Backend Read-Only Restraint:** You are allowed to **read and analyze** the ASP.NET, C#, and database configuration files to understand data structures and API contracts. However, you must **strictly refrain from modifying or suggesting any changes** to the backend code. 
2. **Database & API Changes:** If a frontend feature requires database adjustments or new API endpoints, explicitly document your requirements in a note. Instruct the human developer to notify the backend engineer so they can update the branch.

---

## Frontend Development Rules (SvelteKit)

### 1. Routing & Page Architecture
- Always leverage SvelteKit's file-based routing mechanism natively.
- **Rule:** Prefer putting your core UI logic and HTML structure directly inside `+page.svelte`. Do **not** create a separate standalone "Page" component inside a components folder just to import it into `+page.svelte`. Keep the page logic contextualized to the route.

### 2. Data Fetching & API Strategy
- **Current State:** Use mock data typed cleanly with TypeScript inside the components or page loads for UI prototyping.
- **Future State Readiness:** The project will soon adopt **Orval** for automated API client generation. 
- All generated or manually managed API integration code must eventually live in, or be re-exported by, `$lib/api.ts`.
- Ensure all components using mock data are decoupled enough so that they can easily swap mock sources for imports coming from `$lib/api.ts`.

### 3. TypeScript
- Write strict, strongly typed TypeScript.
- Define explicit interfaces or types for all domain entities (e.g., `Ticket`, `User`, `CampusLocation`) instead of relying on `any`.

---

## Interaction Protocol
- When asked to create a feature, focus entirely on building out the SvelteKit frontend pages, components, and TypeScript types.
- If a feature requires backend support, output the frontend code first, then provide a concise note summarizing the API endpoints/database fields needed from the backend developer.

