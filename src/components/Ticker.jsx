function Ticker({
  matches = [],
  mode = "upcoming",
  onSelectMatch,
}) {
  if (matches.length === 0) {
    return null;
  }

  const headings = {
    live: {
      label: "Live Now",
      title: "Live Match Center",
    },
    today: {
      label: "Today",
      title: "Today’s Matches",
    },
    upcoming: {
      label: "Next Up",
      title: "Upcoming Matches",
    },
  };

  const heading =
    headings[mode] || headings.upcoming;

  return (
    <section
      className={`live-strip live-strip-${mode}`}
      aria-label={heading.title}
    >
      <div className="live-strip-header">
        <span className="live-strip-indicator">
          {mode === "live" && (
            <span
              className="live-strip-dot"
              aria-hidden="true"
            />
          )}
          {heading.label}
        </span>
      </div>

      <div className="live-strip-list">
        {matches.slice(0, 4).map((match) => {
          const showScore =
            match.status === "Live" ||
            match.status === "Final";

          return (
            <button
              type="button"
              className="live-strip-match"
              key={match.id}
              onClick={() => onSelectMatch?.(match)}
            >
              {match.status !== "Live" && (
                <span className="live-strip-status">
                  {match.status}
                </span>
              )}

              <strong>{match.title}</strong>

              <span
                className={`live-strip-primary ${
                  showScore ? "live-strip-score" : "live-strip-time"
                }`}
              >
                {showScore ? match.scoreLabel : match.time}
              </span>

              <small>
                {match.status === "Live"
                  ? match.progressLabel
                  : match.status === "Final"
                    ? "Full time"
                    : match.city}
              </small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default Ticker;