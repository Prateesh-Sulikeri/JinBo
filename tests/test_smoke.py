import pytest

import jinbo
from jinbo.cli import main


def test_version_is_set() -> None:
    assert jinbo.__version__ == "0.1.0"


def test_cli_prints_version(capsys: pytest.CaptureFixture[str]) -> None:
    with pytest.raises(SystemExit) as exc:
        main(["--version"])
    assert exc.value.code == 0
    assert capsys.readouterr().out.strip() == f"jinbo {jinbo.__version__}"
