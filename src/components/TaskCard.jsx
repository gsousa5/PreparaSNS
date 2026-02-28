import { CheckCircle2, Clock, AlertCircle, Edit2 } from 'lucide-react';
import { isPast } from 'date-fns';
import { useTheme } from '../hooks/useTheme';
import clsx from 'clsx';

export default function TaskCard({
  taskId,
  title,
  description,
  scheduledTime,
  isCompleted,
  onToggle,
  isOverdue,
  isCustom
}) {
  const { isDark } = useTheme();
  const now = new Date();
  const taskDateTime = new Date(scheduledTime);
  const hasTimePassed = isPast(taskDateTime);

  let cardStyle = clsx(
    'p-5 rounded-2xl shadow-sm transition-all duration-200 border',
    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  );
  let statusColor = clsx(isDark ? 'text-gray-300' : 'text-gray-600');

  if (isCompleted) {
    cardStyle = clsx(
      cardStyle,
      isDark ? 'bg-gray-700 border-success-green' : 'bg-green-50 border-success-green'
    );
    statusColor = 'text-success-green line-through';
  } else if (isOverdue && hasTimePassed) {
    cardStyle = clsx(
      cardStyle,
      isDark ? 'bg-gray-800 border-l-4 border-danger-red' : 'bg-red-50 border-l-4 border-danger-red'
    );
    statusColor = 'text-danger-red';
  }

  return (
    <div className={cardStyle}>
      <div className="flex items-start gap-4">
        {/* Checkbox Grande */}
        <button
          onClick={() => onToggle(taskId)}
          className="mt-0.5 flex-shrink-0 focus:outline-none active:scale-90 transition-transform"
          aria-label={`Marcar "${title}" como ${isCompleted ? 'incompleto' : 'completo'}`}
        >
          <CheckCircle2
            className={clsx(
              'w-8 h-8 transition-all',
              isCompleted
                ? 'fill-success-green text-success-green'
                : isDark
                ? 'text-gray-500 hover:text-primary-blue hover:scale-110'
                : 'text-gray-300 hover:text-primary-blue hover:scale-110'
            )}
          />
        </button>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={clsx('font-semibold text-base', statusColor)}>
              {title}
            </h3>
            {isCustom && (
              <span className="inline-flex items-center gap-1 bg-warning-orange text-white text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                <Edit2 className="w-3 h-3" />
              </span>
            )}
            {isOverdue && hasTimePassed && !isCompleted && (
              <span className="inline-flex items-center gap-1 bg-danger-red text-white text-xs font-bold px-3 py-1 rounded-full flex-shrink-0">
                <AlertCircle className="w-3 h-3" />
                Em atraso
              </span>
            )}
          </div>

          {/* Descrição */}
          <p className={clsx('text-sm mb-3 leading-relaxed', statusColor)}>
            {description}
          </p>

          {/* Hora Agendada */}
          <div className={clsx('flex items-center gap-2 text-sm', isDark ? 'text-gray-400' : 'text-gray-500')}>
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{scheduledTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
