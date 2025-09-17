export function calculateNextRunDate(frequency) {
  const days =
    {
      day: 1,
      week: 7,
      month: 30,
      "3_months": 90,
      "6_months": 180,
    }[frequency] || 30;

  return new Date(Date.now() + days * 86400000);
}
