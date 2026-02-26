export const transformName = (name) => {
  if (!name) return "";
  const userName = name.split(" ");
  return userName
    .map((word) => {
      const upper = word.toUpperCase();
      return upper[0];
    })
    .join(" ");
};
