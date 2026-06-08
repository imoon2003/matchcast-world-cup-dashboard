function Hero({ onViewUSMNT, onFilterHostCities }) {
  return (
    <div className="hero-copy">
      <div className="hero-main">
        <p className="eyebrow">MatchCast • World Cup Command Center</p>

        <h1 className="hero-title">
          <span className="hero-highlight">World Cup Coverage</span>
          <span className="hero-subline">in one command view</span>
        </h1>

        <div className="hero-description-card">
          <span>Live coverage system</span>

          <p className="hero-description">
            Track live signals, host-city momentum, fan engagement, match
            windows, and priority coverage modules through a responsive React
            dashboard built for live sports media teams.
          </p>
        </div>
      </div>

      <div className="hero-bottom">
        <div className="hero-actions">
          <button className="primary-button" onClick={onViewUSMNT}>
            View USMNT Signal
          </button>

          <button className="secondary-button" onClick={onFilterHostCities}>
            Filter Host Cities
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