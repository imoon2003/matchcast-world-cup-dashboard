function EmptyState({ searchTerm, selectedCategory, onReset }) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-icon" aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="radar-ring ring-one" cx="32" cy="32" r="9" />
            <circle className="radar-ring ring-two" cx="32" cy="32" r="18" />
            <circle className="radar-ring ring-three" cx="32" cy="32" r="27" />
            <path className="radar-sweep" d="M32 32L50 17" />
            <circle className="radar-dot" cx="32" cy="32" r="4" />
            <circle className="radar-ping" cx="46" cy="21" r="3" />
        </svg>
      </div>

      <h3>No coverage signals found</h3>

      <p>
        No MatchCast signals match{" "}
        <strong>{searchTerm || selectedCategory}</strong>. Try a different
        search term or reset your filters.
      </p>

      <button className="secondary-button" onClick={onReset}>
        Reset Feed
      </button>
    </div>
  );
}

export default EmptyState;