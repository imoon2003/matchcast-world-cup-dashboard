function ErrorState({ onRetry }) {
  return (
    <div className="error-state" role="alert">
      <div className="error-icon" aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M32 8L58 54H6L32 8Z"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M32 24V37"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="32" cy="45" r="2.8" fill="currentColor" />
        </svg>
      </div>

      <h3>Coverage signals unavailable</h3>

      <p>
        MatchCast could not load the latest coverage signals. Please retry the feed.
      </p>

      <button className="secondary-button" onClick={onRetry}>
        Retry Feed
      </button>
    </div>
  );
}

export default ErrorState;