import { Thermometer, Droplet, Wind } from 'lucide-react';

interface SensorGaugeProps {
  title: string;
  value: number;
  unit: string;
  max: number;
  color: string;
  icon: 'thermometer' | 'droplet' | 'wind';
}

export function SensorGauge({ title, value, unit, max, color, icon }: SensorGaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getIcon = () => {
    switch (icon) {
      case 'thermometer':
        return <Thermometer size={40} />;
      case 'droplet':
        return <Droplet size={40} />;
      case 'wind':
        return <Wind size={40} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>

      <div className="relative w-48 h-48">
        <svg className="transform -rotate-90" width="192" height="192">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke={color}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div style={{ color }} className="mb-2">
            {getIcon()}
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {value.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500">{unit}</div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Rango: 0 - {max} {unit}
      </div>
    </div>
  );
}
