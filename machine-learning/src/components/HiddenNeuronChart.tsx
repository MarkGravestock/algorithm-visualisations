import { ChartDataset, ChartOptions } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { ForwardPass } from '../ml/INeuralNetwork';

interface HiddenNeuronChartProps {
  // Forward passes across the temperature range
  passes: { temperature: number; pass: ForwardPass }[];
  probeTemperature: number;
}

const COLOURS = ['#2196F3', '#9C27B0', '#4CAF50', '#E91E63'];

// What each hidden neuron outputs as the temperature changes: the building blocks the output neuron adds together
export function HiddenNeuronChart({ passes, probeTemperature }: HiddenNeuronChartProps) {
  const hiddenLayerCount = passes[0].pass.layerOutputs.length - 2;
  const datasets: ChartDataset<'scatter'>[] = [];

  for (let layer = 1; layer <= hiddenLayerCount; layer++) {
    passes[0].pass.layerOutputs[layer].forEach((_, neuron) => {
      const colour = COLOURS[datasets.length % COLOURS.length];
      datasets.push({
        label: `Layer ${layer}, neuron ${String.fromCharCode(65 + neuron)}`,
        data: passes.map(({ temperature, pass }) => ({ x: temperature, y: pass.layerOutputs[layer][neuron] })),
        borderColor: colour,
        backgroundColor: colour,
        borderWidth: 2,
        borderDash: layer === 1 ? [5, 4] : undefined,
        pointRadius: 0,
        showLine: true,
      });
    });
  }

  // Vertical marker at the temperature shown in the network diagram
  const allOutputs = datasets.flatMap((dataset) => dataset.data.map((point) => (point as { y: number }).y));
  datasets.push({
    label: 'Diagram temperature',
    data: [
      { x: probeTemperature, y: Math.min(...allOutputs) },
      { x: probeTemperature, y: Math.max(...allOutputs) },
    ],
    borderColor: 'rgba(255, 170, 0, 0.9)',
    backgroundColor: 'rgba(255, 170, 0, 0.9)',
    borderWidth: 2,
    pointRadius: 0,
    showLine: true,
  });

  const options: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'What Each Hidden Neuron Responds To' },
      tooltip: { enabled: false },
    },
    scales: {
      x: {
        title: { display: true, text: 'Temperature (°C)' },
        min: passes[0].temperature,
        max: passes[passes.length - 1].temperature,
      },
      y: { title: { display: true, text: 'Neuron Output' } },
    },
  };

  return (
    <div style={{ height: '320px', width: '100%' }}>
      <Scatter data={{ datasets }} options={options} />
    </div>
  );
}
