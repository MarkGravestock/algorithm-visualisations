import { ILinearRegression2D, DataPoint2D, ProgressCallback } from './ILinearRegression';

export class CustomLinearRegression2D implements ILinearRegression2D {
  private temperatureCoefficient = 0;
  private unemploymentCoefficient = 0;
  private intercept = 0;
  private temperatureMean = 0;
  private temperatureStd = 1;
  private unemploymentMean = 0;
  private unemploymentStd = 1;
  private salesMean = 0;
  private salesStd = 1;

  private normalizeDataForStableTraining(data: DataPoint2D[]): DataPoint2D[] {
    this.calculateNormalizationStatistics(data);
    return this.applyZScoreNormalization(data);
  }

  private calculateNormalizationStatistics(data: DataPoint2D[]): void {
    this.temperatureMean = this.calculateMean(data, p => p.x1);
    this.unemploymentMean = this.calculateMean(data, p => p.x2);
    this.salesMean = this.calculateMean(data, p => p.y);

    const temperatureVariance = this.calculateVariance(data, p => p.x1, this.temperatureMean);
    const unemploymentVariance = this.calculateVariance(data, p => p.x2, this.unemploymentMean);
    const salesVariance = this.calculateVariance(data, p => p.y, this.salesMean);

    this.temperatureStd = Math.sqrt(temperatureVariance) || 1;
    this.unemploymentStd = Math.sqrt(unemploymentVariance) || 1;
    this.salesStd = Math.sqrt(salesVariance) || 1;
  }

  private calculateMean(data: DataPoint2D[], selector: (p: DataPoint2D) => number): number {
    const sum = data.reduce((acc, p) => acc + selector(p), 0);
    return sum / data.length;
  }

  private calculateVariance(data: DataPoint2D[], selector: (p: DataPoint2D) => number, mean: number): number {
    const squaredDifferences = data.reduce((acc, p) => {
      const diff = selector(p) - mean;
      return acc + diff * diff;
    }, 0);
    return squaredDifferences / data.length;
  }

  private applyZScoreNormalization(data: DataPoint2D[]): DataPoint2D[] {
    return data.map(p => ({
      x1: (p.x1 - this.temperatureMean) / this.temperatureStd,
      x2: (p.x2 - this.unemploymentMean) / this.unemploymentStd,
      y: (p.y - this.salesMean) / this.salesStd,
    }));
  }

  async train(
    data: DataPoint2D[],
    epochs: number,
    learningRate: number = 0.01,
    onProgress?: ProgressCallback,
    iterationDelay: number = 0
  ): Promise<void> {
    const normalizedData = this.normalizeDataForStableTraining(data);

    for (let epoch = 0; epoch < epochs; epoch++) {
      const gradients = this.calculateGradientsAndLoss(normalizedData);
      this.updateParametersUsingGradientDescent(gradients, learningRate, data.length);

      const shouldStop = await this.reportProgressAndCheckIfShouldStop(
        gradients.meanLoss,
        epoch + 1,
        onProgress,
        iterationDelay
      );

      if (shouldStop) break;
    }
  }

  private calculateGradientsAndLoss(normalizedData: DataPoint2D[]): {
    temperatureGradient: number;
    unemploymentGradient: number;
    interceptGradient: number;
    meanLoss: number;
  } {
    let temperatureGradient = 0;
    let unemploymentGradient = 0;
    let interceptGradient = 0;
    let totalLoss = 0;

    for (const point of normalizedData) {
      const prediction = this.temperatureCoefficient * point.x1 +
                        this.unemploymentCoefficient * point.x2 +
                        this.intercept;
      const error = prediction - point.y;

      temperatureGradient += error * point.x1;
      unemploymentGradient += error * point.x2;
      interceptGradient += error;
      totalLoss += error * error;
    }

    return {
      temperatureGradient,
      unemploymentGradient,
      interceptGradient,
      meanLoss: totalLoss / normalizedData.length,
    };
  }

  private updateParametersUsingGradientDescent(
    gradients: {
      temperatureGradient: number;
      unemploymentGradient: number;
      interceptGradient: number;
    },
    learningRate: number,
    dataSize: number
  ): void {
    this.temperatureCoefficient -= (learningRate * gradients.temperatureGradient) / dataSize;
    this.unemploymentCoefficient -= (learningRate * gradients.unemploymentGradient) / dataSize;
    this.intercept -= (learningRate * gradients.interceptGradient) / dataSize;
  }

  private async reportProgressAndCheckIfShouldStop(
    normalizedLoss: number,
    iteration: number,
    onProgress?: ProgressCallback,
    iterationDelay: number = 0
  ): Promise<boolean> {
    if (!onProgress) return false;

    const denormalizedParams = this.convertToOriginalScale();
    const denormalizedLoss = normalizedLoss * this.salesStd * this.salesStd;

    const shouldContinue = onProgress({
      coefficients: [denormalizedParams.slope1, denormalizedParams.slope2],
      intercept: denormalizedParams.intercept,
      loss: denormalizedLoss,
      iteration,
    });

    await this.allowUIUpdateWithDelay(iterationDelay);

    return shouldContinue === false;
  }

  private async allowUIUpdateWithDelay(iterationDelay: number): Promise<void> {
    const delay = iterationDelay > 0 ? iterationDelay : 0;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  private convertToOriginalScale(): { slope1: number; slope2: number; intercept: number } {
    const slope1 = (this.temperatureCoefficient * this.salesStd) / this.temperatureStd;
    const slope2 = (this.unemploymentCoefficient * this.salesStd) / this.unemploymentStd;
    const intercept = this.salesMean - slope1 * this.temperatureMean - slope2 * this.unemploymentMean;

    return { slope1, slope2, intercept };
  }

  predict(temperature: number, unemployment: number): number {
    const normalizedTemperature = (temperature - this.temperatureMean) / this.temperatureStd;
    const normalizedUnemployment = (unemployment - this.unemploymentMean) / this.unemploymentStd;
    const normalizedSales = this.temperatureCoefficient * normalizedTemperature +
                           this.unemploymentCoefficient * normalizedUnemployment +
                           this.intercept;
    return normalizedSales * this.salesStd + this.salesMean;
  }

  getParameters(): { slope1: number; slope2: number; intercept: number } {
    return this.convertToOriginalScale();
  }

  reset(): void {
    this.temperatureCoefficient = 0;
    this.unemploymentCoefficient = 0;
    this.intercept = 0;
    this.temperatureMean = 0;
    this.temperatureStd = 1;
    this.unemploymentMean = 0;
    this.unemploymentStd = 1;
    this.salesMean = 0;
    this.salesStd = 1;
  }
}
