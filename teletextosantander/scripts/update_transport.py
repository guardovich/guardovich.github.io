import json
from datetime import datetime, timezone
import requests

OUTPUT_FILE = "teletextosantander/data/transport.json"

BASE_DATASET_URLS = {
    "senales_trafico": "http://datos.santander.es/api/datos/senales_trafico.json",
    "plazas_pmr": "http://datos.santander.es/api/datos/plazas_pmr.json",
    "vados": "http://datos.santander.es/api/datos/vados.json",
    "plazas_motos": "http://datos.santander.es/api/datos/plazas_motos.json",
    "zonas_carga": "http://datos.santander.es/api/datos/zonas_carga.json",
    "zonas_30": "http://datos.santander.es/api/datos/zonas_30.json",
}

HEADERS = {
    "User-Agent": "TeletextoSantanderBot/1.0",
    "Accept": "application/json",
}


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def safe_get_json(url):
    try:
        print("Descargando:", url)
        r = requests.get(url, headers=HEADERS, timeout=30)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print("ERROR:", e)
        return None


def normalize_records(raw):

    if raw is None:
        return []

    # CASO 1: la API devuelve una lista directa (muy común en Santander)
    if isinstance(raw, list):
        return raw

    # CASO 2: geojson
    if isinstance(raw, dict) and "features" in raw:
        return [f.get("properties", {}) | {"geometry": f.get("geometry")} for f in raw["features"]]

    # CASO 3: estructura result
    if isinstance(raw, dict) and "result" in raw:

        result = raw["result"]

        if isinstance(result, list):
            return result

        if isinstance(result, dict):

            if "items" in result and isinstance(result["items"], list):
                return result["items"]

            if "records" in result and isinstance(result["records"], list):
                return result["records"]

            if "data" in result and isinstance(result["data"], list):
                return result["data"]

    # CASO 4: estructuras alternativas
    if isinstance(raw, dict):

        for key in ["items", "records", "data", "results"]:
            if key in raw and isinstance(raw[key], list):
                return raw[key]

    print("⚠️ estructura desconocida:", type(raw))

    return []


def extract_lat_lon(record):

    lat = None
    lon = None

    lat_keys = [
        "ayto:latWGS84",
        "geo:lat",
        "wgs84_pos:lat",
        "lat",
        "latitude"
    ]

    lon_keys = [
        "ayto:lonWGS84",
        "geo:long",
        "wgs84_pos:long",
        "lon",
        "lng",
        "longitude"
    ]

    for k in lat_keys:
        if k in record and record[k] not in (None, ""):
            try:
                lat = float(record[k])
                break
            except:
                pass

    for k in lon_keys:
        if k in record and record[k] not in (None, ""):
            try:
                lon = float(record[k])
                break
            except:
                pass

    # GeoJSON geometry
    if lat is None and "geometry" in record:
        g = record["geometry"]
        if g and "coordinates" in g:
            lon, lat = g["coordinates"]

    return lat, lon


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


def build_title(dataset_key, record):

    calle = record.get("ayto:NombreCalle", "")
    numero = record.get("ayto:NumeroPostal", "")

    if dataset_key == "vados":
        tipo = record.get("ayto:TipoSenal", "VADO")
        return f"{tipo} · {calle} {numero}".strip()

    if dataset_key == "plazas_pmr":
        return f"PMR · {calle} {numero}".strip()

    if dataset_key == "plazas_motos":
        return f"MOTOS · {calle} {numero}".strip()

    if dataset_key == "zonas_carga":
        return f"CARGA · {calle} {numero}".strip()

    if dataset_key == "zonas_30":
        return f"ZONA 30 · {calle}".strip()

    if dataset_key == "senales_trafico":
        tipo = record.get("ayto:TipoSenal", "SEÑAL")
        return f"{tipo} · {calle}".strip()

    return "TRANSPORTE"


def summarize_record(dataset_key, record, i):

    lat, lon = extract_lat_lon(record)

    return {
        "id": record.get("dc:identifier") or f"{dataset_key}_{i}",
        "dataset": dataset_key,
        "type": dataset_type(dataset_key),
        "title": build_title(dataset_key, record),
        "street": record.get("ayto:NombreCalle", ""),
        "number": record.get("ayto:NumeroPostal", ""),
        "modified": record.get("dc:modified", ""),
        "lat": lat,
        "lon": lon
    }


def fetch_dataset(dataset_key, url):

    raw = safe_get_json(url)

    if raw is None:
        return {
            "dataset": dataset_key,
            "url": url,
            "ok": False,
            "count": 0,
            "items": []
        }

    records = normalize_records(raw)

    print(dataset_key, "registros detectados:", len(records))

    items = [summarize_record(dataset_key, r, i) for i, r in enumerate(records)]

    return {
        "dataset": dataset_key,
        "url": url,
        "ok": True,
        "count": len(items),
        "items": items[:200]
    }


def build_payload():

    datasets = []
    total = 0

    for k, url in BASE_DATASET_URLS.items():

        ds = fetch_dataset(k, url)

        datasets.append(ds)

        total += ds["count"]

    return {
        "updated": now_iso(),
        "source": "datos.santander.es",
        "total_datasets": len(datasets),
        "total_items": total,
        "datasets": datasets
    }


def save_json(data):

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def main():

    payload = build_payload()

    save_json(payload)

    print(
        "JSON actualizado:",
        payload["total_datasets"],
        "datasets ·",
        payload["total_items"],
        "items"
    )


if __name__ == "__main__":
    main()
