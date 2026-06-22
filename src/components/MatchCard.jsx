import PropTypes from "prop-types";

function MatchCard({
  match,
  selectedMatch,
  onSelectMatch,
}) {
  const statusClass = match.status
    .toLowerCase()
    .replace(/\s+/g, "-");

  const isSelected =
    selectedMatch?.id === match.id;

  function handleKeyDown(event) {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      onSelectMatch(match);
    }
  }

  return (
    <article
      className={`match-card ${
        isSelected ? "selected-card" : ""
      }`}
      role="button"
      tabIndex="0"
      aria-pressed={isSelected}
      aria-label={`Select ${match.title}`}
      onClick={() => onSelectMatch(match)}
      onKeyDown={handleKeyDown}
    >
      {match.image && (
        <div className="card-image-wrap">
          <img
            src={match.image}
            alt={match.imageAlt}
            className="card-image"
          />
          <div className="card-image-overlay" />
        </div>
      )}

      <div className="card-topline">
        <span
          className={`status-pill ${statusClass}`}
        >
          {match.status}
        </span>

        <span>
          {match.regionalFocus ||
            match.category}
        </span>
      </div>

      <h3>{match.title}</h3>

      <div className="match-team-logos">
        <div className="match-team">
          <div className="team-flag-frame">
            {match.homeTeamLogo ? (
              <img
                src={match.homeTeamLogo}
                alt={`${match.apiData?.homeTeam?.name} flag`}
              />
            ) : (
              <span aria-hidden="true">—</span>
            )}
          </div>

          <span className="team-name">
            {match.apiData?.homeTeam?.name}
          </span>
        </div>

        <span
          className="match-versus"
          aria-hidden="true"
        >
          vs
        </span>

        <div className="match-team">
          <div className="team-flag-frame">
            {match.awayTeamLogo ? (
              <img
                src={match.awayTeamLogo}
                alt={`${match.apiData?.awayTeam?.name} flag`}
              />
            ) : (
              <span aria-hidden="true">—</span>
            )}
          </div>

          <span className="team-name">
            {match.apiData?.awayTeam?.name}
          </span>
        </div>
      </div>

      <p>{match.description}</p>

      <div className="module-details">
        <div>
          <span>Kickoff</span>
          <strong>{match.time}</strong>
        </div>

        <div>
          <span>Venue</span>
          <strong>{match.city}</strong>
        </div>
      </div>

      <div className="match-card-bottom">
        <div
          className={`fan-meter ${
            match.status === "Upcoming"
              ? "is-upcoming"
              : ""
          }`}
          aria-label={`${match.progressTitle}: ${match.progressLabel}`}
        >
          <div className="fan-meter-top">
            <span>{match.progressTitle}</span>

            <strong>
              {match.progressLabel}
            </strong>
          </div>

          {match.showProgressBar && (
            <div
              className="meter-track"
              aria-hidden="true"
            >
              <div
                style={{
                  width: `${match.progressValue}%`,
                }}
              />
            </div>
          )}
        </div>

        <div
          className={`match-result-panel ${
            match.status === "Upcoming"
              ? "is-upcoming"
              : ""
          }`}
        >
          <div>
            <span>Score</span>

            <strong className="match-score">
              {match.status === "Upcoming"
                ? "—"
                : match.scoreLabel}
            </strong>
          </div>

          <span className="match-result-status">
            {match.status === "Upcoming"
              ? "Not started"
              : match.status}
          </span>
        </div>
      </div>

    </article>
  );
}

MatchCard.propTypes = {
  match: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
    status: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    image: PropTypes.string,
    imageAlt: PropTypes.string,
    category: PropTypes.string,
    regionalFocus: PropTypes.string,
    description: PropTypes.string,
    time: PropTypes.string,
    city: PropTypes.string,
    homeTeamLogo: PropTypes.string,
    awayTeamLogo: PropTypes.string,
    progressTitle: PropTypes.string,
    progressLabel: PropTypes.string,
    progressValue: PropTypes.number,
    showProgressBar: PropTypes.bool,
    scoreLabel: PropTypes.string,
    dataLabel: PropTypes.string,
    apiData: PropTypes.shape({
      homeTeam: PropTypes.shape({
        name: PropTypes.string,
      }),
      awayTeam: PropTypes.shape({
        name: PropTypes.string,
      }),
    }),
  }).isRequired,

  selectedMatch: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
  }),

  onSelectMatch: PropTypes.func.isRequired,
};

MatchCard.defaultProps = {
  selectedMatch: null,
};

export default MatchCard;