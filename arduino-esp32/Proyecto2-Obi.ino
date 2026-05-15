#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <math.h>
#include <DHT.h>

const char* DEVICE_ID = "ESP32-A";
const char* WIFI_SSID = "Alumno";
const char* WIFI_PASS = "Mebe2ege";
const char* MQTT_BROKER = "10.10.2.250";
const int MQTT_PORT = 1883;

#define PIN_RIEGO 16
#define PIN_VENTILADOR 17

#define DHTPIN 4
#define DHTTYPE DHT11

#define PIN_LDR 34

DHT dht(DHTPIN, DHTTYPE);

bool estadoVentilador = false;
bool estadoRiego = false;

WiFiClient espClient;
PubSubClient mqtt(espClient);
int t = 0;
long ultimo = 0;

int simular_temperatura() {
  return random(0, 50);
}
int simular_humedad() {
  return random(0, 100);
}
int simular_co2() {
  return random(0, 1000);
}

void callback(char* topic, byte* payload, unsigned int length) {

  String mensaje = "";

  for (int i = 0; i < length; i++) {
    mensaje += (char)payload[i];
  }

  Serial.println("\n========== COMANDO RECIBIDO ==========");
  Serial.print("Topic: ");
  Serial.println(topic);

  Serial.print("Mensaje: ");
  Serial.println(mensaje);

  String actuador = "";

  // CONTROL RIEGO
  if (strcmp(topic, "invernadero/control/riego") == 0) {

    actuador = "riego";

    if (mensaje == "ON") {
      digitalWrite(PIN_RIEGO, HIGH);
      estadoRiego = true;
    }
    else {
      digitalWrite(PIN_RIEGO, LOW);
      estadoRiego = false;
    }

    Serial.print("Estado riego: ");
    Serial.println(estadoRiego ? "ON" : "OFF");
  }

  // CONTROL VENTILADOR
  if (strcmp(topic, "invernadero/control/ventilador") == 0) {

    actuador = "ventilador";

    if (mensaje == "ON") {
      digitalWrite(PIN_VENTILADOR, HIGH);
      estadoVentilador = true;
    }
    else {
      digitalWrite(PIN_VENTILADOR, LOW);
      estadoVentilador = false;
    }

    Serial.print("Estado ventilador: ");
    Serial.println(estadoVentilador ? "ON" : "OFF");
  }

  // ACK
  StaticJsonDocument<200> statusDoc;

  statusDoc["actuador"] = actuador;
  statusDoc["estado"] = mensaje;
  statusDoc["ts"] = millis();

  char buffer[256];
  serializeJson(statusDoc, buffer);

  mqtt.publish("invernadero/ack", buffer);

  Serial.println("\n========== DATOS PUBLICADOS ==========");
  Serial.println(buffer);

  Serial.println("ACK enviado:");
  Serial.println(buffer);
}
void conectar_wifi() {
  Serial.println("\n[WiFi] Conectando a: " + String(WIFI_SSID));
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  
  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED && intentos < 30) {
    delay(500);
    Serial.print(".");
    intentos++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] ✓ Conectado exitosamente");
    Serial.print("[WiFi] IP local: ");
    Serial.println(WiFi.localIP());
    Serial.print("[WiFi] RSSI: ");
    Serial.println(WiFi.RSSI());
  } else {
    Serial.println("\n[WiFi] ✗ Error: No se pudo conectar");
    Serial.println("[WiFi] Reiniciando en 5 segundos...");
    delay(5000);
    ESP.restart();
  }
}

void conectar_mqtt() {
  while (!mqtt.connected()) {
    Serial.print("Conectando MQTT...");
    if (mqtt.connect(DEVICE_ID)) {
      Serial.println(" OK");
    } else {
      Serial.println("Falló, reintentando en 3s");
      delay(3000);
    }
  }
  mqtt.subscribe("invernadero/control/riego");
  mqtt.subscribe("invernadero/control/ventilador");
}

void setup() {
  Serial.begin(115200);
  Serial.print("Iniciar");

  // Setup mqtt
  conectar_wifi();
  mqtt.setServer(MQTT_BROKER, MQTT_PORT);
  mqtt.setCallback(callback);

  // Setup LEDs
  pinMode(PIN_RIEGO, OUTPUT);
  pinMode(PIN_VENTILADOR, OUTPUT);

  // Sensor DHT11
  dht.begin();
  Serial.println("[DHT11] Inicializado");
}

void loop() {
  // Reconnect if dead
  if (!mqtt.connected()) conectar_mqtt();
  mqtt.loop();

  // Loop
  if (millis() - ultimo < 5000) return;
  ultimo = millis();

// DHT
  float temp = dht.readTemperature();
  float humedad = dht.readHumidity();

  if (isnan(temp) || isnan(humedad)) {
    Serial.println("[DHT11] Error leyendo sensor");
    return;
  }

  // Sensor LDR
  int luz = analogRead(PIN_LDR);

  StaticJsonDocument<200> doc;

  doc["temp"] = temp;
  doc["hum"] = humedad;
  
  int luzPorcentaje = map(luz, 0, 4095, 0, 100);
  doc["co2"] = luzPorcentaje;

  doc["dispositivo"] = DEVICE_ID;

  // Serializar JSON
  char buffer[256];

  serializeJson(doc, buffer);

  mqtt.publish("invernadero/sensores", buffer);

  // MOnitor serial
  Serial.println("\n========== SENSOR DATA ==========");

  Serial.print("Temperatura: ");
  Serial.print(temp);
  Serial.println(" °C");

  Serial.print("Humedad: ");
  Serial.print(humedad);
  Serial.println(" %");

  Serial.print("Luz LDR: ");
  Serial.println(luz);

  Serial.println("\nJSON publicado:");

  Serial.println(buffer);

  Serial.println("=================================");

  t++;
}