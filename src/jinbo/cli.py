"""Command-line entry point (`jinbo ...`). Subcommands arrive in later phases."""

from jinbo import __version__


def main() -> None:
    print(f"jinbo {__version__}")
