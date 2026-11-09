---
slug: scalecraft
name: ScaleCraft
tagline: Interactive System Design Lab
status: live              # alpha, maintained
type: personal product
category: full-stack
featured: true
rank: 3
role: Full-stack developer and product designer
team_size: 1
stack: [Next.js 16, TypeScript, Zod, React Flow, Clerk, Neon Postgres, Drizzle, Dexie/IndexedDB, Playwright]
links:
  live: https://scale-craft.in/
  github: https://github.com/Prateesh-Sulikeri/ScaleCraft
  project_page: https://prateesh-sulikeri-portfolio.vercel.app/projects/scalecraft
---

# Overview

ScaleCraft is an interactive lab for learning how real systems are built, not another quiz app. You drag components (load balancers, databases, caches, message queues, CDNs) onto a canvas, wire them together, and ScaleCraft tells you in plain architectural language whether the design holds up and why. It's designed as a companion to the System Design Textbook Prateesh is writing, not a replacement for it.

# Why he built it

He wanted to practise system design, not just read about it, and the tool he wanted didn't exist.

# One component model, three modes

There are 27 built-in components across six categories: networking, compute, data, caching, messaging and distributed systems. Each component is defined once (inputs, outputs, a Zod config schema, legal connections and documentation) and reused in every exercise.

- **Building Blocks:** short chapters that each isolate one concept. A chapter offers only the relevant components and enables only the validation rules it has already taught, so you can't solve a lesson by accident.
- **Real World Extraction:** open-ended problems with many valid architectures. Validation looks for failure modes instead of matching one pattern, using the full rule registry.
- **Sandbox:** no objectives or constraints, and the full component library.

# Validate and Submit do different jobs

**Validate** is a structural check with 10 rules. Examples: a client talking directly to a database, a load balancer with only one instance behind it, a queue with no dead-letter queue, orphaned components, cycles in the request flow, per-component connection contracts, and the chapter's required components being present and connected. Violations come back with architectural reasoning, not just "invalid".

**Submit** runs the structural check first and stops if it fails. If the structure passes, it matches the graph against the chapter's blueprints: the required pattern must be present and no forbidden pattern may appear. If nothing matches, you get a **drift report**: what's missing, what's extraneous for that approach, and which connections don't hold. The two outcomes are never mixed on one screen.

Hints are opt-in. A lightweight simulation animates a request token along the request-flow edges. It's qualitative only, with no latency or throughput modelling.

# Deep Check: bring your own model

Deep Check is an optional AI critique of the whole graph. You bring your own key for Anthropic, OpenAI, Google, xAI or any OpenAI-compatible endpoint, so the project has no inference bill and holds no key of its own. The prompt is a pure function of its inputs, so it's testable like the rules. A structural "spoiler gate" keeps the blueprints out of the payload until you've passed the chapter, so the model can't leak the answer.

# Local-first, then synced

ScaleCraft is a single Next.js 16 app with no separate backend service. The canvas (React Flow) and the validation engine run in the browser against an in-memory graph. Route handlers are used only for auth (Clerk) and for syncing to Postgres (Neon, via Drizzle).

- **Storage:** Dexie/IndexedDB is the primary store for in-progress work. Cloud tables mirror it per user, with last-write-wins across devices.
- **A sync bug he fixed:** saves used to go through the domain graph type, which has no zones, comments or start markers, so restoring on another device dropped those annotations. Saves now store the raw canvas state.
- **Content as code:** chapters, components and rules are versioned TypeScript in the repo and reviewed like code. Tests enforce authoring rules, so a chapter that references an unavailable component fails CI.

# Where it actually is

**By the numbers:**
- 20 alpha releases
- about 78,000 lines of TypeScript
- 240 test files plus 8 Playwright end-to-end suites

**Content so far:**
- 24 Building Blocks chapters, covering problem framing and interview technique, networking, DNS, load balancing, API gateways, statelessness, service discovery, databases, SQL vs NoSQL, replication and sharding.
- Knowledge checks and chapter exams: single and multiple choice, ordering, matching, estimation and diagram questions.
- Guided walkthroughs.
- A day streak based on a real per-day activity log.
- In-app bug reports with optional screenshots.

**The honest gap:** Real World Extraction is wired end to end (routes, validation, the full rule registry) but runs on a single placeholder chapter. The shell is proven; the content isn't written yet.

# Design intent

- **Deliberately not gamified:** no points and no decorative animation.
- **Colour carries meaning:** a near-black canvas, with each component category in its own hue and red/amber/green reserved for validation state.
- **Motion only signals state changes.**
- **Single-player by design:** it's a self-paced course, not a shared workspace.
