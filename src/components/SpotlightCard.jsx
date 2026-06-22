function SpotlightCard({ selectedMatch }) {
  if (!selectedMatch) {
    return (
      <aside
        className="spotlight-card"
        aria-live="polite"
      >
        <div className="spotlight-header">
          <span>Syncing</span>
        </div>

        <p className="spotlight-label">
          Spotlight Module
        </p>

        <h2>Loading MatchCast coverage...</h2>

        <p>
          Fetching World Cup schedules, scores,
          match statuses, and key storylines.
        </p>
      </aside>
    );
  }

  const isLive = selectedMatch.status === "Live";

  return (
    <aside
      className="spotlight-card"
      aria-live="polite"
    >
      <div className="spotlight-header">
        {isLive && (
          <div
            className="live-orb"
            aria-hidden="true"
          />
        )}

        <span>{selectedMatch.status}</span>
      </div>

      {selectedMatch.image && (
        <div className="spotlight-image-wrap">
          <img
            src={selectedMatch.image}
            alt={selectedMatch.imageAlt}
            className="spotlight-image"
          />

          <div className="spotlight-image-overlay" />
        </div>
      )}

      <p className="spotlight-label">
        Spotlight Module
      </p>

      <h2>{selectedMatch.title}</h2>

      <p>{selectedMatch.description}</p>

      <div
        className={`spotlight-scoreline ${
          isLive
            ? "spotlight-scoreline-live"
            : "spotlight-scoreline-muted"
        }`}
      >
        {selectedMatch.scoreLabel}
      </div>

      <div className="spotlight-grid">
        <div>
          <span>Kickoff</span>

          <strong>
            {selectedMatch.time || "TBD"}
          </strong>
        </div>

        <div>
          <span>
            {selectedMatch.progressTitle ||
              "Match Status"}
          </span>

          <strong>
            {selectedMatch.progressLabel ||
              selectedMatch.status}
          </strong>
        </div>
      </div>

      <div className="coverage-box">
        <span>Coverage Details</span>

        <strong>
          {selectedMatch.coverage ||
            "Schedule and match-status monitoring"}
        </strong>
      </div>

      <div className="storyline-list">
        <h3 className="spotlight-details-title">Match Details</h3>

        <ul>
          {(selectedMatch.storylines || [
            "World Cup fixture information",
            "Venue and kickoff monitoring",
            "Score and match-status updates",
          ]).map((storyline) => (
            <li key={storyline}>
              {storyline}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default SpotlightCard;