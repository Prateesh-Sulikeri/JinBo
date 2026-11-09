---
slug: jinbo
name: JinBo
tagline: AI Portfolio Assistant
status: live              # v1 live; v2 (Python) in progress
type: personal
category: backend / Applied AI
featured: true
rank: 4
role: Backend developer
team_size: 1
stack: [Express, Groq, Llama]          # v1. v2: Python, FastAPI, SQLite (sqlite-vec + FTS5), fastembed, Groq
links:
  github: https://github.com/Prateesh-Sulikeri/JinBo
  live: https://jinbo.onrender.com/
  project_page: https://prateesh-sulikeri-portfolio.vercel.app/projects/jinbo
---

# Overview

JinBo is the assistant behind the chat widget on Prateesh's portfolio, the bot answering right now. The name comes from his online handle, TheJinxxedBot: JinBo is "JinxxedBot's personal bot". Its design question is: what should a portfolio chatbot do when its model is unavailable? The answer: keep answering.

# Version 1 (Express)

v1 is a small, stateless Express service of about 640 lines in one main file.

## Two engines, one endpoint

`POST /api/chat` always computes a deterministic answer first. A tiered cascade of regex intent matchers classifies the message, and a fixed table supplies the response. Only then does it try the AI path, which overwrites the answer if Groq returns one. The rule engine is the default and generative output is the upgrade. A missing API key, a Groq error, a timeout or a post-rate-limit cooldown all silently fall back to keyword matching. Every response carries `source: ai | rule-based`, so degraded mode is observable.

## Model settings

Groq's llama-3.1-8b-instant, temperature 0.4, 400 max tokens, an 8 s timeout and no retries, because a slow answer is worse than a fast fallback.

## Not RAG

v1 compiles a JSON knowledge base into one grounding system prompt at boot, with no per-query retrieval.

## Stateless history

The client sends the conversation history. The server keeps the last 6 turns, truncates each to 500 characters, and drops any role that isn't `user` or `assistant`, so a client can't inject a system message.

## Prompt injection

The prompt told the model never to reveal itself, but in testing the 8B model printed its system prompt verbatim. So a code-level regex now catches known injection phrasings before they reach Groq and routes them to the rule engine, which is a fixed lookup table with nothing to leak. The blocklist isn't complete, and he says so.

## Free-tier protection

v1 runs on Render's free tier with Groq's free tier, so the risk is exhausting the quota, not load. It has:

- a limit of 20 requests per minute per IP on `/api/chat`
- a 500-character message cap
- a 5-minute circuit breaker after a Groq 429

`/health` is unlimited because the widget pings it every 30 s.

## What he'd change

The regex intent cascade is the weak point. Every new intent risks shadowing another, and it carries more complexity than a fallback deserves. That's why v2 exists.

# Version 2 (Python rebuild, in progress)

v2 is a from-scratch Python rebuild that he's using to deepen his Applied AI skills. It's a learning project: he writes the code, with Claude Code as a teacher and reviewer. Planned design:

- **API:** FastAPI with streaming replies over server-sent events.
- **Retrieval:** hybrid RAG over a Markdown/YAML knowledge base, combining SQLite FTS5 keyword search and sqlite-vec vector search merged with reciprocal rank fusion, local fastembed embeddings, and answers that cite their sources.
- **Tools:** for showing projects and sharing contact details.
- **Fallback ladder:** LLM, then retrieval-only, then rule-based. The bot never goes fully down.
- **Model:** Groq's GPT-OSS 120B.
- **Safety:** a token-bucket rate limiter, a circuit breaker, and layered prompt-injection defences.
- **Quality:** pytest plus an eval set that scores answer quality on every change.
