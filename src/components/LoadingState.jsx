function LoadingState() {
  return (
    <section
    className="loading-grid"
    role="status"
    aria-label="Loading coverage signals"
    >
      {[1, 2, 3, 4].map((item) => (
        <article className="skeleton-card" key={item}>
          <div className="skeleton-line short"></div>
          <div className="skeleton-line title"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-meter"></div>
        </article>
      ))}
    </section>
  );
}

export default LoadingState;