function DashboardControls({ searchTerm, onSearchChange }) {

  return (
    <div className="dashboard-controls">
      <div>
        <h2>Coverage Operations Feed</h2>
        <p>Search, filter, and select a signal to update the spotlight module.</p>          

      </div>

      <div className="control-actions">
        <input
          type="text"
          placeholder="Search teams, cities, storylines..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label="Search World Cup modules"
        />
      </div>
    </div>
  );
}

export default DashboardControls;