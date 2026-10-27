import {getReviewSummary, getReviewsForPack} from '@/src/lib/reviews';

export function ReviewsBlock({slug}: {slug: string}) {
  try {
    const summary = getReviewSummary(slug);
    const reviews = getReviewsForPack(slug);
    if (summary.total === 0) {
      return <section className=\"reviews\"><h2 className=\"h2\">Opiniones</h2><p>Aún no hay opiniones: solo opinan quienes ya han recogido su pack.</p></section>;
    }
    return <section className=\"reviews\"><h2 className=\"h2\">Opiniones</h2><p>Media {summary.average.toFixed(1)} / 5 · {summary.total} opiniones · Compra verificada</p><ul>{reviews.slice(0, 3).map(r => <li key={r.id}><strong>Compra verificada</strong> · {new Date(r.createdAt).toLocaleDateString('es-ES')}<br/>{'★'.repeat(r.rating)}{r.comment ? <p>{r.comment}</p> : null}</li>)}</ul></section>;
  } catch {
    return <section className=\"reviews\"><h2 className=\"h2\">Opiniones</h2><p>Aún no hay opiniones: solo opinan quienes ya han recogido su pack.</p></section>;
  }
}