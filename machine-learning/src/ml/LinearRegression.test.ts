import { describe, it, expect, beforeEach } from 'vitest';
import { ILinearRegression, ILinearRegression2D, DataPoint, DataPoint2D } from './ILinearRegression';
import { CustomLinearRegression } from './CustomLinearRegression';
import { TensorFlowLinearRegression } from './TensorFlowLinearRegression';
import { CustomLinearRegression2D } from './CustomLinearRegression2D';
import { TensorFlowLinearRegression2D } from './TensorFlowLinearRegression2D';

// Shared test suite that works with any implementation
function testLinearRegression(name: string, createModel: () => ILinearRegression) {
  describe(name, () => {
    let model: ILinearRegression;

    beforeEach(() => {
      model = createModel();
    });

    it('should initialize with zero parameters', () => {
      const params = model.getParameters();
      expect(params.slope).toBe(0);
      expect(params.intercept).toBe(0);
    });

    it('should learn a simple linear relationship: y = 2x + 3', async () => {
      // Perfect linear data: y = 2x + 3
      const data: DataPoint[] = [
        { x: 1, y: 5 },
        { x: 2, y: 7 },
        { x: 3, y: 9 },
        { x: 4, y: 11 },
        { x: 5, y: 13 },
      ];

      await model.train(data, 1000, 0.01);

      const params = model.getParameters();

      // Should be close to slope=2, intercept=3
      expect(params.slope).toBeCloseTo(2, 1);
      expect(params.intercept).toBeCloseTo(3, 1);

      // Test prediction
      const prediction = model.predict(6);
      expect(prediction).toBeCloseTo(15, 0); // 2*6 + 3 = 15
    });

    it('should learn ice cream sales relationship', async () => {
      // Simulated ice cream data: sales ≈ 2 * temp + 30
      const data: DataPoint[] = [
        { x: 15, y: 60 },
        { x: 20, y: 70 },
        { x: 25, y: 80 },
        { x: 30, y: 90 },
        { x: 35, y: 100 },
      ];

      await model.train(data, 1000, 0.01);

      const params = model.getParameters();

      // Should learn approximately slope=2, intercept=30
      expect(params.slope).toBeCloseTo(2, 0);
      expect(params.intercept).toBeCloseTo(30, 0);
    });

    it('should reduce loss over training iterations', async () => {
      const data: DataPoint[] = [
        { x: 1, y: 3 },
        { x: 2, y: 5 },
        { x: 3, y: 7 },
      ];

      let firstLoss = 0;
      let lastLoss = 0;
      let iterationCount = 0;

      await model.train(data, 100, 0.01, (state: any) => {
        if (iterationCount === 0) {
          firstLoss = state.loss;
        }
        lastLoss = state.loss;
        iterationCount++;
      });

      expect(iterationCount).toBe(100);
      expect(lastLoss).toBeLessThan(firstLoss);
    });

    it('should reset parameters', async () => {
      const data: DataPoint[] = [
        { x: 1, y: 5 },
        { x: 2, y: 7 },
      ];

      await model.train(data, 100, 0.01);

      const paramsBeforeReset = model.getParameters();
      expect(paramsBeforeReset.slope).not.toBe(0);

      model.reset();

      const paramsAfterReset = model.getParameters();
      expect(paramsAfterReset.slope).toBe(0);
      expect(paramsAfterReset.intercept).toBe(0);
    });

    it('should handle noisy data', async () => {
      // Data with noise around y = 3x + 2
      const data: DataPoint[] = [
        { x: 1, y: 4.8 },
        { x: 2, y: 8.2 },
        { x: 3, y: 10.9 },
        { x: 4, y: 14.1 },
        { x: 5, y: 16.8 },
      ];

      await model.train(data, 2000, 0.01);

      const params = model.getParameters();

      // Should still approximate the underlying relationship
      expect(params.slope).toBeCloseTo(3, 0);
      expect(params.intercept).toBeCloseTo(2, 0);
    });

    it('should stop training when callback returns false', async () => {
      const data: DataPoint[] = [
        { x: 1, y: 3 },
        { x: 2, y: 5 },
        { x: 3, y: 7 },
        { x: 4, y: 9 },
        { x: 5, y: 11 },
      ];

      let iterationCount = 0;
      const stopAfter = 10;

      await model.train(data, 100, 0.01, (_state: any) => {
        iterationCount++;
        // Stop after 10 iterations
        return iterationCount < stopAfter;
      });

      // Should have stopped at iteration 10
      expect(iterationCount).toBe(stopAfter);
    });

    it('should continue training when callback returns true', async () => {
      const data: DataPoint[] = [
        { x: 1, y: 3 },
        { x: 2, y: 5 },
        { x: 3, y: 7 },
      ];

      let iterationCount = 0;

      await model.train(data, 50, 0.01, (_state: any) => {
        iterationCount++;
        // Always continue
        return true;
      });

      // Should have completed all 50 iterations
      expect(iterationCount).toBe(50);
    });

    it('should continue training when callback returns undefined', async () => {
      const data: DataPoint[] = [
        { x: 1, y: 3 },
        { x: 2, y: 5 },
      ];

      let iterationCount = 0;

      await model.train(data, 30, 0.01, (_state: any) => {
        iterationCount++;
        // Return undefined (default behavior)
      });

      // Should have completed all 30 iterations
      expect(iterationCount).toBe(30);
    });
  });
}

// Shared test suite for 2D linear regression implementations
function testLinearRegression2D(name: string, createModel: () => ILinearRegression2D) {
  describe(name, () => {
    let model: ILinearRegression2D;

    beforeEach(() => {
      model = createModel();
    });

    it('should initialize with zero parameters', () => {
      const params = model.getParameters();
      expect(params.slope1).toBe(0);
      expect(params.slope2).toBe(0);
      expect(params.intercept).toBe(0);
    });

    it('should learn a 2D linear relationship: y = 2x1 - 3x2 + 10', async () => {
      // Perfect linear data: y = 2x1 - 3x2 + 10
      const data: DataPoint2D[] = [
        { x1: 1, x2: 1, y: 9 },   // 2*1 - 3*1 + 10 = 9
        { x1: 2, x2: 1, y: 11 },  // 2*2 - 3*1 + 10 = 11
        { x1: 3, x2: 2, y: 10 },  // 2*3 - 3*2 + 10 = 10
        { x1: 4, x2: 2, y: 12 },  // 2*4 - 3*2 + 10 = 12
        { x1: 5, x2: 3, y: 11 },  // 2*5 - 3*3 + 10 = 11
      ];

      await model.train(data, 5000, 0.01);

      const params = model.getParameters();

      // Should be close to slope1=2, slope2=-3, intercept=10
      expect(params.slope1).toBeCloseTo(2, 0);
      expect(params.slope2).toBeCloseTo(-3, 0);
      expect(params.intercept).toBeCloseTo(10, 0);

      // Test prediction
      const prediction = model.predict(6, 3);
      expect(prediction).toBeCloseTo(13, 0); // 2*6 - 3*3 + 10 = 13
    });

    it('should learn ice cream sales with temperature and unemployment', async () => {
      // Simulated data: sales ≈ 2 * temp - 3 * unemployment + 50
      const data: DataPoint2D[] = [
        { x1: 20, x2: 5, y: 75 },  // 2*20 - 3*5 + 50 = 75
        { x1: 25, x2: 6, y: 82 },  // 2*25 - 3*6 + 50 = 82
        { x1: 30, x2: 7, y: 89 },  // 2*30 - 3*7 + 50 = 89
        { x1: 35, x2: 8, y: 96 },  // 2*35 - 3*8 + 50 = 96
        { x1: 15, x2: 10, y: 50 }, // 2*15 - 3*10 + 50 = 50
      ];

      await model.train(data, 5000, 0.01);

      const params = model.getParameters();

      // Should learn approximately slope1=2, slope2=-3, intercept=50
      expect(params.slope1).toBeCloseTo(2, 0);
      expect(params.slope2).toBeCloseTo(-3, 0);
      expect(params.intercept).toBeCloseTo(50, 0);
    });

    it('should reduce loss over training iterations', async () => {
      const data: DataPoint2D[] = [
        { x1: 1, x2: 1, y: 5 },
        { x1: 2, x2: 2, y: 7 },
        { x1: 3, x2: 3, y: 9 },
      ];

      let firstLoss = 0;
      let lastLoss = 0;
      let iterationCount = 0;

      await model.train(data, 100, 0.01, (_state: any) => {
        if (iterationCount === 0) {
          firstLoss = _state.loss;
        }
        lastLoss = _state.loss;
        iterationCount++;
      });

      expect(iterationCount).toBe(100);
      expect(lastLoss).toBeLessThan(firstLoss);
    });

    it('should reset parameters', async () => {
      const data: DataPoint2D[] = [
        { x1: 1, x2: 1, y: 5 },
        { x1: 2, x2: 2, y: 7 },
      ];

      await model.train(data, 100, 0.01);

      const paramsBeforeReset = model.getParameters();
      expect(paramsBeforeReset.slope1).not.toBe(0);

      model.reset();

      const paramsAfterReset = model.getParameters();
      expect(paramsAfterReset.slope1).toBe(0);
      expect(paramsAfterReset.slope2).toBe(0);
      expect(paramsAfterReset.intercept).toBe(0);
    });

    it('should stop training when callback returns false', async () => {
      const data: DataPoint2D[] = [
        { x1: 1, x2: 1, y: 5 },
        { x1: 2, x2: 2, y: 7 },
        { x1: 3, x2: 3, y: 9 },
      ];

      let iterationCount = 0;
      const stopAfter = 10;

      await model.train(data, 100, 0.01, (_state: any) => {
        iterationCount++;
        return iterationCount < stopAfter;
      });

      expect(iterationCount).toBe(stopAfter);
    });
  });
}

// Run tests for 1D implementations
testLinearRegression('CustomLinearRegression', () => new CustomLinearRegression());
testLinearRegression('TensorFlowLinearRegression', () => new TensorFlowLinearRegression());

// Run tests for 2D implementations
testLinearRegression2D('CustomLinearRegression2D', () => new CustomLinearRegression2D());
testLinearRegression2D('TensorFlowLinearRegression2D', () => new TensorFlowLinearRegression2D());
