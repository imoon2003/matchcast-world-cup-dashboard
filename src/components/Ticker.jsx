const tickerText =
  "Opening match coverage queue synced • Host city activity rising in Mexico and Canada • USMNT spotlight traffic trending upward • Knockout predictor module monitoring fan demand • Final venue coverage signal active";

function Ticker() {
  return (
    <section className="ticker" aria-label="Live MatchCast updates">
      <div className="ticker-label">
        <span className="live-dot"></span>
        LIVE FEED
      </div>

      <div className="ticker-track">
        <p>{tickerText}</p>
      </div>
    </section>
  );
}

export default Ticker;