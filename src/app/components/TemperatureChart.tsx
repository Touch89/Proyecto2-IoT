import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TemperatureChartProps {
  data: Array<{ tiempo: string; temp: number }>;
}

export function TemperatureChart({ data }: TemperatureChartProps) {
  // Si no hay datos, mostrar datos de ejemplo
  const chartData = data.length > 0 ? data : [
    { tiempo: '00:00', temp: 22 },
    { tiempo: '00:05', temp: 23 },
    { tiempo: '00:10', temp: 24 },
    { tiempo: '00:15', temp: 26 },
    { tiempo: '00:20', temp: 25 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="tiempo"
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
          domain={[0, 50]}
          label={{ value: '°C', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px'
          }}
          formatter={(value: number) => [`${value.toFixed(1)}°C`, 'Temperatura']}
        />
        <Line
          type="monotone"
          dataKey="temp"
          stroke="#ef4444"
          strokeWidth={3}
          dot={{ fill: '#ef4444', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
