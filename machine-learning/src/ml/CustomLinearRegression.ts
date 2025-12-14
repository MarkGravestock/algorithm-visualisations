import { ILinearRegression, DataPoint, ProgressCallback } from './ILinearRegression';

export class CustomLinearRegression implements ILinearRegression {
  private slope = 0;
  private intercept = 0;
  private temperatureMean = 0;
  private temperatureStd = 1;
  private salesMean = 0;
  private salesStd = 1;

  private normalizeDataForStableTraining(data: DataPoint[]): DataPoint[] {
    this.calculateNormalizationStatistics(data);
    return this.applyZScoreNormalization(data);
  }

  private calculateNormalizationStatistics(data: DataPoint[]): void {
    this.temperatureMean = this.calculateMean(data, p => p.x);
    this.salesMean = this.calculateMean(data, p => p.y);

    const temperatureVariance = this.calculateVariance(data, p => p.x, this.temperatureMean);
    const salesVariance = this.calculateVariance(data, p => p.y, this.salesMean);

    this.temperatureStd = Math.sqrt(temperatureVariance) || 1;
    this.salesStd = Math.sqrt(salesVariance) || 1;
  }

  private calculateMean(data: DataPoint[], selector: (p: DataPoint) => number): number {
    const sum = data.reduce((acc, p) => acc + selector(p), 0);
    return sum / data.length;
  }

  private calculateVariance(data: DataPoint[], selector: (p: DataPoint) => number, mean: number): number {
    const squaredDifferences = data.reduce((acc, p) => {
      const diff = selector(p) - mean;
      return acc + diff * diff;
    }, 0);
    return squaredDifferences / data.length;
  }

  private applyZScoreNormalization(data: DataPoint[]): DataPoint[] {
    return data.map(p => ({
      x: (p.x - this.temperatureMean) / this.temperatureStd,
      y: (p.y - this.salesMean) / this.salesStd,
    }));
  }

  async train(
    data: DataPoint[],
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

  private calculateGradientsAndLoss(normalizedData: DataPoint[]): {
    slopeGradient: number;
    interceptGradient: number;
    meanLoss: number;
  } {
    let slopeGradient = 0;
    let interceptGradient = 0;
    let totalLoss = 0;

    for (const point of normalizedData) {
      const prediction = this.slope * point.x + this.intercept;
      const error = prediction - point.y;

      slopeGradient += error * point.x;
      interceptGradient += error;
      totalLoss += error * error;
    }

    return {
      slopeGradient,
      interceptGradient,
      meanLoss: totalLoss / normalizedData.length,
    };
  }

  private updateParametersUsingGradientDescent(
    gradients: { slopeGradient: number; interceptGradient: number },
    learningRate: number,
    dataSize: number
  ): void {
    this.slope -= (learningRate * gradients.slopeGradient) / dataSize;
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
      coefficients: [denormalizedParams.slope],
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

  private convertToOriginalScale(): { slope: number; intercept: number } {
    const slope = (this.slope * this.salesStd) / this.temperatureStd;
    const intercept = this.salesMean - slope * this.temperatureMean;
    return { slope, intercept };
  }

  predict(temperature: number): number {
    const normalizedTemperature = (temperature - this.temperatureMean) / this.temperatureStd;
    const normalizedSales = this.slope * normalizedTemperature + this.intercept;
    return normalizedSales * this.salesStd + this.salesMean;
  }

  getParameters(): { slope: number; intercept: number } {
    return this.convertToOriginalScale();
  }

  reset(): void {
    this.slope = 0;
    this.intercept = 0;
    this.temperatureMean = 0;
    this.temperatureStd = 1;
    this.salesMean = 0;
    this.salesStd = 1;
  }
}
