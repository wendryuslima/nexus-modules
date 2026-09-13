const capitalize = (value: string): string => {
  const [firstLetter = "", ...remainingLetters] = Array.from(value);

  return `${firstLetter.toLocaleUpperCase("pt-BR")}${remainingLetters.join("").toLocaleLowerCase("pt-BR")}`;
};

const getUserDisplayName = (email: string): string => {
  const emailName = email.split("@")[0]?.split("+")[0] ?? "";
  const nameParts = emailName.split(/[._-]+/).filter(Boolean);

  if (nameParts.length === 0) {
    return email;
  }

  return nameParts.map(capitalize).join(" ");
};

export { getUserDisplayName };
