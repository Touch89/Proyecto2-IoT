# Dashboard Invernadero IoT

Dashboard web en tiempo real para monitoreo y control de un sistema de invernadero inteligente basado en ESP32.

## Características

### 📊 Monitoreo en Tiempo Real
- **Gauges circulares** para temperatura (0-50°C), humedad (0-100%) y CO2 (0-1000 ppm)
- **Gráfico histórico** de temperatura con los últimos 30 puntos de datos
- **Actualización automática** cada 5 segundos

### 🎮 Control de Actuadores
- **Sistema de Riego**: Control ON/OFF
- **Ventilador**: Control ON/OFF
- **Indicadores visuales** del estado de cada actuador
- **Confirmación** mediante notificaciones toast

### 🤖 Modo Automático
Cuando se activa el modo automático, el sistema aplica las siguientes reglas:
- Temperatura > 32°C → Encender ventilador
- Humedad < 35% → Encender riego
- Condiciones normales → Apagar ambos actuadores

### 🔌 Integración con API
- Campo configurable para la URL de la API
- Indicador de conexión en tiempo real
- Modo demo con datos simulados cuando la API no está disponible

## Estructura de la API

El dashboard espera los siguientes endpoints:

### GET /estado
```json
{
  "sensores": {
    "temp": 25.5,
    "hum": 60.2,
    "co2": 420,
    "timestamp": "2026-05-09T10:30:00.000Z"
  },
  "actuadores": {
    "riego": false,
    "ventilador": false
  }
}
```

### POST /control
**Request:**
```json
{
  "actuador": "riego",  // o "ventilador"
  "accion": "ON"        // o "OFF"
}
```

**Response:**
```json
{
  "status": "ok",
  "mensaje": "Comando enviado al ESP32"
}
```

### GET /comandos/pendientes
```json
[
  {
    "id": 1,
    "actuador": "riego",
    "accion": "ON",
    "timestamp": "2026-05-09T10:30:00.000Z"
  }
]
```

## Configuración

1. Ingresa la URL de tu API en el campo "URL API" en la parte superior del dashboard
2. El sistema intentará conectarse automáticamente
3. Si la conexión es exitosa, verás el indicador "Conectado" en verde
4. Si no puede conectarse, el dashboard funcionará en modo demo con datos simulados

## Tecnologías

- **React 18** con TypeScript
- **Tailwind CSS** para estilos
- **Recharts** para gráficos
- **Lucide React** para iconos
- **Sonner** para notificaciones

## Flujo de Datos

```
ESP32 --MQTT--> Mosquitto (laptop)
                    |
                    v
              Node-RED (gateway)
                    |
                    v
              API (Render/Railway)
                    ^
                    |
              Dashboard (este proyecto)
```

## Modo Demo

Cuando la API no está disponible, el dashboard genera datos aleatorios para demostración:
- Temperatura: 20-35°C
- Humedad: 40-80%
- CO2: 350-650 ppm

Todos los controles funcionan localmente para demostrar la interfaz.

## Despliegue

Este proyecto puede ser desplegado en cualquier servicio de hosting estático:
- Vercel
- Netlify
- GitHub Pages
- Render (Static Site)

Para construir el proyecto para producción, asegúrate de configurar correctamente la URL de la API en el código o mediante variables de entorno.
