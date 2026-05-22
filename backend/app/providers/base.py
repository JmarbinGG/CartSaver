from typing import Protocol, List, Dict


class ProviderBase(Protocol):
    def search(self, query: str, zip_code: str | None = None) -> List[Dict]:
        """Return a list of product dicts with keys matching StoreListing schema."""
        ...
