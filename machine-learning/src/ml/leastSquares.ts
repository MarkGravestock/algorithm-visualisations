import { DataPoint } from './ILinearRegression';

// The best possible straight line (ordinary least squares), used as a baseline the network has to beat
export function fitStraightLine(data: DataPoint[]): { slope: number; intercept: number } {
  const n = data.length;
  const xMean = data.reduce((sum, p) => sum + p.x, 0) / n;
  const yMean = data.reduce((sum, p) => sum + p.y, 0) / n;
  const covariance = data.reduce((sum, p) => sum + (p.x - xMean) * (p.y - yMean), 0);
  const xVariance = data.reduce((sum, p) => sum + (p.x - xMean) ** 2, 0);
  const slope = xVariance === 0 ? 0 : covariance / xVariance;
  return { slope, intercept: yMean - slope * xMean };
}

export function meanSquaredError(data: DataPoint[], predict: (x: number) => number): number {
  return data.reduce((sum, p) => sum + (predict(p.x) - p.y) ** 2, 0) / data.length;
}
