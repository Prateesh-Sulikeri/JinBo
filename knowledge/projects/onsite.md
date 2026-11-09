---
slug: onsite
name: Onsite
tagline: Practice the interview loop. Out loud.
status: active            # actively maintained, open source
type: personal
category: Applied AI
released: 2026-11-02      # v1.0.0
featured: true
rank: 1
role: Creator, open-source maintainer, lead developer
team_size: 1
stack: [Rust, Tauri 2, SQLite, HTML/CSS/JS, CodeMirror 6, Excalidraw, sherpa-onnx, Supertonic-3, Parakeet TDT v2, Whisper large-v3, GitHub Actions]
links:
  github: https://github.com/Prateesh-Sulikeri/Onsite
  website: https://prateesh-sulikeri.github.io/Onsite/
  project_page: https://prateesh-sulikeri-portfolio.vercel.app/projects/onsite
  video: https://www.youtube.com/watch?v=v9lG6l2rH18
---

# Overview

Onsite is a free, open-source, local-first desktop app for practising full software-engineering interview loops out loud. A spoken AI interviewer runs résumé screening, coding (DSA), system design, low-level design, project deep-dive and behavioural rounds, asks follow-up questions, and gives honest rubric-based feedback at the end. Version 1.0.0 shipped on 2 November 2026. It's his main open-source project.

# Why he built it

Most mock-interview tools are typed, paid or hosted. Onsite is spoken, free and local. Speech never leaves the user's machine, nobody sells the data or trains models on it, and progress tracking is local with no gamification. Users bring their own AI provider, so it runs on free tiers or subscriptions they already have.

# Features

## Interview loops

- **Whole loops:** timed end-to-end rounds, e.g. résumé screen → coding → project deep-dive → system design.
- **Company loops:** name a company, role and level, and Onsite builds a "dossier" from recent public candidate reports. The loop then follows that company's reported rounds, questions and interviewer style.
- **Answer modes:** spoken, listen-and-type (the interviewer speaks, you type), or fully typed. If voice fails, the round falls back to typing.

## Workspace

- **Editor and whiteboard:** a code editor with Run and Submit in Java, Python, C++ and JavaScript, plus a whiteboard and notes. The interviewer sees what you share.
- **Code-comprehension round:** read a small multi-file project with planted bugs and explain what's wrong. The AI generates the project from a job description, or you pick one of 6 ready-made fintech scenarios: checkout retries (idempotency), a Kafka consumer (offsets), a Postgres outbox (transactional consistency), a Redis token bucket (rate limiting), wallet transfers (float precision, lost updates, deadlocks), and a webhook receiver (signatures, replay protection).

## Feedback and résumé check

- **Feedback:** rubric scores from 1 to 4 with evidence, a "fix this first" item, and stronger example answers for key moments. A full loop ends with a hiring-committee verdict and a practice plan.
- **Résumé check:** simulates 6 ATS products, scores the match against a job posting, and runs an AI screen graded A–D.

# Architecture

## Core and security

- **App shell:** a Tauri 2 desktop app with a Rust core. The UI is plain HTML, CSS and JS in the system WebView, with no framework. Storage is a single SQLite file.
- **Locked-down UI:** the UI's content security policy allows only the app itself, so the UI can't reach the network and holds no secrets or important logic. UI actions are thin Tauri commands.

## AI layer

- **The "brain" module:** one module hides which AI provider is in use. It makes plain HTTP calls and uses no provider SDKs.
- **Five providers:** Claude, OpenAI/ChatGPT, Gemini, GroqCloud and Ollama. Claude works through either the API or Claude Code.
- **Claude Code mode:** each round starts a fresh `claude -p` process in an empty temp directory with every tool disabled, so the interviewer can only talk. If Claude Code is only installed in WSL, Onsite runs it through `wsl.exe`.
- **The interviewer is a prompt file:** `prompts/interviewer.md`, not code. It speaks 1–4 sentences with one question per turn, gives no feedback mid-round, varies its opener (recent ones are marked "don't reuse"), and emits `[[END]]` when time is up.

## The spoken turn (hot path)

1. Mic audio is captured and down-sampled to 16 kHz mono.
2. Energy-based voice activity detection learns the room's noise floor.
3. Long answers are cut at short pauses, so decoding starts while the user is still talking.
4. Parakeet produces live captions. Whisper's transcript takes precedence when available.
5. The transcript is cleaned up: repeated phrases are collapsed and technical terms are corrected against a vocabulary.
6. The interviewer receives the answer plus workspace changes, the latest code run and elapsed time.
7. The reply is split into sentences. Code goes to the workspace instead of being spoken.
8. Streaming TTS generates the next audio chunk while the current one plays.
9. When playback ends, the mic reopens.

## Voice tuning

- **Pause cuts:** segments under 3 s are never cut. From 3 to 20 s they're cut at a 700 ms pause; past 20 s, at a 300 ms pause.
- **Live captions:** re-decoded every 500 ms, using at most half the CPU.
- **Faster first audio:** splitting long sentences near a comma cut first-audio latency on a long reply from 2.5 s to 1.8 s.
- **No echo cancellation yet:** the mic stays closed while the interviewer speaks. Tapping the mic orb interrupts.

## Voice engines

- **Built in:** Supertonic-3 for speech (the default since v0.7.0) and Parakeet TDT v2 int8 for listening. Both run on CPU through sherpa-onnx. Models are pinned release assets, verified by size and SHA-256.
- **Optional VoiceStudio** (127.0.0.1:3900): renders a sample line for each interviewer persona, scores the takes and clones the best one, so each persona keeps one stable voice.
- **Optional Whisper large-v3** sidecar on a CUDA GPU, which gets terms like "Redis" and "idempotency key" right.

## Coding rounds

The problem bank has 81 problems: Blind 75 plus 20 originals. Each problem is structured data: test cases, progressive hints, follow-up questions, a Python reference solution and a stress-test generator. The model only chooses the problem. Run executes the example tests. Submit runs the example, hidden and randomly generated stress tests against the reference solution, so grading is deterministic and repeatable. Results go to the interviewer with the next answer so follow-ups can address failures.

The whiteboard is converted to structured text (shapes, containment, labelled arrows), so the model reasons about text, not an image.

# Engineering principles

1. The interviewer never gets tools.
2. Model output is data, never executable code.
3. Bring your own AI, and every feature works on every provider.
4. Speech is local and never a dead end. There's always a usable fallback.
5. Only one live round runs at a time.
6. Prompts are content, not code.

# Hardest challenges

1. **Making a spoken turn feel fast:** pause-based cuts, a CPU cap on live captions, and sentence-streamed TTS. The trade-off is a shared CPU.
2. **Two voices, one microphone:** with no echo cancellation, the mic closes while the interviewer speaks and reopens when playback ends, and tapping the orb interrupts. The trade-off is that you can't talk over the interviewer.
3. **Keeping the AI in a box:** candidate answers, pasted code, résumés and job descriptions are all untrusted text. Neither the interviewer nor the report model gets tools, Claude Code runs without tools in a fresh process each round, model output is treated as data, the UI's CSP blocks the network, and there are no accounts or analytics. Updates are only checked when the user clicks Check. If the model can't call tools, prompt injection can only change what it says.
4. **Grading that doesn't depend on the model:** tests are data, Submit grades against reference solutions, the whiteboard becomes text, and a report needs at least 2 answers and 40 words of evidence. Research progress comes only from real tool calls.
5. **Validating AI-written exercises:** 2–5 source files, safe paths and size limits, 2–4 planted issues tied to real line numbers, no giveaway comments, and one regeneration on failure. Generated projects aren't compiled yet, and users are told this before the round.
6. **Failure handling:** if voice fails, the round switches to typing. If the AI process dies, the next answer resumes the session. A corrupt model download is caught by its hash. Too little evidence means no report.

# Trade-offs

| Decision | Chosen over | Why |
|---|---|---|
| Local CPU speech | Cloud speech APIs | Speech never leaves the machine |
| Optional Whisper on GPU | Parakeet only | Better accuracy on technical terms |
| Tests as data | Model-written tests | Deterministic grading |
| Whiteboard as text | Sending images | No image interpretation needed |
| Mic closed while the interviewer speaks | Always-open mic | No echo cancellation yet |
| Prompts in files | Prompt strings in code | Prompts are content |
| One brain module over plain HTTP | An SDK per provider | Every feature works on every provider |

# Results

- About 200 downloads so far (100+ in the first 24 hours).
- 300+ feedback forms submitted.
- About 1,000+ website visits with almost no marketing.

# What he learned

- **What went well:** one CI pipeline builds Windows, macOS and Linux in parallel, and a release only publishes when all three pass. Treating model output as data made the system much easier to reason about.
- **What he'd change:** add echo cancellation so the mic can stay open and users can interrupt naturally, and compile and run generated comprehension projects so every planted bug is real.

# Known limitations

- No echo cancellation yet.
- Generated comprehension projects aren't compiled.
- Installers are unsigned.
- Windows is the main tested platform. The macOS and Linux builds are newer and less tested.
- Whisper needs a CUDA GPU.
- The first-run model download is large.
- Only 6 comprehension scenarios so far.

# Roadmap

- More comprehension scenarios.
- A blog post on the Claude Code setup.
- Episode 3 of the video series, a 60-second tour.
- Code signing through the SignPath Foundation (applied for).
- Echo cancellation.
- Validation that compiles generated projects.
- Better macOS and Linux testing.

# His role

He built all of it as a solo developer:

- the Rust core (interview loops, rounds, reports, storage)
- the provider-agnostic AI layer
- the local voice pipeline
- the coding rounds, with runners for Python, JavaScript, Java and C++
- the company-dossier research
- the résumé check
- release engineering: GitHub Actions builds for 3 platforms, with stable and experimental channels
- the docs site and demo videos
