import requests
import json
from datetime import datetime

OUTPUT_FILE = "data/transport.json"

# Ejemplo de dataset (puedes cambiarlo luego)
API_URL = "https://datos.santander.es/api/3/action/package_search?q=transporte"

def fetch_data():

    try:
        response = requests.get(API_URL, timeout=10)
        data = response.json()

        results = data.get("result", {}).get("results", [])

        items = []

        for r in results[:10]:

            items.append({
                "title": r.get("title", "Sin título"),
                "description": r.get("notes", "")[:200],
                "url": "https://datos.santander.es" + r.get("url", "")
            })

        return items

    except Exception as e:
        print("Error descargando datos:", e)
        return []

def save_json(items):

    payload = {
        "updated": datetime.utcnow().isoformat(),
        "source": "datos.santander.es",
        "items": items
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

def main():

    items = fetch_data()
    save_json(items)

    print("Datos actualizados:", len(items))

if __name__ == "__main__":
    main()
