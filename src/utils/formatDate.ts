const formatDate = (start: string, end: string) => {
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);

  const isToday = startDate.toDateString() === now.toDateString();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = startDate.toDateString() === tomorrow.toDateString();

  const startTime = startDate.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  const endTime = endDate.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isToday) return `Today · ${startTime} – ${endTime}`;
  if (isTomorrow) return `Tomorrow · ${startTime} – ${endTime}`;

  const startDateString = startDate.toLocaleDateString();
  return `${startDateString} · ${startTime} – ${endTime}`;
};

export default formatDate;
