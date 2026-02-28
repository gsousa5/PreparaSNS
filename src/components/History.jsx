import { ChevronDown, Calendar, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { formatDatetimePT } from '../utils/dateUtils';

export default function History({ history, onRetakeExam }) {
  const [expanded, setExpanded] = useState(null);

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Nenhum Exame Concluído Ainda
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Quando completares um exame, aparecerá aqui no histórico.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-8">
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Histórico de Preparações
        </h1>

        {history.map((exam, idx) => (
          <div
            key={idx}
            className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden transition-all"
          >
            {/* Card Header */}
            <button
              onClick={() => setExpanded(expanded === idx ? null : idx)}
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="text-left flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {exam.examName}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(exam.scheduledDate).toLocaleDateString('pt-PT')}
                  </span>
                  <span className="font-semibold text-success-green">
                    {exam.completionPercentage}% Completo
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                  expanded === idx ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Card Expanded */}
            {expanded === idx && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Agendado para
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatDatetimePT(new Date(exam.scheduledDate))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Concluído em
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(exam.completedAt).toLocaleDateString('pt-PT', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Tarefas Completas
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-success-green h-full transition-all duration-300"
                        style={{ width: `${exam.completionPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {exam.completedTasks} de {exam.totalTasks} tarefas
                    </p>
                  </div>
                </div>

                {/* Botão Retomar */}
                <button
                  onClick={() => onRetakeExam(exam)}
                  className="w-full py-2 bg-primary-blue text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refazer Preparação
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
