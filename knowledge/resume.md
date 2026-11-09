---
title: Résumé
updated: 2026-11-09
sources: [résumé PDF, portfolio /about, intake]
---

# Experience

## Xoriant Technologies, Software Engineer (April 2024 – present)

Pune, India · hybrid · client: CLS Bank · domain: FX trade message processing for a high-volume foreign-exchange settlement platform used by global financial institutions.

He joined as an Associate Software Engineer (G1) in April 2024 and was promoted to Software Engineer (G2) in 2026. He builds and maintains components within an existing platform. He did not design the overall CLS architecture.

Day to day he implements new features, fixes defects, writes unit and component tests, makes performance improvements, and applies AI to improve the team's engineering workflow. He works with business analysts, test teams and customers on requirements, production issues and releases.

Work stack: Java (17, 21), Spring Boot, Spring Batch, Hibernate/JPA, Kafka, IBM MQ, PostgreSQL, Redis, C++ (legacy components), Python, Docker, Linux, Git, Gradle, Jenkins, JUnit, Mockito.

### Same-day FX settlement

He built a multi-session, environment-specific trade validation engine with shared core logic. It enabled same-day FX settlement and eliminated the previous 24-hour settlement wait for 6 members across 8 currencies.

### FX message APIs

He designed and maintained 15+ Spring Boot REST APIs for FX trade message routing, validation, auditing and notifications. He also supported onboarding of new FX message standards through reusable validation workflows and session-specific processing logic.

### Point-in-Time Recovery (PITR)

He engineered PITR components that checkpoint and replay unprocessed trade messages after processing failures. The workflow covers snapshots of component, environment and database state, fallback recovery paths, cleanup, state restoration, message replay, and validation before trade inputs are re-enabled. He also implemented possible-duplicate detection and transaction rollback, which prevent double execution of trades during recovery.

### Test-harness modernisation

He migrated a legacy Perl testing harness to Python and added agentic-AI-assisted test-case generation while preserving existing coverage. This cut full build execution time from 4 hours to under 2.5 hours.

### Multi-agent SonarQube remediation

He developed multi-agent orchestration with iterative evaluation loops to analyse and remediate 1,000+ repository-wide SonarQube findings.

The hard part was the verification loops, not the code generation. Generating code with AI is the easy part, and orchestrating the agents is an architecture problem that gets simple once the use case is clear. Making it trustworthy took more: token-efficient agent loops that check and correct their own mistakes, a clean "third-eye" evaluator that judges results independently, and checks that the output was safe for FX use and followed secure-coding practices. Evaluations that involve both AI and humans only get good through iterative improvement.

### Team AI enablement

He led the team-wide AI agent harness setup, documentation and knowledge base, enabling secure AI-assisted engineering across a 7-engineer team. He also automated AI-assisted memory-leak report generation and remediation planning. This is technical enablement, not people management: he has no direct reports.

### Recognition at Xoriant

- **Xor Champ Award (2025 and 2026):** for outstanding delivery, client appreciation and exceeding performance expectations.
- **Xor Learner Award (2024):** for exceptional learning initiative and technical growth.
- **Client appreciation:** received in November 2026.

## Persistent Systems, Software Engineering Intern (June 2023 – August 2023)

Pune, India. He built internal engineering tools to simplify distributed log analysis.

- Prototyped Python data pipelines with AI-assisted log analysis.
- Surfaced investigation results through a React dashboard using AG Grid.
- Optimised 20+ SQL queries to speed up dashboard query execution.
- Automated repetitive operational tasks with Python and shell scripts.

He left after receiving a full-time offer from Xoriant.

# Education

## B.E. Computer Science and Engineering (August 2020 – May 2024)

KLE College of Engineering and Technology (also known as KLE Dr. M.S. Sheshgiri College of Engineering and Technology), Belagavi, Karnataka. CGPA 8.7/10.

- **Final-year project:** "Survey of Machine Learning Algorithms for Rainfall Prediction".
- **Coding Club:** the first Club Head of the KLE Coding Club. He organised several inter-college, district-level hackathons and gaming competitions.

He doesn't share school marks. Only the degree and CGPA are shared.

# Certifications

- Oracle Certified Java SE 8 Developer Associate (1Z0-808), Oracle
- Oracle Cloud & AI Platforms Associate Engineer, Oracle
- DeepLearning.AI: Generative AI, LangChain, Prompt Engineering, ChatGPT Apps. A hands-on specialisation in LLM workflows, RAG pipelines and generative-AI integrations.
- In progress: Claude Code Developer Foundations Certificate

# Skills

Levels are honest so the bot never oversells him.

## Core: professional, used daily

- **Languages:** Java (17, 21)
- **Frameworks:** Spring Boot, Spring Batch, Hibernate/JPA
- **Messaging:** Kafka, IBM MQ
- **Databases:** PostgreSQL, Redis
- **Testing:** JUnit, Mockito
- **Tooling:** Docker, Linux, Git, Gradle, Jenkins
- **Domain:** payment processing, FX trade processing, event-driven architecture

## Also uses

- **Python:** professional at Xoriant and in his internship.
- **C++:** professional, on legacy components.
- **SQL:** professional.
- **Rust and Tauri 2:** used in Onsite. Not a primary professional language.
- **React:** internship and side projects. Also Astro.
- **Others:** MongoDB, Resilience4j, Zipkin, Prometheus, GMock.
- **GitHub Actions:** CI for Onsite.

## Comfortable with, but not professional production experience

- AWS: EC2, S3, Lambda, ECS, EKS, SQS, SNS, DynamoDB
- Kubernetes

Never describe either as professional production ownership.

## Applied AI (primary specialisation)

| Level | Areas |
|---|---|
| Advanced | LLM API integration, multi-provider LLM architectures, AI-powered application development |
| Intermediate–advanced | Agentic AI, multi-agent orchestration, prompt engineering, tool integration, MCP, Voice AI |
| Intermediate | LLM evaluation, deterministic evaluation frameworks, AI-assisted automation and workflow orchestration |
| Beginner–intermediate | RAG and knowledge retrieval. JinBo 2.0 is his hands-on RAG build. |
| Beginner / limited | Classic ML, PyTorch, TensorFlow, fine-tuning and LoRA, embeddings and vector databases |

## CS fundamentals

System design, distributed systems, DSA, operating systems, networking, DBMS.

## Currently learning

Claude Code for architecture development, and advanced system design.

## Not to claim

Angular, Go, Kubernetes or AWS in professional production, advanced RAG, model fine-tuning, PyTorch or TensorFlow proficiency.

## Soft skills

Mentoring, writing technical documentation, leading technical initiatives (e.g. the team AI harness rollout), and client communication (working with CLS stakeholders, BAs and test teams).

## Tools and setup

Claude Code, ChatGPT, Ollama (DeepSeek-R1, Gemma), WSL, WezTerm, Docker, Vercel, Zed.
