function ActiveFilters({ searchTerm, selectedCategory, selectedTopic, onReset }) {
  const hasActiveFilters =
    searchTerm || selectedTopic || selectedCategory !== "All";

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <section className="active-filters" aria-label="Active filters">
      <div className="active-filter-list">
        <span className="active-filter-label">Active filters</span>

        {searchTerm && (
          <span className="active-filter-pill">Search: {searchTerm}</span>
        )}

        {selectedCategory !== "All" && (
          <span className="active-filter-pill">
            Category: {selectedCategory}
          </span>
        )}

        {selectedTopic && (
          <span className="active-filter-pill">Topic: #{selectedTopic}</span>
        )}
      </div>

      <button className="clear-filters-button" onClick={onReset}>
        Clear filters
      </button>
    </section>
  );
}

export default ActiveFilters;