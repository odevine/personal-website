const START = new Date(2018, 3, 1);

// Whole years since April 1st, 2018, worked out when the page loads
export const yearsOfExperience = (() => {
  const now = new Date();
  let years = now.getFullYear() - START.getFullYear();
  const reachedAnniversary =
    now.getMonth() > START.getMonth() ||
    (now.getMonth() === START.getMonth() && now.getDate() >= START.getDate());
  if (!reachedAnniversary) years -= 1;
  return years;
})();
