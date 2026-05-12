from flask import Flask, jsonify, request
from flask_cors import CORS

import data_store
from mqtt_client import MQTTClient

app = Flask(__name__)
CORS(app)

mqtt_client = MQTTClient()
mqtt_client.start()


@app.route("/datos", methods=["POST"])
def datos():
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "JSON requerido"}), 400
    data_store.guardar_dato(data)
    return jsonify({"ok": True}), 201


@app.route("/estado", methods=["GET"])
def estado():
    return jsonify(data_store.get_estado())


@app.route("/historial", methods=["GET"])
def historial():
    limit = request.args.get("limit", default=30, type=int)
    return jsonify(data_store.get_historial(limit))


@app.route("/control", methods=["POST"])
def control():
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "JSON requerido"}), 400

    actuador = data.get("actuador")
    accion = str(data.get("accion", ""))

    if actuador not in ("riego", "ventilador"):
        return jsonify({"error": "actuador debe ser 'riego' o 'ventilador'"}), 400
    if accion not in ("ON", "OFF") and not accion.isdigit():
        return jsonify({"error": "accion debe ser ON, OFF o 0-100"}), 400

    data_store.agregar_comando(actuador, accion)
    mqtt_client.publish_control(actuador, accion)
    return jsonify({"ok": True, "actuador": actuador, "accion": accion, "modo": "manual"})


@app.route("/comandos/pendientes", methods=["GET"])
def comandos_pendientes():
    return jsonify(data_store.get_comandos_pendientes())


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "not found"}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "server error"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
