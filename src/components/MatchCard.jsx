function MatchCard({ match, selectedMatch, onSelectMatch }) {
  const statusClass = match.status.toLowerCase().replace(" ", "-");
  const isSelected = selectedMatch?.id === match.id;

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectMatch(match);
    }
  }

  return (
    <article
      className={`match-card ${isSelected ? "selected-card" : ""}`}
      role="button"
      tabIndex="0"
      aria-pressed={isSelected}
      aria-label={`Select ${match.title} coverage module`}
      onClick={() => onSelectMatch(match)}
      onKeyDown={handleKeyDown}
    >
      {match.image && (
        <div className="card-image-wrap">
          <img src={match.image} alt={match.imageAlt} className="card-image" />
          <div className="card-image-overlay"></div>
        </div>
      )}

      <div className="card-topline">
        <span className={`status-pill ${statusClass}`}>{match.status}</span>
        <span>{match.category}</span>
      </div>

      <h3>{match.title}</h3>
      <p className="teams">{match.teams}</p>
      <p>{match.description}</p>

      <div className="module-details">
        <div>
          <span>Match Window</span>
          <strong>{match.time}</strong>
        </div>

        <div>
          <span>Venue Signal</span>
          <strong>{match.city}</strong>
        </div>
      </div>

      <div className="fan-meter" aria-label={`Fan heat ${match.fanScore}%`}>
        <div className="fan-meter-top">
          <span>Fan Heat Signal</span>
          <strong>{match.fanScore}%</strong>
        </div>

        <div className="meter-track" aria-hidden="true">
          <div style={{ width: `${match.fanScore}%` }}></div>
        </div>
      </div>

      <div className="card-footer">
        <span>{match.viewers}</span>
        <span>{match.priority} priority</span>
      </div>
    </article>
  );
}

export default MatchCard;