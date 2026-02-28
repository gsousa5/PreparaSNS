import { format, subHours, isPast, isToday, isTomorrow, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDatetimePT = (date) => {
  return format(date, "d 'de' MMMM', 'HH:mm", { locale: ptBR });
};

export const calculateTaskTime = (examDateTime, horasAntecedencia) => {
  return subHours(new Date(examDateTime), horasAntecedencia);
};

export const getTaskStatus = (taskTime) => {
  const now = new Date();

  if (isPast(taskTime) && taskTime <= now) {
    return 'overdue'; // Atrasado
  }
  return 'pending'; // Pendente
};

export const calculateTimeUntilExam = (examDateTime) => {
  const now = new Date();
  const hoursUntil = differenceInHours(new Date(examDateTime), now);
  return hoursUntil;
};

export const validateExamDateTime = (selectedDate) => {
  const now = new Date();
  return new Date(selectedDate) > now;
};

export const calculateTimeSincePrepStart = (examDateTime, firstPrepHours) => {
  const now = new Date();
  const firstPrepTime = subHours(new Date(examDateTime), firstPrepHours);
  const hoursSincePrepStart = differenceInHours(now, firstPrepTime);
  return hoursSincePrepStart;
};
