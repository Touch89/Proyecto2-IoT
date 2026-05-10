from datetime import datetime, timezone

_ultimo_dato = {
    "sensores": {"temp": 0.0, "hum": 0.0, "co2": 0},
    "actuadores": {"riego": "OFF", "ventilador": "OFF"},
    "modo": "automatico",
    "ultimo_update": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
}
_historial = []
_comandos = []

MAX_HISTORIAL = 100


def guardar_dato(data: dict):
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    if "sensores" in data:
        sensores = data["sensores"]
    else:
        sensores = {
            "temp": data.get("temp", _ultimo_dato["sensores"]["temp"]),
            "hum":  data.get("hum",  _ultimo_dato["sensores"]["hum"]),
            "co2":  data.get("co2",  _ultimo_dato["sensores"]["co2"]),
        }

    _ultimo_dato["sensores"] = sensores
    _ultimo_dato["ultimo_update"] = ts

    _historial.append({
        "sensores": sensores,
        "timestamp": ts,
    })
    if len(_historial) > MAX_HISTORIAL:
        _historial.pop(0)


def get_estado() -> dict:
    return {
        "sensores":     _ultimo_dato["sensores"],
        "actuadores":   _ultimo_dato["actuadores"],
        "modo":         _ultimo_dato["modo"],
        "ultimo_update": _ultimo_dato["ultimo_update"],
    }


def get_historial(limit: int = 30) -> list:
    return _historial[-limit:]


def agregar_comando(actuador: str, accion: str) -> dict:
    cmd = {"actuador": actuador, "accion": accion, "entregado": False}
    _comandos.append(cmd)
    _ultimo_dato["actuadores"][actuador] = accion
    _ultimo_dato["modo"] = "manual"
    return cmd


def get_comandos_pendientes() -> list:
    pending = [c for c in _comandos if not c["entregado"]]
    for c in pending:
        c["entregado"] = True
    return [{"actuador": c["actuador"], "accion": c["accion"]} for c in pending]


def set_modo(modo: str):
    if modo in ("automatico", "manual"):
        _ultimo_dato["modo"] = modo
