import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function EmissionsChart({ data }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const chartData = {
    labels: data.map(item => item.year),
    datasets: [
      {
        label: 'Emissões de CO₂ (toneladas)',
        data: data.map(item => item.emissions),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? '#ffffff' : '#374151'
        }
      },
      title: {
        display: true,
        text: 'Emissões Totais de CO₂ por Ano',
        font: {
          size: 16,
          weight: 'bold',
        },
        color: isDark ? '#ffffff' : '#111827'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString() + ' ton';
          },
          color: isDark ? '#ffffff' : '#6b7280'
        },
        grid: {
          color: isDark ? '#374151' : '#e5e7eb'
        }
      },
      x: {
        ticks: {
          color: isDark ? '#ffffff' : '#6b7280'
        },
        grid: {
          color: isDark ? '#374151' : '#e5e7eb'
        }
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
      <div style={{ height: '400px' }}>
        <Bar key={isDark ? 'dark' : 'light'} data={chartData} options={options} />
      </div>
    </div>
  );
}