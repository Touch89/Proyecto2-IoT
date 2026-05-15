import { useState, useEffect } from 'react';
import { SensorGauge } from './components/SensorGauge';
import { TemperatureChart } from './components/TemperatureChart';
import { ActuatorCard } from './components/ActuatorCard';
import { Droplet, Fan, Activity } from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface SensorData {
  temp: number;
  hum: number;
  co2: number;
}

interface ActuatorState {
  riego: boolean;
  ventilador: boolean;
}

export default function App() {
  const [apiUrl, setApiUrl] = useState('http://localhost:5000');
  const [modoAutomatico, setModoAutomatico] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData>({
    temp: 25,
    hum: 60,
    co2: 400,
  });
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());
  const [actuatorState, setActuatorState] = useState<ActuatorState>({
    riego: false,
    ventilador: false
  });
  const [tempHistory, setTempHistory] = useState<Array<{ tiempo: string; temp: number }>>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Simular datos de sensores (reemplazar con llamada real a la API)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        // Intentar obtener datos reales de la API
        const response = await fetch(`${apiUrl}/estado`);
        if (response.ok) {
          const data = await response.json();
          if (data.sensores) {
            setSensorData(data.sensores);
            setIsConnected(true);

            if (data.actuadores) {
              setActuatorState({
                riego: data.actuadores.riego === 'ON',
                ventilador: data.actuadores.ventilador === 'ON',
              });
            }
            if (data.modo) {
              setModoAutomatico(data.modo === 'automatico');
            }
            if (data.ultimo_update) {
              setLastUpdate(data.ultimo_update);
            }

            const now = new Date();
            const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
            setTempHistory(prev => [...prev.slice(-29), { tiempo: timeStr, temp: data.sensores.temp }]);
          }
        } else {
          setIsConnected(false);
          // Usar datos simulados si la API no responde
          useMockData();
        }
      } catch (error) {
        setIsConnected(false);
        // Usar datos simulados en caso de error
        useMockData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [apiUrl]);

  const useMockData = () => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    setSensorData({
      temp: 20 + Math.random() * 15,
      hum: 40 + Math.random() * 40,
      co2: 350 + Math.random() * 300,
    });
    setLastUpdate(now.toISOString());
    setTempHistory(prev => [...prev.slice(-29), { tiempo: timeStr, temp: 20 + Math.random() * 15 }]);
  };

  // Lógica automática
  useEffect(() => {
    if (modoAutomatico) {
      // Temp > 32°C → encender ventilador
      if (sensorData.temp > 32 && !actuatorState.ventilador) {
        handleControl('ventilador', true);
      }
      // Hum < 35% → encender riego
      if (sensorData.hum < 35 && !actuatorState.riego) {
        handleControl('riego', true);
      }
      // Condiciones normales → apagar ambos
      if (sensorData.temp <= 32 && sensorData.hum >= 35) {
        if (actuatorState.ventilador) handleControl('ventilador', false);
        if (actuatorState.riego) handleControl('riego', false);
      }
    }
  }, [sensorData, modoAutomatico]);

  // Polling de comandos pendientes
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${apiUrl}/comandos/pendientes`);
        if (response.ok) {
          const comandos = await response.json();
          // Los comandos ya fueron enviados al ESP32, aquí solo actualizamos el estado si llega ACK
        }
      } catch (error) {
        console.error('Error polling comandos:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [apiUrl, isConnected]);

  const handleControl = async (actuador: 'riego' | 'ventilador', estado: boolean) => {
    try {
      const response = await fetch(`${apiUrl}/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actuador,
          accion: estado ? 'ON' : 'OFF'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Comando enviado: ${actuador} ${estado ? 'ON' : 'OFF'}`);

        // Actualizar estado local (se confirmará con ACK)
        setActuatorState(prev => ({
          ...prev,
          [actuador]: estado
        }));
      } else {
        toast.error('Error al enviar comando');
        // En modo demo, simular el cambio
        setActuatorState(prev => ({
          ...prev,
          [actuador]: estado
        }));
      }
    } catch (error) {
      toast.error('Error de conexión con la API');
      // En modo demo, simular el cambio
      setActuatorState(prev => ({
        ...prev,
        [actuador]: estado
      }));
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Activity className="text-green-600" size={36} />
                Dashboard Invernadero IoT
              </h1>
              <p className="text-gray-600 mt-1">Monitoreo y Control en Tiempo Real</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-sm text-gray-600">{isConnected ? 'Conectado' : 'Modo Demo'}</span>
              </div>

              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
                <span className="text-sm font-medium text-gray-700">Modo:</span>
                <button
                  onClick={() => setModoAutomatico(!modoAutomatico)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    modoAutomatico
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {modoAutomatico ? 'AUTOMÁTICO' : 'MANUAL'}
                </button>
              </div>
            </div>
          </div>

          {/* API URL Config */}
          <div className="mt-4 flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">URL API:</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              placeholder="https://your-api.onrender.com"
            />
          </div>
        </div>

        {/* Sensores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SensorGauge
            title="Temperatura"
            value={sensorData.temp}
            unit="°C"
            max={50}
            color="#ef4444"
            icon="thermometer"
          />
          <SensorGauge
            title="Humedad"
            value={sensorData.hum}
            unit="%"
            max={100}
            color="#3b82f6"
            icon="droplet"
          />
          <SensorGauge
            title="CO2"
            value={sensorData.co2}
            unit="ppm"
            max={1000}
            color="#10b981"
            icon="wind"
          />
        </div>

        {/* Gráfico de Temperatura */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Histórico de Temperatura</h2>
          <TemperatureChart data={tempHistory} />
        </div>

        {/* Actuadores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActuatorCard
            title="Sistema de Riego"
            icon={<Droplet size={32} />}
            isActive={actuatorState.riego}
            onToggle={() => handleControl('riego', !actuatorState.riego)}
            disabled={modoAutomatico}
            color="blue"
          />
          <ActuatorCard
            title="Ventilador"
            icon={<Fan size={32} />}
            isActive={actuatorState.ventilador}
            onToggle={() => handleControl('ventilador', !actuatorState.ventilador)}
            disabled={modoAutomatico}
            color="cyan"
          />
        </div>

        {/* Info */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Configuración Automática</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Temperatura &gt; 32°C → Ventilador ON</li>
            <li>• Humedad &lt; 35% → Riego ON</li>
            <li>• Condiciones normales → Apagar actuadores</li>
          </ul>
          <p className="text-xs text-gray-500 mt-4">
            Última actualización: {new Date(lastUpdate).toLocaleString('es-ES')}
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
