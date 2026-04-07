export const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

export const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
});

export const formatRupee = (amount) => {
  if (amount === undefined || amount === null) return '₹0.00';
  return '₹' + parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const CAREHOME_TYPES = {
  elderly_care: { label: 'Elderly Care Home', emoji: '🧓', color: '#FF8C42' },
  child_care: { label: 'Child Care Home', emoji: '👶', color: '#6C63FF' },
  physically_challenged: { label: 'Physically Challenged', emoji: '♿', color: '#4CAF50' },
  mentally_challenged: { label: 'Mentally Challenged', emoji: '🧠', color: '#2196F3' },
  other: { label: 'Other Care Home', emoji: '🏠', color: '#FF6584' },
};
