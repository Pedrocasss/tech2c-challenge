import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SectorChart({ data }) {
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
  labels: data.map(item => item.sector),
  datasets: [
    {
      label: 'Emissões por Setor',
      data: data.map(item => item.totalEmissions),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',   // Blue
        'rgba(16, 185, 129, 0.8)',   // Green
        'rgba(249, 115, 22, 0.8)',   // Orange
        'rgba(139, 92, 246, 0.8)',   // Purple
        'rgba(236, 72, 153, 0.8)',   // Pink
        'rgba(234, 179, 8, 0.8)',    // Yellow
        'rgba(14, 165, 233, 0.8)',   // Cyan
        'rgba(239, 68, 68, 0.8)',    // Red
        'rgba(132, 204, 22, 0.8)',   // Lime
        'rgba(168, 85, 247, 0.8)',   // Violet
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(249, 115, 22, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(236, 72, 153, 1)',
        'rgba(234, 179, 8, 1)',
        'rgba(14, 165, 233, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(132, 204, 22, 1)',
        'rgba(168, 85, 247, 1)',
      ],
      borderWidth: 2,
    },
  ],
};

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDark ? '#ffffff' : '#374151'
        }
      },
      title: {
        display: true,
        text: 'Distribuição de Emissões por Setor',
        font: {
          size: 16,
          weight: 'bold',
        },
        color: isDark ? '#ffffff' : '#111827'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.toLocaleString() + ' toneladas';
            return label;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
      <div style={{ height: '400px' }}>
        <Doughnut key={isDark ? 'dark' : 'light'} data={chartData} options={options} />
      </div>
    </div>
  );
}