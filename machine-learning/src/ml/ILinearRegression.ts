// Single variable data point (temperature -> sales)
export interface DataPoint {
  x: number;
  y: number;
}

// Multi-variable data point (temperature, unemployment -> sales)
export interface DataPoint2D {
  x1: number; // temperature
  x2: number; // unemployment rate
  y: number;  // sales
}

export interface TrainingState {
  coefficients: number[]; // [slope1, slope2, ...] or just [slope] for 1D
  intercept: number;
  loss: number;
  iteration: number;
}

export type ProgressCallback = (state: TrainingState) => boolean | void;

export interface ILinearRegression {
  train(
    data: DataPoint[],
    epochs: number,
    learningRate: number,
    onProgress?: ProgressCallback,
    iterationDelay?: number
  ): Promise<void>;

  predict(x: number): number;

  getParameters(): { slope: number; intercept: number };

  reset(): void;
}

export interface ILinearRegression2D {
  train(
    data: DataPoint2D[],
    epochs: number,
    learningRate: number,
    onProgress?: ProgressCallback,
    iterationDelay?: number
  ): Promise<void>;

  predict(x1: number, x2: number): number;

  getParameters(): { slope1: number; slope2: number; intercept: number };

  reset(): void;
}
