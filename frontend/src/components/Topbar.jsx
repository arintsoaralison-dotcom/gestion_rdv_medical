function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-recherche">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input type="text" placeholder="Rechercher..." />
      </div>
      <div className="topbar-actions">
        <div className="topbar-cloche">
          🔔
          <span className="point" />
        </div>
      </div>
    </header>
  );
}

export default Topbar;