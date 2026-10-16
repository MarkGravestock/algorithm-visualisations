import { DataPoint } from './ILinearRegression';

export type Activation = 'tanh' | 'sigmoid' | 'relu';

// Temperature in, two hidden layers of two neurons, sales out
export const NETWORK_LAYER_SIZES = [1, 2, 2, 1];

// One fully connected layer: weights[neuron][input]
export interface LayerParameters {
  weights: number[][];
  biases: number[];
}

export interface NeuralNetworkTrainingState {
  layers: LayerParameters[];
  loss: number;
  iteration: number;
}

export type NeuralNetworkProgressCallback = (state: NeuralNetworkTrainingState) => boolean | void;

export interface ForwardPass {
  // layerOutputs[0] is the (scaled) input, layerOutputs[l + 1] the output of layer l
  layerOutputs: number[][];
  scaledInput: number;
  prediction: number;
}

export interface INeuralNetwork {
  train(
    data: DataPoint[],
    epochs: number,
    learningRate: number,
    onProgress?: NeuralNetworkProgressCallback,
    iterationDelay?: number
  ): Promise<void>;

  predict(x: number): number;

  forwardPass(x: number): ForwardPass;

  getLayers(): LayerParameters[];

  // Back to the starting weights for this network's seed
  reset(): void;

  dispose(): void;
}
