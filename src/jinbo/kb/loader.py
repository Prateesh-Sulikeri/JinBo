"""Load knowledge/ into typed objects.

`load_kb()` reads every file, checks it against its Pydantic model and runs cross-file
checks (slugs match filenames, featured projects exist, ids are unique). It collects
*all* problems before failing, so one run of `jinbo kb check` shows everything to fix.
"""

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml
from pydantic import TypeAdapter, ValidationError

from jinbo.kb.models import (
    Bot,
    DocMeta,
    Document,
    FaqEntry,
    KnowledgeBase,
    Profile,
    Project,
    ProjectMeta,
)

DEFAULT_KB_ROOT = Path("knowledge")

# "---\n<yaml>\n---\n<body>". The closing fence may end the file.
_FRONT_MATTER = re.compile(r"\A---\n(.*?)\n---[ \t]*(?:\n|\Z)(.*)\Z", re.DOTALL)


@dataclass(frozen=True)
class Problem:
    path: str  # relative to the KB root
    message: str

    def __str__(self) -> str:
        return f"{self.path}: {self.message}"


class KBError(Exception):
    """The knowledge base has one or more problems. `problems` lists them all."""

    def __init__(self, problems: list[Problem]) -> None:
        self.problems = problems
        lines = "\n".join(f"  - {p}" for p in problems)
        super().__init__(f"knowledge base has {len(problems)} problem(s):\n{lines}")


class _FileError(Exception):
    """Internal: a file could not be read or parsed. Becomes a Problem."""


def load_kb(root: Path = DEFAULT_KB_ROOT) -> KnowledgeBase:
    if not root.is_dir():
        raise KBError([Problem(str(root), "knowledge base folder not found")])

    loader = _Loader(root)
    profile = loader.yaml_file("profile.yaml", TypeAdapter(Profile))
    bot = loader.yaml_file("bot.yaml", TypeAdapter(Bot))
    faq = loader.yaml_file("faq.yaml", TypeAdapter(list[FaqEntry]))
    projects = [
        project
        for path in sorted((root / "projects").glob("*.md"))
        if (project := loader.project(path)) is not None
    ]
    documents = [
        doc
        for path in [root / "resume.md", root / "about.md", *sorted(root.glob("blog/*.md"))]
        if (doc := loader.document(path)) is not None
    ]

    loader.check_unique("faq.yaml", "FAQ id", [e.id for e in faq or []])
    loader.check_unique("projects/", "project rank", [p.meta.rank for p in projects])
    if profile is not None:
        known = {p.meta.slug for p in projects}
        for slug in profile.featured_projects:
            if slug not in known:
                loader.problem("profile.yaml", f"featured_projects: no project with slug {slug!r}")

    if loader.problems:
        raise KBError(loader.problems)
    # No problems means every required file loaded.
    assert profile is not None and bot is not None and faq is not None
    projects.sort(key=lambda p: p.meta.rank)
    return KnowledgeBase(
        profile=profile,
        bot=bot,
        faq=faq,
        projects={p.meta.slug: p for p in projects},
        documents={d.path: d for d in documents},
    )


class _Loader:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.problems: list[Problem] = []

    def problem(self, path: str, message: str) -> None:
        self.problems.append(Problem(path, message))

    def rel(self, path: Path) -> str:
        return path.relative_to(self.root).as_posix()

    def yaml_file[T](self, name: str, adapter: TypeAdapter[T]) -> T | None:
        path = self.root / name
        try:
            data = _parse_yaml(_read(path), name)
        except _FileError as e:
            self.problem(name, str(e))
            return None
        return self.validate(name, adapter, data)

    def project(self, path: Path) -> Project | None:
        rel = self.rel(path)
        parsed = self.markdown(path)
        if parsed is None:
            return None
        meta = self.validate(rel, TypeAdapter(ProjectMeta), parsed[0], prefix="front matter")
        if meta is None:
            return None
        if meta.slug != path.stem:
            self.problem(rel, f"front matter: slug {meta.slug!r} must match the filename")
            return None
        return self.validate(
            rel, TypeAdapter(Project), {"meta": meta, "body": parsed[1], "path": rel}
        )

    def document(self, path: Path) -> Document | None:
        rel = self.rel(path)
        parsed = self.markdown(path)
        if parsed is None:
            return None
        meta = self.validate(rel, TypeAdapter(DocMeta), parsed[0], prefix="front matter")
        if meta is None:
            return None
        return self.validate(
            rel, TypeAdapter(Document), {"meta": meta, "body": parsed[1], "path": rel}
        )

    def markdown(self, path: Path) -> tuple[Any, str] | None:
        rel = self.rel(path)
        try:
            text = _read(path).replace("\r\n", "\n")
            match = _FRONT_MATTER.match(text)
            if match is None:
                raise _FileError(
                    "missing front matter: the file must start with a '---' line "
                    "and the YAML block must end with another '---' line"
                )
            # Line 1 is the opening '---', so YAML line numbers are off by one.
            meta = _parse_yaml(match.group(1), rel, line_offset=1)
        except _FileError as e:
            self.problem(rel, str(e))
            return None
        return meta, match.group(2).strip()

    def validate[T](
        self, rel: str, adapter: TypeAdapter[T], data: Any, prefix: str = ""
    ) -> T | None:
        try:
            return adapter.validate_python(data)
        except ValidationError as e:
            for err in e.errors():
                where = _format_loc(err["loc"], data)
                where = ": ".join(part for part in (prefix, where) if part)
                got = f" (got {err['input']!r})" if err["type"] != "missing" else ""
                if err["type"] == "extra_forbidden":
                    msg = "unknown key (typo?)"
                else:
                    msg = err["msg"] + got
                self.problem(rel, f"{where}: {msg}" if where else msg)
            return None

    def check_unique(self, rel: str, what: str, values: list[Any]) -> None:
        seen: set[Any] = set()
        for value in values:
            if value in seen:
                self.problem(rel, f"duplicate {what} {value!r}")
            seen.add(value)


def _read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        raise _FileError("file not found") from None
    except (OSError, UnicodeDecodeError) as e:
        raise _FileError(f"cannot read file: {e}") from None


class _YamlLoader(yaml.SafeLoader):
    """SafeLoader that leaves dates as strings.

    Plain PyYAML turns `2024-04-22` into a date by itself and crashes with a bare
    ValueError on `2024-13-22`. Leaving dates to Pydantic means a bad date gets the same
    readable "field: message" error as everything else.
    """


_TIMESTAMP_TAG = "tag:yaml.org,2002:timestamp"
_YamlLoader.yaml_implicit_resolvers = {
    first_char: [(tag, regex) for tag, regex in resolvers if tag != _TIMESTAMP_TAG]
    for first_char, resolvers in yaml.SafeLoader.yaml_implicit_resolvers.items()
}


def _parse_yaml(text: str, rel: str, line_offset: int = 0) -> Any:
    try:
        return yaml.load(text, Loader=_YamlLoader)  # safe: _YamlLoader is a SafeLoader
    except yaml.MarkedYAMLError as e:
        mark = e.problem_mark
        line = f"line {mark.line + 1 + line_offset}: " if mark is not None else ""
        raise _FileError(f"{line}YAML syntax error: {e.problem}") from None
    except yaml.YAMLError as e:
        raise _FileError(f"YAML syntax error: {e}") from None


def _format_loc(loc: tuple[int | str, ...], data: Any) -> str:
    """('career', 'current', 'started') -> 'career.current.started'.

    For a list of entries (faq.yaml) the index is shown with the entry's id,
    e.g. "[12] (id=current_job).answer", so the entry is easy to find.
    """
    parts: list[str] = []
    for i, key in enumerate(loc):
        if isinstance(key, int):
            label = f"[{key}]"
            if i == 0 and isinstance(data, list) and key < len(data):
                entry: Any = data[key]
                if isinstance(entry, dict) and "id" in entry:
                    label += f" (id={entry['id']})"
            parts.append(label)
        else:
            parts.append(f".{key}" if parts else key)
    return "".join(parts)
