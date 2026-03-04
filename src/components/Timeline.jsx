import { ChevronLeft, RotateCcw, Download, Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import CustomTaskForm from './CustomTaskForm';
import { calculateTaskTime, formatDatetimePT } from '../utils/dateUtils';
import { downloadICSFile, scheduleAllTaskNotifications } from '../utils/notificationUtils';
import { schedulePushNotification } from '../services/pushService';
import { isPast } from 'date-fns';
import { useEffect, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

export default function Timeline({
  exam,
  examDateTime,
  completedTasks,
  onToggleTask,
  onReset,
  onBack
}) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [customTasks, setCustomTasks] = useState([]);
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Carregar tarefas customizadas do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`preparasns-custom-${exam.id}`);
    if (saved) {
      setCustomTasks(JSON.parse(saved));
    }
  }, [exam.id]);

  // Guardar tarefas customizadas no localStorage
  useEffect(() => {
    localStorage.setItem(`preparasns-custom-${exam.id}`, JSON.stringify(customTasks));
  }, [customTasks, exam.id]);

  // Calcular os tempos de todas as tarefas
  const tasks = exam.passos.map(passo => ({
    ...passo,
    scheduledTime: calculateTaskTime(examDateTime, passo.horas_antecedencia),
  }));

  // Combinar tarefas originais com customizadas
  const allTasks = [...tasks, ...customTasks.map(ct => ({
    ...ct,
    scheduledTime: new Date(ct.scheduledTime)
  }))];

  // Ordenar as tarefas por tempo agendado (da mais próxima à mais distante)
  const sortedTasks = [...allTasks].sort((a, b) => a.scheduledTime - b.scheduledTime);

  // Calcular se a tarefa está atrasada
  const isTaskOverdue = (taskTime) => {
    const now = new Date();
    return isPast(taskTime) && taskTime <= now;
  };

  // Agendar notificações quando o componente montar
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      // Schedule client-side notifications (setTimeout)
      scheduleAllTaskNotifications(allTasks);

      // Schedule push notifications if user is authenticated
      if (user?.id) {
        allTasks.forEach(task => {
          // Don't schedule if task is in the past
          if (!isTaskOverdue(task.scheduledTime)) {
            schedulePushNotification(
              user.id,
              task.id,
              task.scheduledTime,
              task
            ).catch(err => {
              console.error(`Failed to schedule push for task ${task.id}:`, err);
            });
          }
        });
      }
    }
  }, [allTasks, user?.id]);

  // Contar tarefas completas
  const completedCount = completedTasks.length;
  const totalCount = exam.passos.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const handleExportCalendar = () => {
    downloadICSFile(exam, examDateTime, allTasks);
  };

  const handleAddCustomTask = (task) => {
    setCustomTasks([...customTasks, task]);
    setShowCustomForm(false);
  };

  const handleToggleCustomTask = (taskId) => {
    setCustomTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, isCompleted: !task.isCompleted }
        : task
    ));
  };

  return (
    <div className={clsx('min-h-screen pb-32', isDark ? 'bg-gray-900' : 'bg-gray-50')}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-blue to-blue-700 text-white p-6 sticky top-0 z-10 shadow-lg">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        <h1 className="text-2xl font-bold mb-2">{exam.nome}</h1>
        <p className="text-blue-100 mb-4">
          Agendado para: <strong>{formatDatetimePT(new Date(examDateTime))}</strong>
        </p>

        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span>Progresso: {completedCount} de {totalCount} tarefas</span>
            <span className="font-semibold">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-blue-300 rounded-full h-3 overflow-hidden">
            <div
              className="bg-success-green h-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Aviso Geral */}
      <div className={clsx(
        'border-l-4 border-primary-blue p-4 m-6 rounded-2xl',
        isDark ? 'bg-gray-800 text-gray-300' : 'bg-blue-50 text-primary-blue'
      )}>
        <p className="text-sm">
          <strong>Nota importante:</strong> {exam.avisos_gerais}
        </p>
      </div>

      {/* Botões de Ação */}
      <div className="px-6 mb-6 max-w-md mx-auto space-y-3">
        <button
          onClick={handleExportCalendar}
          className={clsx(
            'w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-2xl transition-colors',
            isDark
              ? 'bg-gray-800 border-2 border-gray-700 text-primary-blue hover:bg-gray-700'
              : 'bg-white border-2 border-primary-blue text-primary-blue hover:bg-blue-50'
          )}
        >
          <Download className="w-5 h-5" />
          Adicionar ao Calendário
        </button>

        <button
          onClick={() => setShowCustomForm(true)}
          className="w-full flex items-center justify-center gap-2 bg-success-green text-white font-semibold py-3 rounded-2xl hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Adicionar Lembrete
        </button>
      </div>

      {/* Lista de Tarefas */}
      <div className={clsx('px-4 space-y-4 max-w-md mx-auto', isDark && 'text-gray-100')}>
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              Não há tarefas agendadas
            </p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              taskId={task.id}
              title={task.titulo}
              description={task.descricao_pt}
              scheduledTime={formatDatetimePT(task.scheduledTime)}
              isCompleted={task.isCustom
                ? task.isCompleted
                : completedTasks.includes(task.id)
              }
              onToggle={task.isCustom ? handleToggleCustomTask : onToggleTask}
              isOverdue={isTaskOverdue(task.scheduledTime)}
              isCustom={task.isCustom}
            />
          ))
        )}
      </div>

      {/* Botão de Reset - Flutuante */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={onReset}
          className="flex items-center justify-center bg-danger-red text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition-colors active:scale-95"
          title="Reiniciar agendamento"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Modal de Tarefa Customizada */}
      {showCustomForm && (
        <CustomTaskForm
          examDateTime={examDateTime}
          onAdd={handleAddCustomTask}
          onClose={() => setShowCustomForm(false)}
        />
      )}
    </div>
  );
}
