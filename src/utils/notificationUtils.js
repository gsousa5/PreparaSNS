/**
 * Agendador de Notificações para Tarefas de Preparação
 */

export const scheduleTaskNotification = (taskTitle, taskTime) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const now = new Date();
  const taskDateTime = new Date(taskTime);
  const delayMs = taskDateTime.getTime() - now.getTime();

  if (delayMs <= 0) {
    // Se a tarefa já passou, não agendar
    return;
  }

  // Agendar notificação para a hora exata
  setTimeout(() => {
    new Notification('PreparaSNS - Tarefa de Preparação', {
      body: `É hora: ${taskTitle}`,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23005596" width="192" height="192"/><text x="50%" y="50%" font-size="100" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">P</text></svg>',
      badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23005596" width="192" height="192" rx="45"/><text x="50%" y="50%" font-size="100" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">P</text></svg>',
      tag: `task-${taskTitle}`,
      requireInteraction: true, // Mantém a notificação visível até interacção
    });
  }, delayMs);
};

/**
 * Agenda notificações para todas as tarefas de um exame
 */
export const scheduleAllTaskNotifications = (tasks) => {
  if (Notification.permission !== 'granted') {
    console.log('Permissão de notificações não concedida');
    return;
  }

  tasks.forEach(task => {
    scheduleTaskNotification(task.titulo, task.scheduledTime);
  });
};

/**
 * Gera um ficheiro ICS (iCalendar) para importar em aplicações de calendário
 */
export const generateICSFile = (exam, examDateTime, tasks) => {
  const now = new Date();
  const formatToICS = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  };

  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PreparaSNS//PreparaSNS//PT
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${exam.nome}
X-WR-TIMEZONE:Europe/Lisbon
BEGIN:VTIMEZONE
TZID:Europe/Lisbon
BEGIN:DAYLIGHT
TZOFFSETFROM:+0000
TZOFFSETTO:+0100
TZNAME:WET
DTSTART:19700101T000000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0100
TZOFFSETTO:+0000
TZNAME:WET
DTSTART:19700101T000000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE
`;

  // Adicionar evento principal do exame
  const examStartTime = formatToICS(new Date(examDateTime));
  const examEndTime = formatToICS(new Date(new Date(examDateTime).getTime() + 60 * 60 * 1000)); // 1 hora de duração

  icsContent += `BEGIN:VEVENT
UID:exam-${exam.id}-${now.getTime()}@prepara-sns.pt
DTSTAMP:${formatToICS(now)}
DTSTART:${examStartTime}
DTEND:${examEndTime}
SUMMARY:${exam.nome}
DESCRIPTION:${exam.avisos_gerais.replace(/"/g, '\\"')}
LOCATION:Centro de Saúde/Hospital
STATUS:CONFIRMED
END:VEVENT
`;

  // Adicionar eventos para cada tarefa
  tasks.forEach((task, index) => {
    const taskStartTime = formatToICS(new Date(task.scheduledTime));
    const taskEndTime = formatToICS(new Date(new Date(task.scheduledTime).getTime() + 30 * 60 * 1000)); // 30 minutos de duração

    icsContent += `BEGIN:VEVENT
UID:task-${task.id}-${now.getTime()}@prepara-sns.pt
DTSTAMP:${formatToICS(now)}
DTSTART:${taskStartTime}
DTEND:${taskEndTime}
SUMMARY:PreparaSNS: ${task.titulo}
DESCRIPTION:${task.descricao_pt.replace(/"/g, '\\"')}
PRIORITY:${9 - Math.min(index, 8)}
STATUS:CONFIRMED
ALARM:DISPLAY
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Tarefa de preparação para ${exam.nome}
TRIGGER:-PT15M
END:VALARM
END:VEVENT
`;
  });

  icsContent += `END:VCALENDAR`;

  return icsContent;
};

/**
 * Download do ficheiro ICS
 */
export const downloadICSFile = (exam, examDateTime, tasks) => {
  const icsContent = generateICSFile(exam, examDateTime, tasks);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `preparasns-${exam.id}-${new Date().toISOString().split('T')[0]}.ics`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
