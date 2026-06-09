from typing import Dict, Optional, Tuple
import re

CATEGORY_KEYWORDS: list[tuple[str, list[str]]] = [
    ('milk', ['milk']),
    ('eggs', ['egg']),
    ('bread', ['bread', 'loaf']),
    ('butter', ['butter']),
    ('cheese', ['cheese', 'cheddar', 'mozzarella', 'parmesan', 'swiss']),
    ('yogurt', ['yogurt', 'yoghurt']),
    ('juice', ['juice', 'oj']),
    ('water', ['water']),
    ('cereal', ['cereal']),
    ('coffee', ['coffee']),
    ('cream', ['cream', 'half and half', 'creamer']),
    ('rice', ['rice']),
    ('pasta', ['pasta', 'spaghetti', 'noodle', 'macaroni']),
    ('chicken', ['chicken']),
    ('beef', ['beef', 'ground beef', 'steak']),
]

MILK_TYPES: list[tuple[str, list[str]]] = [
    ('oat', ['oat']),
    ('almond', ['almond']),
    ('soy', ['soy']),
    ('lactose_free', ['lactose free', 'lactaid']),
    ('skim', ['skim', 'nonfat', 'fat free']),
    ('1percent', ['1 percent', '1%', 'lowfat', 'low fat']),
    ('2percent', ['2 percent', '2%', 'reduced fat']),
    ('whole', ['whole']),
]

SIZE_RE = re.compile(
    r'(\d+(?:\.\d+)?)\s*'
    r'(gallon|gal|fluid\s+ounce|fl\s+oz|ounce|oz|pound|lb|liter|litre|milliliter|ml|count|ct|pack|pk|quart|qt)',
    re.IGNORECASE,
)

_UNIT_MAP: dict[str, str] = {
    'gallon': 'gal', 'gal': 'gal',
    'fluid ounce': 'floz', 'fl oz': 'floz',
    'ounce': 'oz', 'oz': 'oz',
    'pound': 'lb', 'lb': 'lb',
    'liter': 'L', 'litre': 'L',
    'milliliter': 'ml', 'ml': 'ml',
    'count': 'ct', 'ct': 'ct', 'pack': 'ct', 'pk': 'ct',
    'quart': 'qt', 'qt': 'qt',
}

_UNIT_DISPLAY: dict[str, str] = {
    'gal': 'Gallon', 'oz': 'oz', 'floz': 'fl oz',
    'lb': 'lb', 'L': 'Liter', 'ml': 'ml',
    'ct': 'Count', 'qt': 'Quart',
}


def canonicalize_name(name: str) -> str:
    if not name:
        return ""
    s = name.lower()
    abbreviations = [
        (r"\bgal(s)?\b", "gallon"),
        (r"\bgal\.\b", "gallon"),
        (r"\boz\b", "ounce"),
        (r"\boz\.\b", "ounce"),
        (r"\blb(s)?\b", "pound"),
        (r"\bfl\s*oz\b", "fluid ounce"),
        (r"\b(\d+)\s*gal\b", r"\1 gallon"),
    ]
    for pat, rep in abbreviations:
        s = re.sub(pat, rep, s)
    s = re.sub(r"[^a-z0-9\s%]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def detect_category(canonical: str) -> str:
    for cat, keywords in CATEGORY_KEYWORDS:
        for kw in keywords:
            if kw in canonical:
                return cat
    return 'other'


def detect_milk_type(canonical: str) -> str:
    for mtype, keywords in MILK_TYPES:
        for kw in keywords:
            if kw in canonical:
                return mtype
    return 'whole'


def extract_size(canonical: str) -> Tuple[Optional[str], Optional[str]]:
    m = SIZE_RE.search(canonical)
    if not m:
        return None, None
    qty_f = float(m.group(1))
    qty_str = str(int(qty_f)) if qty_f == int(qty_f) else str(qty_f)
    raw_unit = re.sub(r'\s+', ' ', m.group(2).lower().strip())
    unit = _UNIT_MAP.get(raw_unit, raw_unit)
    return qty_str, unit


def generate_match_key(canonical: str) -> str:
    category = detect_category(canonical)
    qty, unit = extract_size(canonical)
    parts = [category]
    if category == 'milk':
        parts.append(detect_milk_type(canonical))
    if qty and unit:
        parts.append(f"{qty}{unit}")
    return '_'.join(parts)


def make_display_name(canonical: str) -> str:
    category = detect_category(canonical)
    qty, unit = extract_size(canonical)
    size_str = f"{qty} {_UNIT_DISPLAY.get(unit, unit)}" if qty and unit else ''

    if category == 'milk':
        mtype = detect_milk_type(canonical)
        type_labels: dict[str, str] = {
            'whole': 'Whole Milk', '2percent': '2% Milk', '1percent': '1% Milk',
            'skim': 'Skim Milk', 'oat': 'Oat Milk', 'almond': 'Almond Milk',
            'soy': 'Soy Milk', 'lactose_free': 'Lactose-Free Milk',
        }
        base = type_labels.get(mtype, 'Milk')
        return f"{base}, {size_str}" if size_str else base

    if category == 'eggs':
        return f"Eggs, {size_str}" if size_str else 'Eggs'

    if category == 'bread':
        return f"Bread, {size_str}" if size_str else 'Bread'

    if category == 'butter':
        return f"Butter, {size_str}" if size_str else 'Butter'

    if category == 'juice':
        return f"Orange Juice, {size_str}" if size_str else 'Orange Juice'

    words = canonical.split()
    title = ' '.join(w.capitalize() for w in words[:5])
    return title


def normalize_listing(raw: Dict) -> Dict:
    store_zip = raw.get("store_zip")
    if store_zip is not None:
        store_zip = str(store_zip).strip()
        if store_zip and store_zip.isdigit():
            store_zip = store_zip.zfill(5)
        else:
            store_zip = None

    product_name = raw.get("product_name") or raw.get("name") or ""
    canonical = canonicalize_name(product_name)
    match_key = generate_match_key(canonical)
    display_name = make_display_name(canonical)

    return {
        "store_id": raw.get("store_id") or raw.get("vendor_id") or "",
        "store_name": raw.get("store_name") or raw.get("vendor_name") or "",
        "store_zip": store_zip,
        "product_id": raw.get("product_id") or raw.get("id") or "",
        "product_name": product_name,
        "brand": raw.get("brand") or "",
        "price": float(raw.get("price") or raw.get("sale_price") or 0.0),
        "unit_price": None if raw.get("unit_price") in (None, 0, 0.0) else float(raw.get("unit_price")),
        "availability": raw.get("availability") or raw.get("stock") or "unknown",
        "canonical_name": canonical,
        "match_key": match_key,
        "display_name": display_name,
        "image_url": raw.get("image_url") or None,
    }
