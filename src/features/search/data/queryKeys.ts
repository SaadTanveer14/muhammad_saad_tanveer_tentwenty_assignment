export const searchKeys = {
  all: ['search'] as const,
  /** `term` must already be normalised (see `normaliseTerm`). */
  term: (term: string) => [...searchKeys.all, 'term', term] as const,
  genre: (genreId: number) => [...searchKeys.all, 'genre', genreId] as const,
  categories: () => [...searchKeys.all, 'categories'] as const,
};

export function normaliseTerm(input: string): string {
  return input.trim().toLowerCase();
}
