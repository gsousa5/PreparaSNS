import { ChevronLeft, RotateCcw, Download } from 'lucide-react';
import TaskCard from './TaskCard';
import { calculateTaskTime, formatDatetimePT } from '../utils/dateUtils';
import { downloadICSFile, scheduleAllTaskNotifications } from '../utils/notificationUtils';
import { isPast } from 'date-fns';
import { useEffect } from 'react';

export default function Timeline({
  exam,
  examDateTime,
  completedTasks,
  onToggleTask,
  onReset,
  onBack
}) {
  // Calcular os tempos de todas as tarefas
  const tasks = exam.passos.map(passo => ({
    ...passo,
    scheduledTime: calculateTaskTime(examDateTime, passo.horas_antecedencia),
  }));

  // Ordenar as tarefas por tempo agendado (da mais próxima à mais distante)
  const sortedTasks = [...tasks].sort((a, b) => b.scheduledTime - a.scheduledTime);

  // Calcular se a tarefa está atrasada
  const isTaskOverdue = (taskTime) => {
    const now = new Date();
    return isPast(taskTime) && taskTime <= now;
  };

  // Agendar notificações quando o componente montar
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      scheduleAllTaskNotifications(tasks);
    }
  }, [tasks]);

  // Contar tarefas completas
  const completedCount = completedTasks.length;
  const totalCount = exam.passos.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const handleExportCalendar = () => {
    downloadICSFile(exam, examDateTime, tasks);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
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
      <div className="bg-blue-50 border-l-4 border-primary-blue p-4 m-6 rounded-2xl">
        <p className="text-sm text-primary-blue">
          <strong>Nota importante:</strong> {exam.avisos_gerais}
        </p>
      </div>

      {/* Botão Secundário: Exportar Calendário */}
      <div className="px-6 mb-6 max-w-md mx-auto">
        <button
          onClick={handleExportCalendar}
          className="w-full flex items-center justify-center gap-2 bg-white border-2 border-primary-blue text-primary-blue font-semibold py-3 rounded-2xl hover:bg-blue-50 transition-colors"
        >
          <Download className="w-5 h-5" />
          Adicionar ao Calendário
        </button>
      </div>

      {/* Lista de Tarefas */}
      <div className="px-4 space-y-4 max-w-md mx-auto">
        {sortedTasks.map((task) => (
          <TaskCard
            key={task.id}
            taskId={task.id}
            title={task.titulo}
            description={task.descricao_pt}
            scheduledTime={formatDatetimePT(task.scheduledTime)}
            isCompleted={completedTasks.includes(task.id)}
            onToggle={onToggleTask}
            isOverdue={isTaskOverdue(task.scheduledTime)}
          />
        ))}
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
    </div>
  );
}
