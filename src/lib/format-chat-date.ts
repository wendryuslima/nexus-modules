const formatChatDate = (value: string, now = new Date()): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  if (date.toDateString() === now.toDateString()) {
    return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date);
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Ontem";

  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: date.getFullYear() === now.getFullYear() ? undefined : "numeric" }).format(date);
};

export { formatChatDate };
