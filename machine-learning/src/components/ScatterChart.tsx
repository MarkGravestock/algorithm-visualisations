import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { DataPoint } from '../ml/ILinearRegression';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ScatterChartProps {
  data: DataPoint[];
  regressionLine?: { slope: number; intercept: number };
  predictionPoint?: DataPoint;
}

export function ScatterChart({ data, regressionLine, predictionPoint }: ScatterChartProps) {
  const chartRef = useRef<ChartJS<'scatter'>>(null);

  useEffect(() => {
    // Force chart update when props change
    chartRef.current?.update();
  }, [data, regressionLine, predictionPoint]);

  const datasets = [
    {
      label: 'Training Data',
      data: data.map((point) => ({ x: point.x, y: point.y })),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      pointRadius: 5,
    },
  ];

  // Add regression line if available
  if (regressionLine && data.length > 0) {
    const minX = Math.min(...data.map((d) => d.x));
    const maxX = Math.max(...data.map((d) => d.x));

    const linePoints = [
      { x: minX, y: regressionLine.slope * minX + regressionLine.intercept },
      { x: maxX, y: regressionLine.slope * maxX + regressionLine.intercept },
    ];

    datasets.push({
      label: 'Regression Line',
      data: linePoints,
      backgroundColor: 'rgba(255, 99, 132, 0)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2,
      pointRadius: 0,
      showLine: true,
      type: 'line',
    } as any);
  }

  // Add prediction point if available
  if (predictionPoint) {
    datasets.push({
      label: 'Prediction',
      data: [{ x: predictionPoint.x, y: predictionPoint.y }],
      backgroundColor: 'rgba(255, 206, 86, 0.8)',
      borderColor: 'rgba(255, 206, 86, 1)',
      pointRadius: 8,
    } as any);
  }

  const options: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Ice Cream Sales vs Temperature',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Temperature (°C)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Ice Cream Sales',
        },
      },
    },
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Scatter ref={chartRef} data={{ datasets }} options={options} />
    </div>
  );
}
