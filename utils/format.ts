
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ';
};

export const formatNumber = (value: number, decimals: number = 1): string => {
  return value.toLocaleString('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
