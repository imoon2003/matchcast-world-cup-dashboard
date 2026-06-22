function formatEventDate(dateString) {
  if (!dateString) {
    return "Date TBD";
  }

  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(
    new Date(year, month - 1, day, 12)
  );
}

function formatDateRange(startDate, endDate) {
  if (!startDate) {
    return "Date TBD";
  }

  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate || startDate}T12:00:00`);

  const sameDay =
    start.toDateString() === end.toDateString();

  if (sameDay) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(start);
  }

  const sameYear =
    start.getFullYear() === end.getFullYear();

  if (sameYear) {
    const startLabel = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(start);

    const endLabel = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(end);

    return `${startLabel} – ${endLabel}`;
  }

  return `${formatEventDate(startDate)} – ${formatEventDate(endDate)}`;
}

function FanEvents({
  title = "Featured Fan Festivals & Events",
  description = "Verified public viewing experiences, official fan festivals, and host-city celebrations.",
  contextLabel = "",
  onShowAll,
  events = [],
  isLoading,
  hasError,
  onRetry,
}) {

  return (
    <section
      className="fan-events-section"
      aria-labelledby="fan-events-title"
    >
      <div className="fan-events-heading">
        <p className="eyebrow">
          Beyond the Stadium
        </p>

        <h2 id="fan-events-title">
          {title}
        </h2>

        <p>{description}</p>

        <div className="fan-events-toolbar">
          {onShowAll && (
            <button
              type="button"
              className="fan-events-show-all"
              onClick={onShowAll}
            >
              Show all
            </button>
          )}

          <span className="fan-events-count">
            {events.length}{" "}
            {events.length === 1 ? "event" : "events"}
          </span>
        </div>
      </div>

      {contextLabel && (
        <div className="fan-events-context">
          <p>{contextLabel}</p>
        </div>
      )}

      {isLoading ? (
        <div className="fan-events-message">
          Loading verified fan events...
        </div>
      ) : hasError ? (
        <div className="fan-events-message">
          <p>
            Fan-event information could not be
            loaded.
          </p>

          <button
            type="button"
            className="secondary-button"
            onClick={onRetry}
          >
            Retry Events
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="fan-events-message">
          No fan events match the current filters.
        </div>
      ) : (
        <div className="fan-events-grid">
          {events.map((event) => (
            <article
              className="fan-event-card"
              key={event.id}
            >
              <div className="fan-event-main">
                <div className="fan-event-topline">
                  <span className="fan-event-type">
                    {event.typeLabel}
                  </span>

                  {event.official && (
                    <span className="fan-event-verified">
                      Verified
                    </span>
                  )}
                </div>

                <h3>{event.name}</h3>

                <p className="fan-event-location">
                  {event.venue}
                  <span aria-hidden="true"> • </span>
                  {event.city}, {event.region}
                </p>

                <p className="fan-event-description">
                  {event.description}
                </p>
              </div>

              <div className="fan-event-meta">
                <div className="fan-event-details">
                  <div>
                    <span>Dates</span>

                    <strong>
                      {formatDateRange(
                        event.startDate,
                        event.endDate
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Admission</span>
                    <strong>{event.admission}</strong>
                  </div>
                </div>

                <a
                  className="fan-event-link"
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View official details
                  <span aria-hidden="true"> →</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default FanEvents;