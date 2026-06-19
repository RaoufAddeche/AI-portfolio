"""Localisation : remplace les champs par leur variante traduite (`_en`, `_es`…).

Le français est la langue de base (colonnes sans suffixe). Pour toute autre
langue `xx`, on substitue `row[f]` par `row[f+'_xx']` s'il existe et n'est pas
vide. Repli automatique sur le français sinon.
"""

EMPTY = (None, "", [], {})

# Langues traduites disponibles (hors français de base).
SUPPORTED = ("en", "es")


def localize(row: dict, lang: str, fields: list[str]) -> dict:
    """Remplace row[f] par row[f+'_<lang>'] s'il existe et n'est pas vide."""
    if lang in SUPPORTED:
        for f in fields:
            value = row.get(f"{f}_{lang}")
            if value not in EMPTY:
                row[f] = value
    return row
