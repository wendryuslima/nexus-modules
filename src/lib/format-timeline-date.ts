const calendarDayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const formatTimelineDate = (dateString: string, now = new Date()) => {
  const date = new Date(dateString);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysAgo = Math.round((today.getTime() - messageDay.getTime()) / 86_400_000);

  if (daysAgo === 0) return "Hoje";
  if (daysAgo === 1) return "Ontem";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  }).format(date);
};

const formatTimelineTime = (dateString: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));

export { calendarDayKey, formatTimelineDate, formatTimelineTime };
