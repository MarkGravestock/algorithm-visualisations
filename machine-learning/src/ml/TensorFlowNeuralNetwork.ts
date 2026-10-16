import * as tf from '@tensorflow/tfjs';
import { DataPoint } from './ILinearRegression';
import { Activation, LayerParameters, NETWORK_LAYER_SIZES } from './INeuralNetwork';
import { NeuralNetworkBase } from './NeuralNetworkBase';
import { randomSeed } from './neuralNetworkMaths';

// TensorFlow.js does the gradients (automatic differentiation) and the SGD update.
// The weights are read back after each step so they can be drawn.
export class TensorFlowNeuralNetwork extends NeuralNetworkBase {
  private model: tf.Sequential;
  private optimizer: tf.Optimizer | null = null;
  private xs: tf.Tensor2D | null = null;
  private ys: tf.Tensor2D | null = null;
  private layersCache: LayerParameters[] | null = null;

  constructor(activation: Activation = 'tanh', seed: number = randomSeed()) {
    super(activation, seed);
    this.model = this.buildModel();
    this.loadInitialWeights();
  }

  private buildModel(): tf.Sequential {
    const model = tf.sequential();
    const layerSizes = NETWORK_LAYER_SIZES.slice(1);
    layerSizes.forEach((units, l) => {
      model.add(
        tf.layers.dense({
          units,
          inputShape: l === 0 ? [NETWORK_LAYER_SIZES[0]] : undefined,
          activation: l === layerSizes.length - 1 ? 'linear' : this.activation,
        })
      );
    });
    return model;
  }

  // Use the same seeded starting weights as the custom network so the two can be compared like for like
  private loadInitialWeights(): void {
    const tensors = this.initialLayers().flatMap((layer) => [
      tf.tensor2d(transpose(layer.weights)), // TensorFlow stores kernels as [input][neuron]
      tf.tensor1d(layer.biases),
    ]);
    this.model.setWeights(tensors);
    tf.dispose(tensors);
    this.layersCache = null;
  }

  protected beginTraining(samples: DataPoint[], learningRate: number): void {
    this.xs = tf.tensor2d(samples.map((s) => [s.x]));
    this.ys = tf.tensor2d(samples.map((s) => [s.y]));
    this.optimizer = tf.train.sgd(learningRate);
  }

  protected trainingStep(): number {
    const cost = this.optimizer!.minimize(
      () => tf.losses.meanSquaredError(this.ys!, this.model.predict(this.xs!) as tf.Tensor) as tf.Scalar,
      true
    )!;
    const loss = cost.dataSync()[0];
    cost.dispose();
    this.layersCache = null;
    return loss;
  }

  protected endTraining(): void {
    tf.dispose([this.xs!, this.ys!]);
    this.optimizer?.dispose();
    this.xs = this.ys = this.optimizer = null;
  }

  getLayers(): LayerParameters[] {
    if (!this.layersCache) {
      this.layersCache = this.model.layers.map((layer) => {
        const [kernel, bias] = layer.getWeights();
        return {
          weights: transpose(kernel.arraySync() as number[][]),
          biases: bias.arraySync() as number[],
        };
      });
    }
    return this.layersCache;
  }

  reset(): void {
    super.reset();
    this.loadInitialWeights();
  }

  dispose(): void {
    this.model.dispose();
  }
}

function transpose(matrix: number[][]): number[][] {
  return matrix[0].map((_, column) => matrix.map((row) => row[column]));
}
