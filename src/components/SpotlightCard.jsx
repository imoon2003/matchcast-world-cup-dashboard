function SpotlightCard({ selectedMatch }) {
  if (!selectedMatch) {
    return (
      <aside className="spotlight-card" aria-live="polite">
        <div className="spotlight-header">
          <div className="live-orb"></div>
          <span>Syncing</span>
        </div>

        <p className="spotlight-label">Spotlight Module</p>
        <h2>Loading MatchCast coverage...</h2>
        <p>
          Fetching World Cup modules, fan activity, and live-event storylines.
        </p>
      </aside>
    );
  }

  return (
    <aside className="spotlight-card" aria-live="polite">
      <div className="spotlight-header">
        <div className="live-orb"></div>
        <span>{selectedMatch.status}</span>
      </div>

      {selectedMatch.image && (
        <div className="spotlight-image-wrap">
          <img
            src={selectedMatch.image}
            alt={selectedMatch.imageAlt}
            className="spotlight-image"
          />
          <div className="spotlight-image-overlay"></div>
        </div>
      )}

      <p className="spotlight-label">Spotlight Module</p>
      <h2>{selectedMatch.title}</h2>
      <p>{selectedMatch.description}</p>

      <div className="spotlight-meta">
        <span>{selectedMatch.city}</span>
        <span>{selectedMatch.viewers}</span>
        <span>{selectedMatch.priority} Priority</span>
      </div>

      <div className="spotlight-grid">
        <div>
          <span>Kickoff Window</span>
          <strong>{selectedMatch.time || "TBD"}</strong>
        </div>

        <div>
          <span>Fan Heat</span>
          <strong>{selectedMatch.fanScore}%</strong>
        </div>
      </div>

      <div className="coverage-box">
        <span>Coverage Mode</span>
        <strong>{selectedMatch.coverage || "Live event monitoring"}</strong>
      </div>

      <div className="storyline-list">
        <span>Key Storylines</span>

        <ul>
          {(selectedMatch.storylines || [
            "Audience momentum tracking",
            "Matchday alerts and fan engagement",
            "Live coverage module updates",
          ]).map((storyline) => (
            <li key={storyline}>{storyline}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default SpotlightCard;