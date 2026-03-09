import json
from datetime import datetime, timezone

import requests

OUTPUT_FILE = "data/transport.json"

BASE_DATASET_URLS = {
    "senales_trafico": "http://datos.santander.es/api/rest/datasets/senales_trafico.json?items=2000",
    "plazas_pmr": "http://datos.santander.es/api/rest/datasets/plazas_pmr_nofoto.json?items=2000",
    "vados": "http://datos.santander.es/api/rest/datasets/vados.json?items=2000",
    "plazas_motos": "http://datos.santander.es/api/rest/datasets/plazas_motos.json?items=2000",
    "zonas_carga": "http://datos.santander.es/api/rest/datasets/zonas_carga.json?items=2000",
    "zonas_30": "http://datos.santander.es/api/rest/datasets/zonas_30.json?items=2000",
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
        "lat", "latitude", "geo:lat", "wgs84_pos:lat", "geom2d:y", "y", "Y"
    ]
    lon_keys = [
        "lon", "lng", "longitude", "geo:long", "wgs84_pos:long", "geom2d:x", "x", "X"
    ]

    lat = None
    lon = None

    for key in lat_keys:
        if key in record:
            lat = record.get(key)
            break

    for key in lon_keys:
        if key in record:
            lon = record.get(key)
            break

    return lat, lon


def extract_name(record, fallback):
    for key in (
        "name", "title", "label", "nombre", "descripcion", "description",
        "ayto:Nombre", "ayto:Descripcion", "ayto:Autorizacion", "dc:title"
    ):
        value = record.get(key)
        if value:
            return str(value)

    return fallback


def summarize_record(dataset_key, record, index):
    lat, lon = extract_lat_lon(record)
    title = extract_name(record, f"{dataset_key}_{index + 1}")

    item_type = "TRANSPORTE"
    if dataset_key == "senales_trafico":
        item_type = "SEÑAL"
    elif dataset_key == "plazas_pmr":
        item_type = "PMR"
    elif dataset_key == "vados":
        item_type = "VADO"
    elif dataset_key == "plazas_motos":
        item_type = "MOTO"
    elif dataset_key == "zonas_carga":
        item_type = "CARGA"
    elif dataset_key == "zonas_30":
        item_type = "ZONA_30"

    return {
        "id": record.get("id") or record.get("@id") or f"{dataset_key}_{index + 1}",
        "dataset": dataset_key,
        "type": item_type,
        "title": title,
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
