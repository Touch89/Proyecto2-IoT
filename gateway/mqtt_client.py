import json
import threading
import paho.mqtt.client as mqtt

from config import MQTT_BROKER, MQTT_PORT, MQTT_TOPIC_SENSORES, MQTT_TOPIC_CONTROL, MQTT_TOPIC_ACK
import data_store


class MQTTClient:

    def __init__(self):
        self.client = mqtt.Client()
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message

    def _on_connect(self, client, _userdata, _flags, rc):
        if rc == 0:
            print(f"[MQTT] Conectado al broker {MQTT_BROKER}:{MQTT_PORT}")
            client.subscribe(MQTT_TOPIC_SENSORES)
            client.subscribe(MQTT_TOPIC_ACK)
            print(f"[MQTT] Suscrito a '{MQTT_TOPIC_SENSORES}' y '{MQTT_TOPIC_ACK}'")
        else:
            print(f"[MQTT] Error de conexion, codigo: {rc}")

    def _on_message(self, _client, _userdata, msg):
        try:
            payload = json.loads(msg.payload.decode())

            if msg.topic == MQTT_TOPIC_SENSORES:
                data_store.guardar_dato(payload)
                print(f"[MQTT] Sensor: {payload}")

            elif msg.topic == MQTT_TOPIC_ACK:
                actuador = payload.get("actuador")
                estado = payload.get("estado")
                if actuador and estado:
                    data_store.actualizar_actuador_por_ack(actuador, estado)
                    print(f"[MQTT] ACK: {actuador} -> {estado}")

        except Exception as e:
            print(f"[MQTT] Error procesando mensaje: {e}")

    def publish_control(self, actuador: str, accion: str):
        topic = MQTT_TOPIC_CONTROL.format(actuador)
        self.client.publish(topic, accion)
        print(f"[MQTT] Publicado en '{topic}': {accion}")

    def start(self):
        try:
            self.client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
        except Exception as e:
            print(f"[MQTT] No se pudo conectar al broker: {e}")
            return
        thread = threading.Thread(target=self.client.loop_forever, daemon=True)
        thread.start()
