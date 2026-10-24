export function ResultsCount({count, q}: {count: number; q?: string}) {
  return <p className="results-count">{count} {count === 1 ? 'pack' : 'packs'}{q ? ` para “${q}”` : ''}</p>;
}
