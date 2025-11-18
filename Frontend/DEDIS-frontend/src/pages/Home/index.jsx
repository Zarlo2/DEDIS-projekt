import './style.css';

export function Home() {
  return (
    <div class="home">
      {/* Hero Section */}
      <header class="hero">
        <h1>StockPulse</h1>
        <p>Your real-time stock market dashboard</p>

      </header>

      {/* Market Highlights */}
      <section id="features" class="market-features">
        <div class="feature-card">
          <h2>Top Gainers</h2>
          <p>See which stocks are on the rise today.</p>
        </div>
        <div class="feature-card">
          <h2>Top Losers</h2>
          <p>Track which stocks are falling the most.</p>
        </div>
        <div class="feature-card">
          <h2>Trending Stocks</h2>
          <p>Discover the stocks everyone is talking about.</p>
        </div>
        <div class="feature-card">
          <h2>News & Insights</h2>
          <p>Stay up-to-date with the latest market news.</p>
        </div>
      </section>

      {/* Footer */}
      <footer class="footer">
        <p>&copy; 2025 StockPulse. All rights reserved.</p>
      </footer>
    </div>
  );
}
