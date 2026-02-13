export const formatTime = (datetime: string): string => {
  const date = new Date(datetime);
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export const formatDate = (datetime: string): string => {
  const date = new Date(datetime);
  return date.toLocaleDateString('az-AZ');
};
