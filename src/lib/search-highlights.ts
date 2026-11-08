type SearchHighlight = { start: number; end: number };

const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");

const getSearchHighlights = (text: string, query: string): SearchHighlight[] => {
  const words = new Set(normalize(query).match(/[\p{L}\p{N}]+/gu) ?? []);
  if (words.size === 0) return [];

  const matches = [...text.matchAll(/[\p{L}\p{N}][\p{L}\p{N}\p{M}]*/gu)];
  const textWords = new Set(matches.map((match) => normalize(match[0])));
  if ([...words].some((word) => !textWords.has(word))) return [];

  return matches
    .filter((match) => words.has(normalize(match[0])))
    .map((match) => ({ start: match.index, end: match.index + match[0].length }));
};

export { getSearchHighlights };
