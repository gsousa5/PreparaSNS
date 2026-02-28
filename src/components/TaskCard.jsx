import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { isPast } from 'date-fns';

export default function TaskCard({
  taskId,
  title,
  description,
  scheduledTime,
  isCompleted,
  onToggle,
  isOverdue
}) {
  const now = new Date();
  const taskDateTime = new Date(scheduledTime);
  const hasTimePassed = isPast(taskDateTime);

  let cardStyle = 'bg-white border border-gray-200';
  let statusColor = 'text-gray-600';

  if (isCompleted) {
    cardStyle = 'bg-green-50 border border-success-green';
    statusColor = 'text-success-green line-through';
  } else if (isOverdue && hasTimePassed) {
    cardStyle = 'bg-red-50 border-l-4 border-danger-red';
    statusColor = 'text-danger-red';
  }

  return (
    <div className={`p-5 rounded-2xl shadow-sm transition-all duration-200 ${cardStyle}`}>
      <div className="flex items-start gap-4">
        {/* Checkbox Grande */}
        <button
          onClick={() => onToggle(taskId)}
          className="mt-0.5 flex-shrink-0 focus:outline-none active:scale-90 transition-transform"
          aria-label={`Marcar "${title}" como ${isCompleted ? 'incompleto' : 'completo'}`}
        >
          <CheckCircle2
            className={`w-8 h-8 transition-all ${
              isCompleted
                ? 'fill-success-green text-success-green'
                : 'text-gray-300 hover:text-primary-blue hover:scale-110'
            }`}
          />
        </button>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`font-semibold text-base ${statusColor}`}>
              {title}
            </h3>
            {isOverdue && hasTimePassed && !isCompleted && (
              <span className="inline-flex items-center gap-1 bg-danger-red text-white text-xs font-bold px-3 py-1 rounded-full flex-shrink-0">
                <AlertCircle className="w-3 h-3" />
                Em atraso
              </span>
            )}
          </div>

          {/* Descrição */}
          <p className={`text-sm mb-3 leading-relaxed ${statusColor}`}>
            {description}
          </p>

          {/* Hora Agendada */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{scheduledTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
