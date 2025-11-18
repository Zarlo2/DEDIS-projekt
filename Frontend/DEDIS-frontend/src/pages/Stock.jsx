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

export function Stock() {
  const [dataPoints, setDataPoints] = useState([]);
  const intervalRef = useRef(null);

  const fetchGoldPrice = async () => {
    try {
      const res = await fetch('/api/gold');
      const json = await res.json();

      if (!json.price) return; // skip if no price

      const price = parseFloat(json.price);
      const time = new Date().toLocaleTimeString();

      setDataPoints(prev => [...prev.slice(-49), { time, price }]); // keep last 50 points
    } catch (err) {
      console.error('Error fetching gold price:', err);
    }
  };

  useEffect(() => {
    fetchGoldPrice(); // initial fetch
    intervalRef.current = setInterval(fetchGoldPrice, 10000); // every 10 seconds
    return () => clearInterval(intervalRef.current);
  }, []);

  if (dataPoints.length === 0) {
    return <div style={{ padding: '2rem' }}>Loading live gold chart...</div>;
  }

  const chartData = {
    labels: dataPoints.map(dp => dp.time),
    datasets: [
      {
        label: 'Gold Price (USD/oz)',
        data: dataPoints.map(dp => dp.price),
        fill: false,
        borderColor: '#DAA520',
        backgroundColor: '#FFD700',
        tension: 0.2,
        pointRadius: 3
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: true, text: 'Live Gold Price (USD/oz)', font: { size: 24 } },
      legend: { display: false },
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
      <h1 style={{ marginBottom: '1rem' }}>Live Gold Price Chart</h1>
      <Line data={chartData} options={options} />
    </div>
  );
}
