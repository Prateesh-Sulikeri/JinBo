---
slug: redditorials
name: Redditorials
tagline: Reddit Story Fetcher
status: archived
type: personal
category: backend
started: 2024-10          # "late 2024"
featured: false
rank: 5
role: Backend developer
team_size: 1
stack: [Python, FastAPI, PRAW]
links:
  github: https://github.com/Prateesh-Sulikeri/Redditorials
  project_page: https://prateesh-sulikeri-portfolio.vercel.app/projects/redditorials
---

# Overview

A small FastAPI service from late 2024 that pulls story-style Reddit posts sorted into trending, popular and underrated buckets. It was meant to be stage one of a content pipeline (fetch, summarise, narrate with TTS, then automatically cut short videos for YouTube and TikTok). Only stage one was built.

He keeps it on his portfolio on purpose, as an honest example of a script promoted to a web API without being redesigned for it. The diagnosis is more useful than a polished description.

# What it does

There's one endpoint, `GET /subreddits?keyword=`. It finds subreddits related to the topic using Reddit's public `subreddits/search.json` (no credentials needed), then pulls five self-posts each from the subreddit's top (trending), hot (popular) and new (underrated) lists, using authenticated PRAW. Each result has a title, score, URL and body. A 403 from PRAW is treated as a private or restricted subreddit rather than a broken request.

# What went wrong

- **The blocking bug:** the subreddit selector prints a list and calls `input()` inside an HTTP handler. Under Uvicorn there's no terminal, so the request blocks on input nobody can type. It worked in a shell, which is how it was written. The fix would be a second query parameter, or splitting it into "list candidates" and "fetch from this one".
- **A broken import:** `app/__init__.py` imports a `main` module that doesn't exist.
- **The README overclaims:** it describes a layout, a `tests/` directory and caching that the code doesn't have. There's no caching, no rate-limit backoff and no content filtering beyond self-posts.
- **Credentials in source:** credentials were module-level constants in `config.py`. They were scrubbed before publishing, but it's the wrong habit.

# Why it stopped

The AI stages (summarisation, narration, video) were the real point. The input stage was the least interesting part, and its API design was already wrong, so continuing meant tearing out the foundation.

# What's worth keeping

- The top/hot/new split as a way to see one subreddit at three ages.
- Treating PRAW's 403 as a signal about privacy rather than a generic error.
