import { DataPoint } from './ILinearRegression';
import { Activation, LayerParameters } from './INeuralNetwork';

interface ActivationFunction {
  apply(z: number): number;
  // Derivative in terms of the pre-activation z and the output a = apply(z)
  derivative(z: number, a: number): number;
}

export const ACTIVATION_FUNCTIONS: Record<Activation, ActivationFunction> = {
  tanh: { apply: Math.tanh, derivative: (_z, a) => 1 - a * a },
  sigmoid: { apply: (z) => 1 / (1 + Math.exp(-z)), derivative: (_z, a) => a * (1 - a) },
  relu: { apply: (z) => Math.max(0, z), derivative: (z) => (z > 0 ? 1 : 0) },
};

export interface LayerValues {
  preActivations: number[][]; // z = w·inputs + b for each layer
  outputs: number[][];        // outputs[0] is the input, outputs[l + 1] the output of layer l
}

export function forwardPropagate(layers: LayerParameters[], activation: Activation, input: number): LayerValues {
  const preActivations: number[][] = [];
  const outputs: number[][] = [[input]];

  layers.forEach((layer, l) => {
    const inputs = outputs[l];
    const z = layer.weights.map((neuronWeights, j) =>
      neuronWeights.reduce((sum, w, i) => sum + w * inputs[i], layer.biases[j])
    );
    preActivations.push(z);

    // The output neuron stays linear so the network can predict any sales value
    const isOutputLayer = l === layers.length - 1;
    outputs.push(isOutputLayer ? z : z.map(ACTIVATION_FUNCTIONS[activation].apply));
  });

  return { preActivations, outputs };
}

// Mean squared error over the samples, and its gradient with respect to every weight and bias
export function backpropagate(
  layers: LayerParameters[],
  activation: Activation,
  samples: DataPoint[]
): { gradients: LayerParameters[]; loss: number } {
  const { derivative } = ACTIVATION_FUNCTIONS[activation];
  const gradients = layers.map((layer) => scaleLayer(layer, 0));
  let totalSquaredError = 0;

  for (const sample of samples) {
    const { preActivations, outputs } = forwardPropagate(layers, activation, sample.x);
    const error = outputs[outputs.length - 1][0] - sample.y;
    totalSquaredError += error * error;

    // Start with dLoss/dz for the output neuron, then push it back one layer at a time (the chain rule)
    let deltas = [2 * error];
    for (let l = layers.length - 1; l >= 0; l--) {
      const inputs = outputs[l];
      deltas.forEach((delta, j) => {
        gradients[l].biases[j] += delta;
        inputs.forEach((input, i) => {
          gradients[l].weights[j][i] += delta * input;
        });
      });

      if (l > 0) {
        const currentDeltas = deltas;
        deltas = inputs.map((input, i) => {
          const fromNextLayer = currentDeltas.reduce((sum, delta, j) => sum + delta * layers[l].weights[j][i], 0);
          return fromNextLayer * derivative(preActivations[l - 1][i], input);
        });
      }
    }
  }

  return {
    gradients: gradients.map((gradient) => scaleLayer(gradient, 1 / samples.length)),
    loss: totalSquaredError / samples.length,
  };
}

export function applyGradients(
  layers: LayerParameters[],
  gradients: LayerParameters[],
  learningRate: number
): LayerParameters[] {
  return layers.map((layer, l) => ({
    weights: layer.weights.map((row, j) => row.map((w, i) => w - learningRate * gradients[l].weights[j][i])),
    biases: layer.biases.map((b, j) => b - learningRate * gradients[l].biases[j]),
  }));
}

// Glorot/Xavier uniform weights and zero biases, the same defaults TensorFlow.js uses for dense layers.
// Weights must start random: if they were all equal, both neurons in a layer would learn the same thing.
export function initialiseLayers(layerSizes: number[], random: () => number): LayerParameters[] {
  return layerSizes.slice(1).map((size, l) => {
    const fanIn = layerSizes[l];
    const limit = Math.sqrt(6 / (fanIn + size));
    return {
      weights: Array.from({ length: size }, () => Array.from({ length: fanIn }, () => (random() * 2 - 1) * limit)),
      biases: Array(size).fill(0),
    };
  });
}

// Mulberry32: a tiny seedable generator so a given seed always gives the same starting weights
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}

function scaleLayer(layer: LayerParameters, factor: number): LayerParameters {
  return {
    weights: layer.weights.map((row) => row.map((w) => w * factor)),
    biases: layer.biases.map((b) => b * factor),
  };
}
