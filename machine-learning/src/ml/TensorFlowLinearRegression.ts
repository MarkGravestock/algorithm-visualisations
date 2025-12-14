import * as tf from '@tensorflow/tfjs';
import { ILinearRegression, DataPoint, ProgressCallback } from './ILinearRegression';

export class TensorFlowLinearRegression implements ILinearRegression {
  private model: tf.Sequential | null = null;
  private slope = 0;
  private xMean = 0;
  private xStd = 1;
  private yMean = 0;
  private yStd = 1;

  private normalize(data: DataPoint[]): DataPoint[] {
    const n = data.length;

    // Calculate means
    this.xMean = data.reduce((sum, p) => sum + p.x, 0) / n;
    this.yMean = data.reduce((sum, p) => sum + p.y, 0) / n;

    // Calculate standard deviations
    const xVariance = data.reduce((sum, p) => sum + Math.pow(p.x - this.xMean, 2), 0) / n;
    const yVariance = data.reduce((sum, p) => sum + Math.pow(p.y - this.yMean, 2), 0) / n;

    this.xStd = Math.sqrt(xVariance) || 1;
    this.yStd = Math.sqrt(yVariance) || 1;

    // Normalize data
    return data.map(p => ({
      x: (p.x - this.xMean) / this.xStd,
      y: (p.y - this.yMean) / this.yStd,
    }));
  }

  private createModel(learningRate: number): tf.Sequential {
    const model = tf.sequential();
    model.add(
      tf.layers.dense({
        units: 1,
        inputShape: [1],
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
    data: DataPoint[],
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

    // Prepare tensors
    const xs = tf.tensor2d(normalizedData.map((d) => [d.x]));
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

          // Store normalized slope parameter
          this.slope = slopeData[0];

          if (onProgress && logs) {
            const denormalized = this.getDenormalizedParameters();
            const shouldContinue = onProgress({
              coefficients: [denormalized.slope],
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

  private getDenormalizedParameters(): { slope: number; intercept: number } {
    const denormalizedSlope = (this.slope * this.yStd) / this.xStd;
    const denormalizedIntercept = this.yMean - denormalizedSlope * this.xMean;
    return { slope: denormalizedSlope, intercept: denormalizedIntercept };
  }

  predict(x: number): number {
    if (!this.model) {
      return 0;
    }

    const result = tf.tidy(() => {
      // Normalize input
      const normalizedX = (x - this.xMean) / this.xStd;
      const input = tf.tensor2d([[normalizedX]]);
      const prediction = this.model!.predict(input) as tf.Tensor;
      const normalizedY = prediction.dataSync()[0];
      // Denormalize output
      return normalizedY * this.yStd + this.yMean;
    });

    return result;
  }

  getParameters(): { slope: number; intercept: number } {
    return this.getDenormalizedParameters();
  }

  reset(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.slope = 0;
    this.xMean = 0;
    this.xStd = 1;
    this.yMean = 0;
    this.yStd = 1;
  }
}
