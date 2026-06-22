function SystemStatus() {
  return (
    <section className="system-status-card">
      <p className="eyebrow">Data Reliability</p>

      <h2>Coverage Sources</h2>

      <div className="system-status-list">
        <div>
          <span>Live scores</span>
          <strong>API-Football</strong>
        </div>

        <div>
          <span>Schedule</span>
          <strong>World Cup catalog</strong>
        </div>

        <div>
          <span>Fan events</span>
          <strong>Verified sources</strong>
        </div>

        <div>
          <span>API cache</span>
          <strong>Enabled</strong>
        </div>
      </div>
    </section>
  );
}

export default SystemStatus;