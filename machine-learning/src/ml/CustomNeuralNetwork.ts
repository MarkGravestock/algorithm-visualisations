import { DataPoint } from './ILinearRegression';
import { Activation, LayerParameters } from './INeuralNetwork';
import { NeuralNetworkBase } from './NeuralNetworkBase';
import { applyGradients, backpropagate, randomSeed } from './neuralNetworkMaths';

// Hand-written backpropagation: see neuralNetworkMaths.ts for the forward and backward passes
export class CustomNeuralNetwork extends NeuralNetworkBase {
  private layers: LayerParameters[];
  private samples: DataPoint[] = [];
  private learningRate = 0;

  constructor(activation: Activation = 'tanh', seed: number = randomSeed()) {
    super(activation, seed);
    this.layers = this.initialLayers();
  }

  protected beginTraining(samples: DataPoint[], learningRate: number): void {
    this.samples = samples;
    this.learningRate = learningRate;
  }

  protected trainingStep(): number {
    const { gradients, loss } = backpropagate(this.layers, this.activation, this.samples);
    this.layers = applyGradients(this.layers, gradients, this.learningRate);
    return loss;
  }

  protected endTraining(): void {
    this.samples = [];
  }

  getLayers(): LayerParameters[] {
    return this.layers;
  }

  reset(): void {
    super.reset();
    this.layers = this.initialLayers();
  }
}
