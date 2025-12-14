import Plot from 'react-plotly.js';
import { DataPoint2D } from '../ml/ILinearRegression';

interface ScatterChart3DProps {
  data: DataPoint2D[];
  regressionPlane?: { slope1: number; slope2: number; intercept: number } | null;
}

export function ScatterChart3D({ data, regressionPlane }: ScatterChart3DProps) {
  // Scatter plot data
  const scatterData = {
    x: data.map(d => d.x1),
    y: data.map(d => d.x2),
    z: data.map(d => d.y),
    mode: 'markers',
    type: 'scatter3d',
    name: 'Training Data',
    marker: {
      size: 5,
      color: 'rgb(75, 192, 192)',
      opacity: 0.8,
    },
  };

  const plotData: any[] = [scatterData];

  // Add regression plane if available
  if (regressionPlane) {
    const { slope1, slope2, intercept } = regressionPlane;

    // Create a grid for the plane
    const x1Range = [Math.min(...data.map(d => d.x1)) - 2, Math.max(...data.map(d => d.x1)) + 2];
    const x2Range = [Math.min(...data.map(d => d.x2)) - 1, Math.max(...data.map(d => d.x2)) + 1];

    const x1Grid: number[] = [];
    const x2Grid: number[] = [];
    const zGrid: number[][] = [];

    const gridSize = 20;
    for (let i = 0; i < gridSize; i++) {
      x1Grid.push(x1Range[0] + (i / (gridSize - 1)) * (x1Range[1] - x1Range[0]));
      x2Grid.push(x2Range[0] + (i / (gridSize - 1)) * (x2Range[1] - x2Range[0]));
    }

    for (let i = 0; i < gridSize; i++) {
      const row: number[] = [];
      for (let j = 0; j < gridSize; j++) {
        const z = slope1 * x1Grid[j] + slope2 * x2Grid[i] + intercept;
        row.push(z);
      }
      zGrid.push(row);
    }

    const planeData = {
      x: x1Grid,
      y: x2Grid,
      z: zGrid,
      type: 'surface',
      name: 'Regression Plane',
      opacity: 0.7,
      colorscale: [
        [0, 'rgb(99, 110, 250)'],
        [1, 'rgb(239, 85, 59)'],
      ],
      showscale: false,
    };

    plotData.push(planeData);
  }

  return (
    <div className="chart-container">
      <h3>3D Visualization</h3>
      <Plot
        data={plotData}
        layout={{
          autosize: true,
          scene: {
            xaxis: { title: { text: 'Temperature (°C)' } },
            yaxis: { title: { text: 'Unemployment (%)' } },
            zaxis: { title: { text: 'Sales' } },
          },
          margin: { l: 0, r: 0, t: 0, b: 0 },
          showlegend: true,
          legend: { x: 0, y: 1 },
        }}
        config={{ responsive: true }}
        style={{ width: '100%', height: '500px' }}
      />
      {regressionPlane && (
        <div className="equation">
          <strong>Equation:</strong> Sales = {regressionPlane.slope1.toFixed(2)} × Temperature{' '}
          {regressionPlane.slope2 >= 0 ? '+' : ''} {regressionPlane.slope2.toFixed(2)} × Unemployment{' '}
          {regressionPlane.intercept >= 0 ? '+' : ''} {regressionPlane.intercept.toFixed(2)}
        </div>
      )}
    </div>
  );
}
