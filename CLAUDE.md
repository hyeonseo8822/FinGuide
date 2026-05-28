# CLAUDE.md - ELS Project Guidelines

## 1. Project Goal & Requirements
- Target: Build a website explaining ELS (Equity-Linked Securities) structure and risks for high school students and financial beginners.
- Core Core Questions to Address in UI/UX:
  1. What is ELS? (Must include a one-sentence definition for beginners)
  2. How does ELS differ from savings accounts? (Compare principal guarantee, fixed return, depositor protection, risk level, and target audience)
  3. Why can ELS result in a loss of principal? (Explain Knock-In barriers and condition mismatches)
  4. Why is it dangerous to invest based solely on high yields? (Warn about high-risk, high-return trade-offs)

## 2. Design Guide

All visual design decisions (colors, typography, spacing, shapes, components, animations) are governed by **[DESIGN.md](DESIGN.md)**. This file is the single source of truth for the design system.

- Styling engine: **styled-components** + ThemeProvider (see §2.1 below)
- Before implementing any UI component, consult DESIGN.md for the relevant token, component pattern, or animation spec.
- Never override DESIGN.md rules with ad-hoc inline styles or Tailwind classes.

---

## 3. Frontend Development Guidelines

### 3.1 Code Style & Component Rules
- Component: React-based functional components using arrow functions (`const Component = () => {}`).
- Readability: Prioritize text readability (font size, line height, contrast) for beginners.
- Architecture: Separate core sections (Explanation, Comparison Table, Simulator, OX Quiz, Checklist) into independent components.
- Comments: AI must include Korean comments explaining the pedagogical intent behind specific UI/UX or logic choices.

### 3.2 Git Commit Convention
All source code changes must follow the Angular commit message format. AI must suggest commit messages using this convention:
- Format: `type: message` (e.g., `feat: add ELS simulator component`)
- Types:
  - `feat`: New feature or component
  - `fix`: Bug fix
  - `docs`: Documentation change (`CLAUDE.md`, `PLAN.md`, `TROUBLESHOOTING.md`, `DESIGN.md`)
  - `style`: Formatting, CSS, missing semicolons (no code change)
  - `refactor`: Code refactoring without behavioral changes
  - `chore`: Build tasks, package manager configs

### 3.3 Website Structure
- Hero: One-sentence summary of ELS.
- Section 1: Savings vs ELS comparison matrix.
- Section 2: Visual simulator UI for ELS Knock-In barriers and repayment conditions.
- Section 3: High-yield warning and pre-investment checklist.
- Section 4: Interactive OX Quiz or Checklist component for self-assessment.
- Footer: Data sources (Financial Supervisory Service, Korea Exchange, Korea Financial Investment Association).

## 4. AI Collaboration & Verification Rules

### 4.1 Documentation Requirements
- PLAN.md: Define features and UI structure in `PLAN.md` before writing code. Follow the steps sequentially.
- DESIGN.md: Consult for all visual/styling decisions before implementing any component.
- TROUBLESHOOTING.md: Document technical issues, error logs, and AI-driven solutions in real-time.

### 4.2 Output Constraints
- Language and Analogies: When generating complex financial terms, always provide simplified analogies (e.g., school grade cut-offs for Knock-In levels).
- Verification Hook: Summarize potential edge cases, risks, or code segments requiring human review at the bottom of every response.
- Data Integrity: Do not hallucinate financial facts. Rely strictly on verified guidelines from official financial institutions.

## 5. Scripts & Commands
- Dev Server: `npm run dev` / `yarn dev`
- Build: `npm run build`
- Lint: `npm run lint`