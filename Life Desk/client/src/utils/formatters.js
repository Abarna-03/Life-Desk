// Friendly, human-readable date — turns "2024-11-24T18:30:00.000Z" into "Nov 24, 2024"
export const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Turns enum values like "Warranty_Card" / "Insurance_Policy" into "Warranty Card"
export const prettyType = (value) => (value ? String(value).replace(/_/g, ' ') : value);

