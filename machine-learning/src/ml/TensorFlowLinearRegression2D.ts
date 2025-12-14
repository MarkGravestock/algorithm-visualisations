import * as tf from '@tensorflow/tfjs';
import { ILinearRegression2D, DataPoint2D, ProgressCallback } from './ILinearRegression';

export class TensorFlowLinearRegression2D implements ILinearRegression2D {
  private model: tf.Sequential | null = null;
  private slope1 = 0;
  private slope2 = 0;
  private x1Mean = 0;
  private x1Std = 1;
  private x2Mean = 0;
  private x2Std = 1;
  private yMean = 0;
  private yStd = 1;

  private normalize(data: DataPoint2D[]): DataPoint2D[] {
    const n = data.length;

    // Calculate means
    this.x1Mean = data.reduce((sum, p) => sum + p.x1, 0) / n;
    this.x2Mean = data.reduce((sum, p) => sum + p.x2, 0) / n;
    this.yMean = data.reduce((sum, p) => sum + p.y, 0) / n;

    // Calculate standard deviations
    const x1Variance = data.reduce((sum, p) => sum + Math.pow(p.x1 - this.x1Mean, 2), 0) / n;
    const x2Variance = data.reduce((sum, p) => sum + Math.pow(p.x2 - this.x2Mean, 2), 0) / n;
    const yVariance = data.reduce((sum, p) => sum + Math.pow(p.y - this.yMean, 2), 0) / n;

    this.x1Std = Math.sqrt(x1Variance) || 1;
    this.x2Std = Math.sqrt(x2Variance) || 1;
    this.yStd = Math.sqrt(yVariance) || 1;

    // Normalize data
    return data.map(p => ({
      x1: (p.x1 - this.x1Mean) / this.x1Std,
      x2: (p.x2 - this.x2Mean) / this.x2Std,
      y: (p.y - this.yMean) / this.yStd,
    }));
  }

  private createModel(learningRate: number): tf.Sequential {
    const model = tf.sequential();
    model.add(
      tf.layers.dense({
        units: 1,
        inputShape: [2], // Two input features
        useBias: true,
        kernelInitializer: 'zeros',
        biasInitializer: 'zeros',
      })
    );
    model.compile({
      optimizer: tf.train.sgd(learningRate),
      loss: 'meanSquaredError',
    });
    return model;
  }

  async train(
    data: DataPoint2D[],
    epochs: number,
    learningRate: number = 0.01,
    onProgress?: ProgressCallback,
    iterationDelay: number = 0
  ): Promise<void> {
    // Dispose of old model if exists
    if (this.model) {
      this.model.dispose();
    }

    // Normalize data
    const normalizedData = this.normalize(data);

    this.model = this.createModel(learningRate);

    // Prepare tensors (2 input features)
    const xs = tf.tensor2d(normalizedData.map((d) => [d.x1, d.x2]));
    const ys = tf.tensor2d(normalizedData.map((d) => [d.y]));

    let shouldStop = false;

    // Train with progress callbacks
    await this.model.fit(xs, ys, {
      epochs,
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          // Extract weights
          const weights = this.model!.getWeights();
          const slopeData = await weights[0].data();

          // Store normalized slope parameters
          this.slope1 = slopeData[0];
          this.slope2 = slopeData[1];

          if (onProgress && logs) {
            const denormalized = this.getDenormalizedParameters();
            const shouldContinue = onProgress({
              coefficients: [denormalized.slope1, denormalized.slope2],
              intercept: denormalized.intercept,
              loss: (logs.loss as number) * this.yStd * this.yStd,
              iteration: epoch + 1,
            });

            // Check if training should be stopped
            if (shouldContinue === false) {
              shouldStop = true;
              this.model!.stopTraining = true;
            }
          }

          // Delay to allow UI updates (only if not stopping)
          if (!shouldStop) {
            if (iterationDelay > 0) {
              await new Promise((resolve) => setTimeout(resolve, iterationDelay));
            } else {
              // Always allow UI to update
              await tf.nextFrame();
            }
          }
        },
      },
    });

    // Cleanup tensors
    xs.dispose();
    ys.dispose();
  }

  private getDenormalizedParameters(): { slope1: number; slope2: number; intercept: number } {
    const denormalizedSlope1 = (this.slope1 * this.yStd) / this.x1Std;
    const denormalizedSlope2 = (this.slope2 * this.yStd) / this.x2Std;
    const denormalizedIntercept =
      this.yMean - denormalizedSlope1 * this.x1Mean - denormalizedSlope2 * this.x2Mean;
    return { slope1: denormalizedSlope1, slope2: denormalizedSlope2, intercept: denormalizedIntercept };
  }

  predict(x1: number, x2: number): number {
    if (!this.model) {
      return 0;
    }

    const result = tf.tidy(() => {
      // Normalize inputs
      const normalizedX1 = (x1 - this.x1Mean) / this.x1Std;
      const normalizedX2 = (x2 - this.x2Mean) / this.x2Std;
      const input = tf.tensor2d([[normalizedX1, normalizedX2]]);
      const prediction = this.model!.predict(input) as tf.Tensor;
      const normalizedY = prediction.dataSync()[0];
      // Denormalize output
      return normalizedY * this.yStd + this.yMean;
    });

    return result;
  }

  getParameters(): { slope1: number; slope2: number; intercept: number } {
    return this.getDenormalizedParameters();
  }

  reset(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.slope1 = 0;
    this.slope2 = 0;
    this.x1Mean = 0;
    this.x1Std = 1;
    this.x2Mean = 0;
    this.x2Std = 1;
    this.yMean = 0;
    this.yStd = 1;
  }
}
