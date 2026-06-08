function FanPoll({ pollVotes, totalVotes, onVote }) {
  return (
    <section className="poll-card">
      <p className="eyebrow">Audience Pulse</p>
      <h2>Which team is generating the strongest signal?</h2>
      <p className="vote-count">Total audience votes: {totalVotes}</p>

      {Object.entries(pollVotes).map(([team, votes]) => {
        const percentage = Math.round((votes / totalVotes) * 100);

        return (
          <button
            key={team}
            className="poll-option"
            onClick={() => onVote(team)}
          >
            <div>
              <strong>{team}</strong>
              <span>{percentage}%</span>
            </div>

            <div className="poll-track">
              <div style={{ width: `${percentage}%` }}></div>
            </div>
          </button>
        );
      })}
    </section>
  );
}

export default FanPoll;