"""Pydantic models for every file in knowledge/.

All models forbid unknown keys, so a typo like `stak:` instead of `stack:` fails loudly
instead of being silently ignored.
"""

import re
from datetime import date
from typing import Annotated, Literal, Self

from pydantic import (
    AfterValidator,
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
    TypeAdapter,
    model_validator,
)

_HTTP_URL = TypeAdapter(HttpUrl)


def _check_url(value: str) -> str:
    _HTTP_URL.validate_python(value)  # raises a ValidationError on a bad URL
    return value  # keep the original string (HttpUrl would normalise it)


# A URL that is checked but kept as a plain string, so it prints exactly as written.
Url = Annotated[str, AfterValidator(_check_url)]
# "2026-08". YAML loads a bare year-month as a string, not a date.
YearMonth = Annotated[str, Field(pattern=r"^\d{4}-(0[1-9]|1[0-2])$")]
Email = Annotated[str, Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")]
NonEmpty = Annotated[str, Field(min_length=1)]
Slug = Annotated[str, Field(pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$")]


class Strict(BaseModel):
    """Base for KB models: unknown keys are errors, and models are read-only."""

    model_config = ConfigDict(extra="forbid", frozen=True)


# ---------------------------------------------------------------- profile.yaml


class Name(Strict):
    full: NonEmpty
    display: NonEmpty
    pronunciation: str | None = None


class Location(Strict):
    current: NonEmpty
    hometown: str | None = None
    timezone: str | None = None
    work_mode: Literal["remote", "hybrid", "onsite"] | None = None
    open_to_locations: str | None = None


class Language(Strict):
    name: NonEmpty
    level: Literal["native", "professional", "conversational", "hobby"]
    note: str | None = None


class CurrentJob(Strict):
    company: NonEmpty
    client: str | None = None
    domain: str | None = None
    title: NonEmpty
    promoted_from: str | None = None
    promoted: YearMonth | None = None
    started: date


class Career(Strict):
    current: CurrentJob
    career_started: date
    experience_rule: str | None = None


class Availability(Strict):
    status: NonEmpty
    target_roles: list[NonEmpty] = []
    positioning_note: str | None = None
    notice_period: str | None = None
    freelance: str | None = None
    mentoring_and_collabs: str | None = None
    salary_policy: str | None = None


class Contact(Strict):
    preferred_order: list[NonEmpty] = []
    email: Email
    phone: str | None = None
    contact_page: Url | None = None
    reply_time: str | None = None


class Profile(Strict):
    name: Name
    pronouns: str | None = None
    birth_date: date
    location: Location
    languages: list[Language] = []
    headline: NonEmpty
    specialisation: str | None = None
    bio: NonEmpty
    career: Career
    availability: Availability
    contact: Contact
    links: dict[str, Url]
    education_summary: str | None = None
    featured_projects: list[Slug] = []


# -------------------------------------------------------------------- bot.yaml


class Voice(Strict):
    person: Literal["first", "third"]
    tone: NonEmpty
    humour: str | None = None
    emoji: str | None = None
    length: str | None = None
    language: str | None = None


class Scope(Strict):
    allowed: NonEmpty
    off_topic: NonEmpty


class Recruiters(Strict):
    approach: NonEmpty
    contact_page: Url | None = None
    collect_in_chat: bool = False


class Abuse(Strict):
    first_response: NonEmpty
    policy: NonEmpty
    max_strikes: int = Field(ge=1)


class Bot(Strict):
    name: NonEmpty
    name_origin: str | None = None
    model: NonEmpty
    voice: Voice
    greetings: list[NonEmpty] = Field(min_length=1)
    scope: Scope
    unknown_answer: NonEmpty
    never_say: list[NonEmpty] = []
    claim_rules: list[NonEmpty] = []
    recruiters: Recruiters
    abuse: Abuse
    prompt_injection: list[NonEmpty] = []


# -------------------------------------------------------------------- faq.yaml

# Placeholders the runtime fills in from profile.yaml (see the faq.yaml header).
FAQ_PLACEHOLDERS = frozenset({"age", "years_fulltime", "years_total"})
_PLACEHOLDER = re.compile(r"\{(\w+)\}")


def _check_placeholders(answer: str) -> str:
    unknown = set(_PLACEHOLDER.findall(answer)) - FAQ_PLACEHOLDERS
    if unknown:
        allowed = ", ".join(f"{{{p}}}" for p in sorted(FAQ_PLACEHOLDERS))
        raise ValueError(f"unknown placeholder(s) {sorted(unknown)}; allowed: {allowed}")
    return answer


FAQ_DEFAULT_ID = "default"  # the catch-all reply when nothing matches


class FaqEntry(Strict):
    id: Annotated[str, Field(pattern=r"^[a-z0-9_]+$")]
    questions: list[NonEmpty] = []
    answer: Annotated[NonEmpty, AfterValidator(_check_placeholders)]

    @model_validator(mode="after")
    def _needs_questions(self) -> Self:
        if not self.questions and self.id != FAQ_DEFAULT_ID:
            raise ValueError(
                f"questions: needs at least one (only {FAQ_DEFAULT_ID!r} may be empty)"
            )
        return self


# ------------------------------------------------- Markdown files (front matter)


class ProjectMeta(Strict):
    slug: Slug
    name: NonEmpty
    tagline: str | None = None
    status: Literal["building", "active", "live", "archived"]
    type: NonEmpty
    category: NonEmpty
    released: date | None = None
    started: YearMonth | None = None
    featured: bool = False
    rank: int = Field(ge=1)
    role: NonEmpty
    team_size: int = Field(ge=1)
    stack: list[NonEmpty] = Field(min_length=1)
    links: dict[str, Url] = {}


class DocMeta(Strict):
    """Front matter for résumé, about and blog posts."""

    title: NonEmpty
    updated: date
    sources: list[NonEmpty] = []


class Project(Strict):
    meta: ProjectMeta
    body: NonEmpty
    path: str  # relative to the KB root, e.g. "projects/onsite.md"


class Document(Strict):
    meta: DocMeta
    body: NonEmpty
    path: str


# ------------------------------------------------------------- the whole KB


class KnowledgeBase(Strict):
    profile: Profile
    bot: Bot
    faq: list[FaqEntry]
    projects: dict[str, Project]  # by slug, in rank order
    documents: dict[str, Document]  # by path: "resume.md", "about.md", "blog/<name>.md"
