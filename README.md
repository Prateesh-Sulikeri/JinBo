# JinBo 2.0

Prateesh's portfolio assistant, rebuilt in Python. It answers from retrieved sources with citations, streams replies, uses tools, and falls back to retrieval-only and then rule-based answers when the LLM is down.

The original Express version (v1) is kept in [`legacy/`](legacy/) for reference while porting. `main` still holds the live v1 until v2 ships.

## Setup

Needs [uv](https://docs.astral.sh/uv/). uv installs Python 3.12 itself if you don't have it.

```bash
make install   # uv sync: creates .venv and installs everything
make check     # ruff + pyright + pytest
uv run jinbo   # CLI entry point
```

## Layout

```
knowledge/   source files for the knowledge base (Phase 1)
src/jinbo/   the app: kb, rag, llm, tools, fallback, safety
tests/       pytest
evals/       golden Q&A set (Phase 5+)
web/         chat widget (Phase 9)
legacy/      JinBo v1 (Node/Express)
```
