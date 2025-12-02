// @ts-nocheck
import { useState, useEffect, useRef } from 'preact/hooks';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// ----------------------
// Metal Fetch Component
// ----------------------
class MetalPriceComponent {
  async getPrice() {
    throw new Error("getPrice() not implemented");
  }
}

// ----------------------
// Concrete Metal Fetchers
// ----------------------
class GoldFetcher extends MetalPriceComponent {
  async getPrice() {
    const res = await fetch("/api/gold");
    const json = await res.json();
    return json.price ? parseFloat(json.price) : null;
  }
}

class SilverFetcher extends MetalPriceComponent {
  async getPrice() {
    const res = await fetch("/api/silver");
    const json = await res.json();
    return json.price ? parseFloat(json.price) : null;
  }
}

class TiberiumFetcher extends MetalPriceComponent {
  async getPrice() {
    const res = await fetch("/api/tiberium");
    const json = await res.json();
    return json.price ? parseFloat(json.price) : null;
  }
}

// ----------------------
// Decorator Base
// ----------------------
class MetalPriceDecorator extends MetalPriceComponent {
  constructor(component) {
    super();
    this.component = component;
  }

  async getPrice() {
    return await this.component.getPrice();
  }
}

// ----------------------
// Error Handling Decorator
// ----------------------
class SafeMetalFetcher extends MetalPriceDecorator {
  async getPrice() {
    try {
      return await super.getPrice();
    } catch (err) {
      console.error("Metal fetch error:", err);
      return null; // fail safely
    }
  }
}

// ----------------------
// React Component
// ----------------------
export function Stock() {
  const [dataPoints, setDataPoints] = useState([]);
  const intervalRef = useRef(null);

  // Instantiate metals with decorators
  const goldService = new SafeMetalFetcher(new GoldFetcher());
  const silverService = new SafeMetalFetcher(new SilverFetcher());
  const tiberiumService = new SafeMetalFetcher(new TiberiumFetcher());

  const fetchPrices = async () => {
    const time = new Date().toLocaleTimeString();

    const [goldPrice, silverPrice, tiberiumPrice] = await Promise.all([
      goldService.getPrice(),
      silverService.getPrice(),
      tiberiumService.getPrice()
    ]);

    setDataPoints(prev => [
      ...prev.slice(-49), // keep last 50 points
      {
        time,
        gold: goldPrice,
        silver: silverPrice,
        tiberium: tiberiumPrice
      }
    ]);
  };

  useEffect(() => {
    fetchPrices(); // initial fetch
    intervalRef.current = setInterval(fetchPrices, 10000); // update every 10s
    return () => clearInterval(intervalRef.current);
  }, []);

  if (dataPoints.length === 0) {
    return <div style={{ padding: '2rem' }}>Loading live metals chart...</div>;
  }

  const chartData = {
    labels: dataPoints.map(dp => dp.time),
    datasets: [
      {
        label: 'Gold (USD/oz)',
        data: dataPoints.map(dp => dp.gold),
        fill: false,
        borderColor: '#DAA520',
        backgroundColor: '#FFD700',
        tension: 0.2,
        pointRadius: 3
      },
      {
        label: 'Silver (USD/oz)',
        data: dataPoints.map(dp => dp.silver),
        fill: false,
        borderColor: '#C0C0C0',
        backgroundColor: '#B0B0B0',
        tension: 0.2,
        pointRadius: 3
      },
      {
        label: 'Tiberium (Fake USD)',
        data: dataPoints.map(dp => dp.tiberium),
        fill: false,
        borderColor: '#00FF00',
        backgroundColor: '#00AA00',
        tension: 0.2,
        pointRadius: 3
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: true, text: 'Live Metal Prices', font: { size: 24 } },
      legend: { display: true, position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { ticks: { font: { size: 14 } } },
      y: {
        ticks: { font: { size: 14 } },
        title: { display: true, text: 'Price (USD/oz)', font: { size: 16 } }
      }
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', height: '600px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
