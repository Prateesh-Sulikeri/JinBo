import pytest

import jinbo
from jinbo.cli import main


def test_version_is_set() -> None:
    assert jinbo.__version__ == "0.1.0"


def test_cli_prints_version(capsys: pytest.CaptureFixture[str]) -> None:
    main()
    assert capsys.readouterr().out.strip() == f"jinbo {jinbo.__version__}"
