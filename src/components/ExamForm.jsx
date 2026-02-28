import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { examesData } from '../data/exames';
import { calculateTimeSincePrepStart, formatDatetimePT } from '../utils/dateUtils';
import AlertBox from './AlertBox';

export default function ExamForm({ onExamSelected }) {
  const [selectedExam, setSelectedExam] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('09:00');
  const [insufficientTimeError, setInsufficientTimeError] = useState(false);
  const [pastDateError, setPastDateError] = useState(false);

  const handleExamChange = (e) => {
    setSelectedExam(e.target.value);
  };

  const handleDateChange = (e) => {
    const selected = e.target.value;
    setExamDate(selected);
    validateDate(selected);
  };

  const handleTimeChange = (e) => {
    setExamTime(e.target.value);
  };

  const validateDate = (dateString) => {
    // Validação: data no passado
    const now = new Date();
    const selected = new Date(dateString + 'T00:00:00');

    if (selected < now) {
      setPastDateError(true);
      setInsufficientTimeError(false);
      return;
    }

    setPastDateError(false);

    // Validação: tempo de preparação insuficiente
    if (selectedExam && dateString && examTime) {
      const exam = examesData.find(e => e.id === selectedExam);
      if (exam) {
        const firstPrepHours = Math.max(...exam.passos.map(p => p.horas_antecedencia));
        const examDateTime = new Date(dateString + 'T' + examTime);
        const hoursUntilExam = (examDateTime - now) / (1000 * 60 * 60);

        if (hoursUntilExam < firstPrepHours) {
          setInsufficientTimeError(true);
        } else {
          setInsufficientTimeError(false);
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedExam || !examDate || !examTime) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    if (pastDateError || insufficientTimeError) {
      alert('Por favor, corrija os erros antes de prosseguir.');
      return;
    }

    const exam = examesData.find(e => e.id === selectedExam);
    const examDateTime = new Date(examDate + 'T' + examTime);

    onExamSelected({
      exam,
      examDateTime: examDateTime.toISOString(),
      selectedDate: examDate,
      selectedTime: examTime,
    });
  };

  const minDate = new Date().toISOString().split('T')[0];
  const selectedExamData = examesData.find(e => e.id === selectedExam);
  const maxPrepHours = selectedExamData ? Math.max(...selectedExamData.passos.map(p => p.horas_antecedencia)) : 0;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full flex flex-col items-center">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-blue to-blue-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">P</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">PreparaSNS</h1>
          <p className="text-gray-500 text-lg">Preparação para Exames Médicos</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-8 max-w-md">
          {/* Seleção de Exame */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Selecione o Exame
            </label>
            <select
              value={selectedExam}
              onChange={handleExamChange}
              className="w-full px-4 py-4 border border-gray-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent text-gray-800 font-medium"
            >
              <option value="">-- Escolha o seu exame --</option>
              {examesData.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Aviso Geral */}
          {selectedExamData && (
            <AlertBox
              type="info"
              title="Informação Importante"
              message={selectedExamData.avisos_gerais}
            />
          )}

          {/* Data do Exame */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-blue" />
              Data do Exame
            </label>
            <input
              type="date"
              value={examDate}
              onChange={handleDateChange}
              min={minDate}
              className="w-full px-4 py-4 border border-gray-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent font-medium"
            />
            {pastDateError && (
              <AlertBox
                type="danger"
                message="A data não pode ser no passado."
                className="mt-3"
              />
            )}
          </div>

          {/* Hora do Exame */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-blue" />
              Hora do Exame
            </label>
            <input
              type="time"
              value={examTime}
              onChange={handleTimeChange}
              className="w-full px-4 py-4 border border-gray-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent font-medium"
            />
          </div>

          {/* Aviso de Tempo Insuficiente */}
          {insufficientTimeError && (
            <AlertBox
              type="warning"
              title="Tempo de Preparação Insuficiente"
              message={`Este exame requer uma preparação de ${maxPrepHours} horas. Por favor, agende para uma data mais afastada.`}
            />
          )}

          {/* Duração da Preparação */}
          {selectedExamData && !insufficientTimeError && examDate && (
            <div className="bg-blue-50 border-l-4 border-primary-blue p-5 rounded-2xl">
              <p className="text-sm text-primary-blue">
                <strong>Duração total da preparação:</strong> {maxPrepHours} horas
              </p>
            </div>
          )}

          {/* Botão de Submissão */}
          <button
            type="submit"
            disabled={!selectedExam || !examDate || !examTime || pastDateError || insufficientTimeError}
            className="w-full py-4 bg-gradient-to-r from-primary-blue to-blue-700 text-white font-semibold rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            Começar Preparação
          </button>
        </form>
      </div>
    </div>
  );
}
