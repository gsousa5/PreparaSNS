import { AlertCircle, CheckCircle, InfoIcon } from 'lucide-react';

export default function AlertBox({ type = 'info', title, message, className = '' }) {
  const baseStyles = 'p-4 rounded-lg border-l-4 flex gap-3 items-start';

  const typeStyles = {
    info: 'bg-blue-50 border-primary-blue text-primary-blue',
    success: 'bg-green-50 border-success-green text-success-green',
    warning: 'bg-orange-50 border-warning-orange text-warning-orange',
    danger: 'bg-red-50 border-danger-red text-danger-red',
  };

  const icons = {
    info: <InfoIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />,
    success: <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />,
    warning: <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />,
    danger: <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />,
  };

  return (
    <div className={`${baseStyles} ${typeStyles[type]} ${className}`}>
      {icons[type]}
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        {message && <p className="text-sm">{message}</p>}
      </div>
    </div>
  );
}
