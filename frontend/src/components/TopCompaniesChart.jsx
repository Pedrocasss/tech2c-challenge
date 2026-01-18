import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';

export default function TopCompaniesChart({ data }) {
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
    labels: data.map(item => item.company),
    datasets: [
      {
        label: 'Emissões Totais (toneladas)',
        data: data.map(item => item.totalEmissions),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top 5 Empresas com Maiores Emissões',
        font: {
          size: 16,
          weight: 'bold',
        },
        color: isDark ? '#ffffff' : '#111827'
      },
    },
    scales: {
      x: {
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
      y: {
        ticks: {
          color: isDark ? '#ffffff' : '#6b7280'
        },
        grid: {
          color: isDark ? '#374151' : '#e5e7eb'
        }
      }
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