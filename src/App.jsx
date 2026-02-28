import { useState, useEffect } from 'react';
import ExamForm from './components/ExamForm';
import Timeline from './components/Timeline';
import NotificationBanner from './components/NotificationBanner';
import { examesData } from './data/exames';

const STORAGE_KEY = 'prepara_sns_state';

export default function App() {
  const [selectedExam, setSelectedExam] = useState(null);
  const [examDateTime, setExamDateTime] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);

  // Carregar dados do localStorage ao montar o componente
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const { selectedExamId, examDateTime: savedDateTime, completedTasks: savedCompleted } = JSON.parse(savedState);
        const exam = examesData.find(e => e.id === selectedExamId);
        if (exam) {
          setSelectedExam(exam);
          setExamDateTime(savedDateTime);
          setCompletedTasks(savedCompleted || []);
        }
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
      }
    }
  }, []);

  // Guardar dados no localStorage sempre que mudarem
  useEffect(() => {
    if (selectedExam && examDateTime) {
      const state = {
        selectedExamId: selectedExam.id,
        examDateTime,
        completedTasks,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [selectedExam, examDateTime, completedTasks]);

  const handleExamSelected = ({ exam, examDateTime: dateTime }) => {
    setSelectedExam(exam);
    setExamDateTime(dateTime);
    setCompletedTasks([]);
  };

  const handleToggleTask = (taskId) => {
    setCompletedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  const handleReset = () => {
    if (window.confirm('Tem a certeza que deseja reiniciar o agendamento?')) {
      setSelectedExam(null);
      setExamDateTime(null);
      setCompletedTasks([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleBack = () => {
    if (window.confirm('Deseja voltar ao ecrã de configuração? Os dados serão mantidos.')) {
      setSelectedExam(null);
      setExamDateTime(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Contentor Premium - Estilo Apple */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden min-h-screen md:min-h-auto md:h-full">
        {/* Notificações Banner */}
        {!selectedExam && (
          <NotificationBanner onPermissionGranted={() => console.log('Notificações ativadas')} />
        )}

        {/* Conteúdo Principal */}
        {!selectedExam || !examDateTime ? (
          <ExamForm onExamSelected={handleExamSelected} />
        ) : (
          <Timeline
            exam={selectedExam}
            examDateTime={examDateTime}
            completedTasks={completedTasks}
            onToggleTask={handleToggleTask}
            onReset={handleReset}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}
