import json
import os
from datetime import datetime
from config import DATA_FILE


def init_storage():

    os.makedirs("data", exist_ok=True)

    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w") as f:
            json.dump([], f)


def save_reading(data):

    with open(DATA_FILE, "r") as f:
        readings = json.load(f)

    data["timestamp"] = datetime.utcnow().isoformat()

    readings.append(data)

    with open(DATA_FILE, "w") as f:
        json.dump(readings, f, indent=2)


def get_all():

    with open(DATA_FILE, "r") as f:
        return json.load(f)


def get_latest_per_node():

    readings = get_all()

    latest = {}

    for r in readings:
        node = r["nodo"]
        latest[node] = r

    return latest


def get_history(limit=50):

    readings = get_all()

    return readings[-limit:]


def get_stats():

    readings = get_all()

    stats = {}

    for r in readings:

        node = r["nodo"]

        if node not in stats:

            stats[node] = {
                "sensores": [],
                "actuadores": [],
                "modo": [],
                "ultimo_update": []
            }

        stats[node]["sensores"].append(r["sensores"])
        stats[node]["actuadores"].append(r["actuadores"])
        stats[node]["modo"].append(r["modo"])
        stats[node]["ultimo_update"].append(r["ultimo_update"])


    result = {}

    for node, values in stats.items():

        result[node] = {
            "sensores": {
                "temp": max(values["sensores"]),
                "hum": max(values["sensores"]),
                "co2": max(values["sensores"])
            },
            "actuadores": {
                "riego": (values["actuadores"]),
                "ventilador": (values["humedad"])
            },
            "modo": {
                "automatico": (values["modo"])
            },
            "ultima_update": {
                "ultimo_update": (values["modo"])
            }
        }

    return result