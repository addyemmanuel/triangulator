export function Pagination({
  page, pages, total, onPage, unit = "rows"
}: { page: number; pages: number; total: number; onPage: (p: number) => void; unit?: string }) {
  return (
    <nav className="pager" aria-label="Pagination">
      <span className="dim">{total.toLocaleString()} {unit} · page {page} of {pages}</span>
      <div style={{ display: "flex", gap: 6 }}>
        <button className="btn sm" onClick={() => onPage(1)} disabled={page === 1} aria-label="First page">«</button>
        <button className="btn sm" onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1} aria-label="Previous page">Prev</button>
        <button className="btn sm" onClick={() => onPage(Math.min(pages, page + 1))} disabled={page === pages} aria-label="Next page">Next</button>
        <button className="btn sm" onClick={() => onPage(pages)} disabled={page === pages} aria-label="Last page">»</button>
      </div>
    </nav>
  );
}