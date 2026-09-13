const getNameInitials = (name: string): string => {
  const nameParts = name.trim().split(/\s+/).filter(Boolean);

  if (nameParts.length === 0) {
    return "?";
  }

  const firstInitial = Array.from(nameParts[0])[0] ?? "";
  const lastInitial =
    nameParts.length > 1 ? (Array.from(nameParts.at(-1) ?? "")[0] ?? "") : "";

  return `${firstInitial}${lastInitial}`.toLocaleUpperCase("pt-BR");
};

export { getNameInitials };
