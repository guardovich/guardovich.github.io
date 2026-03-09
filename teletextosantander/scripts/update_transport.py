import json
from datetime import datetime, timezone

import requests

OUTPUT_FILE = "teletextosantander/data/transport.json"

BASE_DATASET_URLS = {
    "senales_trafico": "http://datos.santander.es/api/rest/datasets/senales_trafico.json?items=500",
    "plazas_pmr": "http://datos.santander.es/api/rest/datasets/plazas_pmr_nofoto.json?items=500",
    "vados": "http://datos.santander.es/api/rest/datasets/vados.json?items=500",
    "plazas_motos": "http://datos.santander.es/api/rest/datasets/plazas_motos.json?items=500",
    "zonas_carga": "http://datos.santander.es/api/rest/datasets/zonas_carga.json?items=500",
    "zonas_30": "http://datos.santander.es/api/rest/datasets/zonas_30.json?items=500",
}

HEADERS = {
    "User-Agent": "TeletextoSantanderBot/1.0",
    "Accept": "application/json",
}


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def safe_get_json(url: str):
    try:
        response = requests.get(url, headers=HEADERS, timeout=20)
        response.raise_for_status()
        return response.json()
    except Exception as exc:
        print(f"Error descargando {url}: {exc}")
        return None


def normalize_records(raw):
    if raw is None:
        return []

    if isinstance(raw, list):
        return raw

    if isinstance(raw, dict):
        for key in ("results", "result", "records", "items", "features", "data"):
            value = raw.get(key)
            if isinstance(value, list):
                return value
        return [raw]

    return []


def extract_lat_lon(record):
    lat_keys = [
        "ayto:latWGS84", "geo:lat", "wgs84_pos:lat", "lat", "latitude"
    ]
    lon_keys = [
        "ayto:lonWGS84", "geo:long", "wgs84_pos:long", "lon", "lng", "longitude"
    ]

    lat = None
    lon = None

    for key in lat_keys:
        if key in record and record.get(key) not in (None, ""):
            lat = record.get(key)
            break

    for key in lon_keys:
        if key in record and record.get(key) not in (None, ""):
            lon = record.get(key)
            break

    return lat, lon


def extract_title(dataset_key, record, index):
    if dataset_key == "vados":
        calle = record.get("ayto:NombreCalle", "")
        numero = record.get("ayto:NumeroPostal", "")
        tipo = record.get("ayto:TipoSenal", "VADO")
        return f"{tipo} · {calle} {numero}".strip()

    if dataset_key == "plazas_pmr":
        calle = record.get("ayto:NombreCalle", "")
        numero = record.get("ayto:NumeroPostal", "")
        return f"PMR · {calle} {numero}".strip()

    if dataset_key == "plazas_motos":
        calle = record.get("ayto:NombreCalle", "")
        numero = record.get("ayto:NumeroPostal", "")
        return f"MOTOS · {calle} {numero}".strip()

    if dataset_key == "zonas_carga":
        calle = record.get("ayto:NombreCalle", "")
        numero = record.get("ayto:NumeroPostal", "")
        return f"CARGA · {calle} {numero}".strip()

    if dataset_key == "zonas_30":
        calle = record.get("ayto:NombreCalle", "") or record.get("dc:title", "")
        return f"ZONA 30 · {calle}".strip()

    if dataset_key == "senales_trafico":
        tipo = record.get("ayto:TipoSenal", "SEÑAL")
        calle = record.get("ayto:NombreCalle", "")
        numero = record.get("ayto:NumeroPostal", "")
        return f"{tipo} · {calle} {numero}".strip()

    return f"{dataset_key}_{index + 1}"


def extract_subtitle(dataset_key, record):
    if dataset_key == "vados":
        return record.get("ayto:Autorizacion", "")

    if dataset_key == "senales_trafico":
        return record.get("ayto:CodTipoSenal", "")

    if dataset_key == "plazas_pmr":
        return record.get("ayto:Regulacion", "")

    return record.get("dc:identifier", "")


def dataset_type(dataset_key):
    mapping = {
        "senales_trafico": "SEÑAL",
        "plazas_pmr": "PMR",
        "vados": "VADO",
        "plazas_motos": "MOTO",
        "zonas_carga": "CARGA",
        "zonas_30": "ZONA_30",
    }
    return mapping.get(dataset_key, "TRANSPORTE")


def summarize_record(dataset_key, record, index):
    lat, lon = extract_lat_lon(record)

    return {
        "id": record.get("dc:identifier") or record.get("id") or f"{dataset_key}_{index + 1}",
        "dataset": dataset_key,
        "type": dataset_type(dataset_key),
        "title": extract_title(dataset_key, record, index),
        "subtitle": extract_subtitle(dataset_key, record),
        "street": record.get("ayto:NombreCalle", ""),
        "number": record.get("ayto:NumeroPostal", ""),
        "modified": record.get("dc:modified", ""),
        "lat": lat,
        "lon": lon,
    }


def fetch_dataset(dataset_key, url):
    raw = safe_get_json(url)

    if raw is None:
        return {
            "dataset": dataset_key,
            "url": url,
            "ok": False,
            "count": 0,
            "items": [],
            "error": "No response"
        }

    records = normalize_records(raw)
    items = [summarize_record(dataset_key, record, i) for i, record in enumerate(records)]

    return {
        "dataset": dataset_key,
        "url": url,
        "ok": True,
        "count": len(items),
        "items": items[:50]
    }


def build_payload():
    datasets = []
    total_items = 0

    for dataset_key, url in BASE_DATASET_URLS.items():
        result = fetch_dataset(dataset_key, url)
        datasets.append(result)
        total_items += result["count"]

    return {
        "updated": now_iso(),
        "source": "datos.santander.es",
        "total_datasets": len(datasets),
        "total_items": total_items,
        "datasets": datasets
    }


def save_json(data):
    with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)


def main():
    payload = build_payload()
    save_json(payload)
    print(f"JSON actualizado. Datasets: {payload['total_datasets']} · Items: {payload['total_items']}")


if __name__ == "__main__":
    main()
