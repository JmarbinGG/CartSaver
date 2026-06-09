import sys
import os

import pytest

# Ensure the `backend` package directory is on sys.path so tests can import `app`.
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)


@pytest.fixture(autouse=True)
def reset_cache():
    """Wipe both in-memory and DB cache before every test for isolation."""
    from app.services.cache import clear_cache
    clear_cache()
    yield
    clear_cache()
