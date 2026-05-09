import { ReactNode } from 'react';
import { Power } from 'lucide-react';

interface ActuatorCardProps {
  title: string;
  icon: ReactNode;
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
  color: 'blue' | 'cyan';
}

export function ActuatorCard({
  title,
  icon,
  isActive,
  onToggle,
  disabled = false,
  color
}: ActuatorCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500',
      hover: 'hover:bg-blue-600',
      ring: 'ring-blue-500',
      text: 'text-blue-500'
    },
    cyan: {
      bg: 'bg-cyan-500',
      hover: 'hover:bg-cyan-600',
      ring: 'ring-cyan-500',
      text: 'text-cyan-500'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 border-2 transition-all ${
      isActive ? `border-${color}-500` : 'border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={isActive ? colors.text : 'text-gray-400'}>
            {icon}
          </div>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>

        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isActive
            ? `${colors.bg} text-white`
            : 'bg-gray-200 text-gray-600'
        }`}>
          {isActive ? 'ACTIVO' : 'INACTIVO'}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {disabled && (
            <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
              Modo Automático
            </span>
          )}
        </div>

        <button
          onClick={onToggle}
          disabled={disabled}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
            isActive
              ? `${colors.bg} ${colors.hover} text-white`
              : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
          }`}
        >
          <Power size={20} />
          {isActive ? 'APAGAR' : 'ENCENDER'}
        </button>
      </div>

      {/* Visual indicator */}
      {isActive && (
        <div className="mt-4 flex items-center gap-2">
          <div className={`w-3 h-3 ${colors.bg} rounded-full animate-pulse`}></div>
          <span className="text-sm text-gray-600">En operación</span>
        </div>
      )}
    </div>
  );
}
