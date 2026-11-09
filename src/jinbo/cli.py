"""Command-line entry point: `jinbo ...`."""

import argparse
import sys
from collections.abc import Sequence
from pathlib import Path

from jinbo import __version__
from jinbo.kb import DEFAULT_KB_ROOT, KBError, KnowledgeBase, load_kb


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="jinbo", description="JinBo 2.0 portfolio assistant")
    parser.add_argument("--version", action="version", version=f"jinbo {__version__}")
    commands = parser.add_subparsers(dest="command")

    kb = commands.add_parser("kb", help="knowledge base commands")
    kb_commands = kb.add_subparsers(dest="kb_command", required=True)
    check = kb_commands.add_parser("check", help="load and validate knowledge/, print a summary")
    check.add_argument("--path", type=Path, default=DEFAULT_KB_ROOT, help="KB folder")

    args = parser.parse_args(argv)
    if args.command == "kb" and args.kb_command == "check":
        return kb_check(args.path)
    parser.print_help()
    return 0


def kb_check(root: Path) -> int:
    try:
        kb = load_kb(root)
    except KBError as e:
        print(f"FAIL {e}", file=sys.stderr)
        return 1
    print(summarise(kb, root))
    return 0


def summarise(kb: KnowledgeBase, root: Path) -> str:
    p, bot = kb.profile, kb.bot
    job = p.career.current
    featured = sum(1 for proj in kb.projects.values() if proj.meta.featured)
    questions = sum(len(e.questions) for e in kb.faq)
    rows = [
        ("profile.yaml", f"{p.name.display}, {job.title} at {job.company}; {len(p.links)} links"),
        (
            "bot.yaml",
            f"{bot.name} on {bot.model}; {len(bot.greetings)} greetings, "
            f"{len(bot.claim_rules)} claim rules, {len(bot.never_say)} never-say rules",
        ),
        ("faq.yaml", f"{len(kb.faq)} entries, {questions} trigger questions"),
        (
            "projects/",
            f"{len(kb.projects)} projects ({featured} featured): " + ", ".join(kb.projects),
        ),
    ]
    for path, doc in kb.documents.items():
        words = len(doc.body.split())
        rows.append((path, f"{doc.meta.title!r}, {words} words, updated {doc.meta.updated}"))
    if not any(path.startswith("blog/") for path in kb.documents):
        rows.append(("blog/", "no posts yet"))

    width = max(len(name) for name, _ in rows)
    lines = [f"OK  knowledge base at {root}/"]
    lines += [f"  {name.ljust(width)}  {detail}" for name, detail in rows]
    return "\n".join(lines)


if __name__ == "__main__":
    sys.exit(main())
