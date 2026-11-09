import shutil
from collections.abc import Callable
from pathlib import Path

import pytest

from jinbo.cli import main
from jinbo.kb import KBError, load_kb

REAL_KB = Path(__file__).resolve().parents[1] / "knowledge"


@pytest.fixture
def kb_copy(tmp_path: Path) -> Path:
    """A throwaway copy of the real KB that a test can break."""
    root = tmp_path / "knowledge"
    shutil.copytree(REAL_KB, root)
    return root


def replace_in(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    assert old in text, f"test setup: {old!r} not found in {path.name}"
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


# ------------------------------------------------------------------- valid KB


def test_real_kb_loads() -> None:
    kb = load_kb(REAL_KB)
    assert kb.profile.name.display == "Prateesh Sulikeri"
    assert kb.profile.career.current.company.startswith("Xoriant")
    assert "onsite" in kb.projects
    assert {"resume.md", "about.md"} <= kb.documents.keys()
    assert any(entry.id == "default" for entry in kb.faq)


def test_projects_are_in_rank_order() -> None:
    ranks = [p.meta.rank for p in load_kb(REAL_KB).projects.values()]
    assert ranks == sorted(ranks)


def test_featured_projects_exist() -> None:
    kb = load_kb(REAL_KB)
    assert set(kb.profile.featured_projects) <= kb.projects.keys()


def test_cli_kb_check_ok(capsys: pytest.CaptureFixture[str]) -> None:
    assert main(["kb", "check", "--path", str(REAL_KB)]) == 0
    out = capsys.readouterr().out
    assert out.startswith("OK")
    for name in ["profile.yaml", "bot.yaml", "faq.yaml", "projects/", "resume.md", "about.md"]:
        assert name in out


# ------------------------------------------------------------------ broken KB

Breaker = Callable[[Path], object]  # return value ignored (write_text returns an int)

BROKEN: dict[str, tuple[Breaker, str, str]] = {
    # name: (how to break it, file in the error, words the error must contain)
    "typo_key": (
        lambda r: replace_in(r / "profile.yaml", "headline:", "headlin:"),
        "profile.yaml",
        "headlin: unknown key",
    ),
    "bad_date": (
        lambda r: replace_in(r / "profile.yaml", "started: 2024-04-22", "started: 2024-13-22"),
        "profile.yaml",
        "career.current.started",
    ),
    "bad_url": (
        lambda r: replace_in(
            r / "profile.yaml", "github: https://github.com", "github: github.com"
        ),
        "profile.yaml",
        "links.github",
    ),
    "unknown_placeholder": (
        # target quick_facts; the first bare "{years_fulltime}" is in the header comment
        lambda r: replace_in(r / "faq.yaml", "· {years_fulltime}", "· {years_full}"),
        "faq.yaml",
        "(id=quick_facts).answer",
    ),
    "faq_without_questions": (
        lambda r: replace_in(
            r / "faq.yaml", "questions: [hi, hello, hey, good morning, yo]", "questions: []"
        ),
        "faq.yaml",
        "(id=greeting)",
    ),
    "duplicate_faq_id": (
        lambda r: replace_in(r / "faq.yaml", "- id: about_bot", "- id: greeting"),
        "faq.yaml",
        "duplicate FAQ id 'greeting'",
    ),
    "yaml_syntax": (
        lambda r: replace_in(r / "bot.yaml", "name: JinBo", "name: [JinBo"),
        "bot.yaml",
        "YAML syntax error",
    ),
    "slug_mismatch": (
        lambda r: replace_in(r / "projects/onsite.md", "slug: onsite", "slug: on-site"),
        "projects/onsite.md",
        "must match the filename",
    ),
    "bad_status": (
        lambda r: replace_in(r / "projects/onsite.md", "status: active", "status: done"),
        "projects/onsite.md",
        "front matter: status",
    ),
    "no_front_matter": (
        lambda r: (r / "projects/onsite.md").write_text("# Onsite\n\nNo front matter.\n"),
        "projects/onsite.md",
        "missing front matter",
    ),
    "missing_file": (
        lambda r: (r / "resume.md").unlink(),
        "resume.md",
        "file not found",
    ),
    "featured_project_missing": (
        lambda r: replace_in(
            r / "profile.yaml", "featured_projects: [onsite,", "featured_projects: [ghost,"
        ),
        "profile.yaml",
        "no project with slug 'ghost'",
    ),
}


@pytest.mark.parametrize("name", BROKEN)
def test_broken_kb_gives_readable_error(kb_copy: Path, name: str) -> None:
    breaker, file, words = BROKEN[name]
    breaker(kb_copy)

    with pytest.raises(KBError) as exc:
        load_kb(kb_copy)

    messages = [str(p) for p in exc.value.problems]
    assert any(m.startswith(f"{file}: ") and words in m for m in messages), messages


def test_yaml_error_has_line_number(kb_copy: Path) -> None:
    replace_in(kb_copy / "projects/onsite.md", "name: Onsite", "name: [Onsite")
    with pytest.raises(KBError) as exc:
        load_kb(kb_copy)
    assert "line " in str(exc.value)


def test_all_problems_reported_at_once(kb_copy: Path) -> None:
    replace_in(kb_copy / "profile.yaml", "headline:", "headlin:")
    replace_in(kb_copy / "projects/onsite.md", "status: active", "status: done")
    (kb_copy / "resume.md").unlink()

    with pytest.raises(KBError) as exc:
        load_kb(kb_copy)

    files = {p.path for p in exc.value.problems}
    assert {"profile.yaml", "projects/onsite.md", "resume.md"} <= files


def test_missing_folder(tmp_path: Path) -> None:
    with pytest.raises(KBError, match="folder not found"):
        load_kb(tmp_path / "nope")


def test_cli_kb_check_fails(kb_copy: Path, capsys: pytest.CaptureFixture[str]) -> None:
    replace_in(kb_copy / "profile.yaml", "headline:", "headlin:")
    assert main(["kb", "check", "--path", str(kb_copy)]) == 1
    err = capsys.readouterr().err
    assert err.startswith("FAIL")
    assert "profile.yaml" in err
