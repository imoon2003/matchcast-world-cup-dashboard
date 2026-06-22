function Hero({
  onViewUSMatches,
  onViewTodayMatches,
}) {
  return (
    <div className="hero-copy">
      <div className="hero-main">
        <p className="eyebrow">MatchCast • World Cup Command Center</p>

        <h1 className="hero-title">
          <span className="hero-highlight">World Cup Coverage</span>
          <span className="hero-subline">in one command view</span>
        </h1>

        <div className="hero-description-card">
          <span className="hero-card-label">
            MatchCast Live Coverage
          </span>

          <div className="hero-feature-list">
            <div className="hero-feature-item">
              <span className="hero-feature-dot" aria-hidden="true" />
              <strong>Live scores</strong>
              <span className="hero-feature-dot" aria-hidden="true" />
            </div>

            <div className="hero-feature-item">
              <span className="hero-feature-dot" aria-hidden="true" />
              <strong>Full tournament schedule</strong>
              <span className="hero-feature-dot" aria-hidden="true" />
            </div>

            <div className="hero-feature-item">
              <span className="hero-feature-dot" aria-hidden="true" />
              <strong>Matchday updates</strong>
              <span className="hero-feature-dot" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      <div className="hero-bottom">
        <div className="hero-actions">
          <button
            type="button"
            className="primary-button"
            onClick={onViewUSMatches}
          >
            View US Matches
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={onViewTodayMatches}
          >
            View Today’s Matches
          </button>
        </div>

        <div className="quick-stats">
          <div>
            <strong>104</strong>
            <span>match windows</span>
          </div>

          <div>
            <strong>16</strong>
            <span>host cities</span>
          </div>

          <div>
            <strong>48</strong>
            <span>teams tracked</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;