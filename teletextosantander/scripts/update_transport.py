import json
from datetime import datetime, timezone
from urllib.parse import quote

import requests

OUTPUT_FILE = "data/transport.json"

BASE_DATASET_URLS = {
    "senales_trafico": "http://datos.santander.es/api/rest/datasets/senales_trafico",
    "plazas_pmr": "http://datos.santander.es/api/rest/datasets/plazas_pmr_nofoto",
    "vados": "http://datos.santander.es/api/rest/datasets/vados",
    "plazas_motos": "http://datos.santander.es/api/rest/datasets/plazas_motos",
    "zonas_carga": "http://datos.santander.es/api/rest/datasets/zonas_carga",
    "zonas_30": "http://datos.santander.es/api/rest/datasets/zonas_30",
}

HEADERS = {
    "User-Agent": "TeletextoSantanderBot/1.0"
}


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def safe_get(url: str):
    try:
        response = requests.get(url, headers=HEADERS, timeout=20)
        response.raise_for_status()
        content_type = response.headers.get("content-type", "").lower()

        if "json" in content_type:
            return response.json(), "json"

        return response.text, "text"
    except Exception as exc:
        print(f"Error descargando {url}: {exc}")
        return None, "error"


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
    candidates_lat = [
        "lat", "latitude", "ayto:latitude", "geo:lat", "y", "Y"
    ]
    candidates_lon = [
        "lon", "lng", "longitude", "ayto:longitude", "geo:long", "x", "X"
    ]

    lat = None
    lon = None

    for key in candidates_lat:
        if key in record:
            lat = record.get(key)
            break

    for key in candidates_lon:
        if key in record:
            lon = record.get(key)
            break

    return lat, lon


def extract_name(record, fallback):
    for key in (
        "name", "title", "label", "nombre", "descripcion", "description",
        "ayto:Nombre", "ayto:Descripcion", "ayto:Autorizacion"
    ):
        value = record.get(key)
        if value:
            return str(value)

    return fallback


def summarize_record(dataset_key, record, index):
    lat, lon = extract_lat_lon(record)
    title = extract_name(record, f"{dataset_key}_{index + 1}")

    summary = {
        "id": record.get("id") or record.get("@id") or f"{dataset_key}_{index + 1}",
        "dataset": dataset_key,
        "title": title,
        "lat": lat,
        "lon": lon,
        "raw": record
    }

    if dataset_key == "senales_trafico":
        summary["type"] = "SEÑAL"
    elif dataset_key == "plazas_pmr":
        summary["type"] = "PMR"
    elif dataset_key == "vados":
        summary["type"] = "VADO"
    elif dataset_key == "plazas_motos":
        summary["type"] = "MOTO"
    elif dataset_key == "zonas_carga":
        summary["type"] = "CARGA"
    elif dataset_key == "zonas_30":
        summary["type"] = "ZONA_30"
    else:
        summary["type"] = "TRANSPORTE"

    return summary


def fetch_dataset(dataset_key, url):
    payload, payload_type = safe_get(url)

    if payload is None:
        return {
            "dataset": dataset_key,
            "url": url,
            "ok": False,
            "count": 0,
            "items": [],
            "error": "No response"
        }

    if payload_type == "json":
        records = normalize_records(payload)
    else:
        # Si el endpoint no devuelve JSON utilizable, guardamos el texto para inspección
        records = [{
            "text_preview": str(payload)[:1000]
        }]

    items = [summarize_record(dataset_key, record, i) for i, record in enumerate(records)]

    return {
        "dataset": dataset_key,
        "url": url,
        "ok": True,
        "count": len(items),
        "items": items
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
