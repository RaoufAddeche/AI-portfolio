"""Localisation : remplace les champs par leur variante `_en` en mode anglais.

Repli automatique sur le français si la traduction est absente.
"""

EMPTY = (None, "", [], {})


def localize(row: dict, lang: str, fields: list[str]) -> dict:
    """En anglais, remplace row[f] par row[f+'_en'] s'il existe et n'est pas vide."""
    if lang == "en":
        for f in fields:
            value_en = row.get(f"{f}_en")
            if value_en not in EMPTY:
                row[f] = value_en
    return row
