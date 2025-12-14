import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';

interface LossChartProps {
  lossHistory: (number | null)[];
}

export function LossChart({ lossHistory }: LossChartProps) {
  const data = {
    labels: lossHistory.map((_, i) => i + 1),
    datasets: [
      {
        label: 'Loss (MSE)',
        data: lossHistory,
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.1,
        spanGaps: false, // Don't connect lines over null values
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0, // Disable animation for smoother real-time updates
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Training Loss Over Time',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Iteration',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Loss',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}
