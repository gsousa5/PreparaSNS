import { useState, useEffect } from 'react';
import ExamForm from './components/ExamForm';
import Timeline from './components/Timeline';
import History from './components/History';
import NotificationBanner from './components/NotificationBanner';
import Tabs from './components/Tabs';
import ThemeToggle from './components/ThemeToggle';
import SyncStatus from './components/SyncStatus';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { examesData } from './data/exames';
import { useDataSync } from './hooks/useDataSync';
import clsx from 'clsx';

const STORAGE_KEY = 'prepara_sns_state';
const HISTORY_KEY = 'preparasns-history';

function AppContent() {
  const [selectedExam, setSelectedExam] = useState(null);
  const [examDateTime, setExamDateTime] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('timeline');
  const { isDark } = useTheme();
  const { user, isLoading: authLoading } = useAuth();

  // Setup data sync with Supabase
  useDataSync(user?.id, selectedExam, examDateTime, completedTasks, history);

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

    // Carregar histórico
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
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

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const handleExamSelected = ({ exam, examDateTime: dateTime }) => {
    setSelectedExam(exam);
    setExamDateTime(dateTime);
    setCompletedTasks([]);
    setActiveTab('timeline');
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

  const handleCompleteExam = () => {
    const totalTasks = selectedExam.passos.length;
    const completionPercentage = (completedTasks.length / totalTasks) * 100;

    const historyEntry = {
      examId: selectedExam.id,
      examName: selectedExam.nome,
      scheduledDate: examDateTime,
      completedAt: new Date().toISOString(),
      completionPercentage: Math.round(completionPercentage),
      totalTasks,
      completedTasks: completedTasks.length
    };

    setHistory([historyEntry, ...history]);
    handleReset();
  };

  const handleReset = () => {
    if (window.confirm('Tem a certeza que deseja reiniciar o agendamento?')) {
      setSelectedExam(null);
      setExamDateTime(null);
      setCompletedTasks([]);
      localStorage.removeItem(STORAGE_KEY);
      setActiveTab('timeline');
    }
  };

  const handleBack = () => {
    if (window.confirm('Deseja voltar ao ecrã de configuração? Os dados serão mantidos.')) {
      setSelectedExam(null);
      setExamDateTime(null);
      setActiveTab('timeline');
    }
  };

  const handleRetakeExam = (exam) => {
    const examData = examesData.find(e => e.id === exam.examId);
    if (examData) {
      handleExamSelected({
        exam: examData,
        examDateTime: exam.scheduledDate
      });
    }
  };

  return (
    <div className={clsx(
      'min-h-screen flex items-center justify-center p-4 transition-colors',
      isDark ? 'bg-gray-950' : 'bg-gray-100'
    )}>
      {/* Loading spinner during auth initialization */}
      {authLoading && (
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
          <p className={clsx('text-sm font-medium', isDark ? 'text-gray-300' : 'text-gray-600')}>
            A preparar PreparaSNS...
          </p>
        </div>
      )}

      {/* Main content - hidden while loading */}
      {!authLoading && (
      <div className={clsx(
        'w-full max-w-md rounded-3xl shadow-2xl overflow-hidden min-h-screen md:min-h-auto md:h-full transition-colors',
        isDark ? 'bg-gray-800' : 'bg-white'
      )}>
        {/* Notificações Banner */}
        {!selectedExam && (
          <NotificationBanner onPermissionGranted={() => console.log('Notificações ativadas')} />
        )}

        {/* Header com ThemeToggle and SyncStatus */}
        {!(!selectedExam || !examDateTime) && (
          <div className={clsx(
            'flex justify-between items-center gap-4 p-4 border-b',
            isDark ? 'border-gray-700' : 'border-gray-200'
          )}>
            <SyncStatus />
            <ThemeToggle />
          </div>
        )}

        {/* Conteúdo Principal */}
        {!selectedExam || !examDateTime ? (
          <>
            {/* Header com Theme Toggle and SyncStatus */}
            {!selectedExam && (
              <div className="flex justify-between items-center p-6 border-b gap-4" style={{
                borderColor: isDark ? '#374151' : '#e5e7eb'
              }}>
                <h1 className={clsx('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                  PreparaSNS
                </h1>
                <div className="flex items-center gap-3">
                  <SyncStatus />
                  <ThemeToggle />
                </div>
              </div>
            )}
            <ExamForm onExamSelected={handleExamSelected} />
          </>
        ) : (
          <>
            {/* Tabs */}
            <Tabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabs={[
                { id: 'timeline', label: 'Timeline' },
                { id: 'history', label: 'Histórico' }
              ]}
            />

            {/* Conteúdo por Aba */}
            {activeTab === 'timeline' ? (
              <Timeline
                exam={selectedExam}
                examDateTime={examDateTime}
                completedTasks={completedTasks}
                onToggleTask={handleToggleTask}
                onReset={handleReset}
                onBack={handleBack}
              />
            ) : (
              <History
                history={history}
                onRetakeExam={handleRetakeExam}
              />
            )}
          </>
        )}
      </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
