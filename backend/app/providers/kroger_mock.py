import json
from pathlib import Path
from typing import List, Dict


class KrogerMock:
    def __init__(self):
        data_path = Path(__file__).parent / "mock_data" / "kroger_products.json"
        try:
            with open(data_path, "r", encoding="utf-8") as fh:
                self.products = json.load(fh)
        except FileNotFoundError:
            self.products = []

    def search(self, query: str, zip_code: str | None = None) -> List[Dict]:
        q = query.lower()
        results = [p for p in self.products if q in p.get("product_name", "").lower()]
        return results
