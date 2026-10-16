import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartDataset,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { DataPoint } from '../ml/ILinearRegression';

ChartJS.register(LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface NeuralNetworkChartProps {
  data: DataPoint[];
  networkCurve?: DataPoint[];
  straightLine?: DataPoint[];
  predictionPoint?: DataPoint;
}

export function NeuralNetworkChart({ data, networkCurve, straightLine, predictionPoint }: NeuralNetworkChartProps) {
  const datasets: ChartDataset<'scatter'>[] = [
    {
      label: 'Training Data',
      data,
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      pointRadius: 5,
    },
  ];

  if (networkCurve) {
    datasets.push({
      label: 'Neural Network',
      data: networkCurve,
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0)',
      borderWidth: 3,
      pointRadius: 0,
      showLine: true,
    });
  }

  if (straightLine) {
    datasets.push({
      label: 'Best Straight Line',
      data: straightLine,
      borderColor: 'rgba(120, 120, 120, 0.8)',
      backgroundColor: 'rgba(120, 120, 120, 0)',
      borderWidth: 2,
      borderDash: [6, 6],
      pointRadius: 0,
      showLine: true,
    });
  }

  if (predictionPoint) {
    datasets.push({
      label: 'Prediction',
      data: [predictionPoint],
      backgroundColor: 'rgba(255, 206, 86, 0.9)',
      borderColor: 'rgba(255, 170, 0, 1)',
      pointRadius: 8,
    });
  }

  const options: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Ice Cream Sales vs Temperature (with a heatwave)' },
    },
    scales: {
      x: { title: { display: true, text: 'Temperature (°C)' } },
      y: { title: { display: true, text: 'Ice Cream Sales' } },
    },
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Scatter data={{ datasets }} options={options} />
    </div>
  );
}
