import sys
import os
import pytest

sys.path.append(os.path.abspath("src"))

from backend.app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client