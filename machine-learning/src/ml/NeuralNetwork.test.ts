import { describe, it, expect, afterEach } from 'vitest';
import { DataPoint } from './ILinearRegression';
import { Activation, INeuralNetwork, LayerParameters } from './INeuralNetwork';
import { CustomNeuralNetwork } from './CustomNeuralNetwork';
import { TensorFlowNeuralNetwork } from './TensorFlowNeuralNetwork';
import { backpropagate } from './neuralNetworkMaths';
import { fitStraightLine, meanSquaredError } from './leastSquares';

const SEED = 42;

// Sales peak at 28°C and fall either side: no straight line fits this
const HEATWAVE_DATA: DataPoint[] = Array.from({ length: 29 }, (_, i) => {
  const temperature = 12 + i;
  return { x: temperature, y: Math.round(100 - 0.3 * (temperature - 28) ** 2) };
});

function testNeuralNetwork(name: string, createNetwork: (activation?: Activation) => INeuralNetwork) {
  describe(name, () => {
    let network: INeuralNetwork;

    afterEach(() => network.dispose());

    it('should have 1 input, two hidden layers of 2 neurons and 1 output', () => {
      network = createNetwork();
      const shapes = network.getLayers().map((layer) => [layer.weights.length, layer.weights[0].length]);
      expect(shapes).toEqual([[2, 1], [2, 2], [1, 2]]);
    });

    it('should fit a curve far better than the best straight line', async () => {
      network = createNetwork();
      await network.train(HEATWAVE_DATA, 1000, 0.1);

      const line = fitStraightLine(HEATWAVE_DATA);
      const straightLineError = meanSquaredError(HEATWAVE_DATA, (x) => line.slope * x + line.intercept);
      const networkError = meanSquaredError(HEATWAVE_DATA, (x) => network.predict(x));

      expect(networkError).toBeLessThan(straightLineError / 10);
      expect(network.predict(28)).toBeGreaterThan(network.predict(14));
      expect(network.predict(28)).toBeGreaterThan(network.predict(40));
    });

    it('should reduce loss over training iterations', async () => {
      network = createNetwork();
      const losses: number[] = [];
      await network.train(HEATWAVE_DATA, 200, 0.1, (state) => {
        losses.push(state.loss);
      });

      expect(losses).toHaveLength(200);
      expect(losses[losses.length - 1]).toBeLessThan(losses[0]);
    });

    it('should stop training when callback returns false', async () => {
      network = createNetwork();
      let iterationCount = 0;
      await network.train(HEATWAVE_DATA, 100, 0.1, () => {
        iterationCount++;
        return iterationCount < 10;
      });

      expect(iterationCount).toBe(10);
    });

    it('should expose every layer output in the forward pass', async () => {
      network = createNetwork();
      await network.train(HEATWAVE_DATA, 50, 0.1);

      const pass = network.forwardPass(30);
      expect(pass.layerOutputs.map((outputs) => outputs.length)).toEqual([1, 2, 2, 1]);
      expect(pass.prediction).toBeCloseTo(network.predict(30), 10);
    });

    it('should return to its starting weights on reset', async () => {
      network = createNetwork();
      const initialLayers = network.getLayers();
      await network.train(HEATWAVE_DATA, 50, 0.1);
      expect(network.getLayers()).not.toEqual(initialLayers);

      network.reset();
      expectLayersClose(network.getLayers(), initialLayers);
    });
  });
}

testNeuralNetwork('CustomNeuralNetwork', (activation) => new CustomNeuralNetwork(activation, SEED));
testNeuralNetwork('TensorFlowNeuralNetwork', (activation) => new TensorFlowNeuralNetwork(activation, SEED));

describe('Custom and TensorFlow.js networks', () => {
  it.each<Activation>(['tanh', 'sigmoid', 'relu'])('should learn the same weights from the same start (%s)', async (activation) => {
    const custom = new CustomNeuralNetwork(activation, SEED);
    const tensorFlow = new TensorFlowNeuralNetwork(activation, SEED);
    expectLayersClose(custom.getLayers(), tensorFlow.getLayers());

    await custom.train(HEATWAVE_DATA, 100, 0.1);
    await tensorFlow.train(HEATWAVE_DATA, 100, 0.1);

    expectLayersClose(custom.getLayers(), tensorFlow.getLayers(), 3);
    tensorFlow.dispose();
  });
});

describe('backpropagate', () => {
  it.each<Activation>(['tanh', 'sigmoid', 'relu'])('should match numerically estimated gradients (%s)', (activation) => {
    const layers = new CustomNeuralNetwork(activation, SEED).getLayers();
    const samples: DataPoint[] = [{ x: -1.2, y: 0.3 }, { x: 0.1, y: 1 }, { x: 0.9, y: -0.5 }];
    const { gradients } = backpropagate(layers, activation, samples);

    // Nudge each parameter a tiny amount and see how much the loss changes
    const epsilon = 1e-6;
    const lossWith = (tweak: (copy: LayerParameters[]) => void) => {
      const copy: LayerParameters[] = structuredClone(layers);
      tweak(copy);
      return backpropagate(copy, activation, samples).loss;
    };

    layers.forEach((layer, l) => {
      layer.weights.forEach((row, j) => {
        row.forEach((_, i) => {
          const numerical =
            (lossWith((c) => (c[l].weights[j][i] += epsilon)) - lossWith((c) => (c[l].weights[j][i] -= epsilon))) /
            (2 * epsilon);
          expect(gradients[l].weights[j][i]).toBeCloseTo(numerical, 5);
        });
        const numerical =
          (lossWith((c) => (c[l].biases[j] += epsilon)) - lossWith((c) => (c[l].biases[j] -= epsilon))) / (2 * epsilon);
        expect(gradients[l].biases[j]).toBeCloseTo(numerical, 5);
      });
    });
  });
});

function expectLayersClose(actual: LayerParameters[], expected: LayerParameters[], digits = 5) {
  actual.forEach((layer, l) => {
    layer.weights.forEach((row, j) => {
      row.forEach((w, i) => expect(w).toBeCloseTo(expected[l].weights[j][i], digits));
      expect(layer.biases[j]).toBeCloseTo(expected[l].biases[j], digits);
    });
  });
}
