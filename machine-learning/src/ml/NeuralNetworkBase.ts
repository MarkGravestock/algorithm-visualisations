import { DataPoint } from './ILinearRegression';
import {
  Activation,
  ForwardPass,
  INeuralNetwork,
  LayerParameters,
  NETWORK_LAYER_SIZES,
  NeuralNetworkProgressCallback,
} from './INeuralNetwork';
import { createSeededRandom, forwardPropagate, initialiseLayers } from './neuralNetworkMaths';

interface Scale {
  mean: number;
  std: number;
}

const IDENTITY_SCALE: Scale = { mean: 0, std: 1 };

// Without a delay, only hand control back to the browser every few epochs so training isn't throttled by timers
const EPOCHS_BETWEEN_UI_UPDATES = 10;

// Shared plumbing: scaling data to mean 0 / std 1, the training loop and progress reporting.
// Subclasses only decide how one step of gradient descent is done.
export abstract class NeuralNetworkBase implements INeuralNetwork {
  private inputScale = IDENTITY_SCALE;
  private outputScale = IDENTITY_SCALE;

  constructor(protected readonly activation: Activation, protected readonly seed: number) {}

  protected abstract beginTraining(samples: DataPoint[], learningRate: number): void;

  // One full-batch gradient descent step, returning the loss (in scaled units) before the update
  protected abstract trainingStep(): number;

  protected abstract endTraining(): void;

  abstract getLayers(): LayerParameters[];

  protected initialLayers(): LayerParameters[] {
    return initialiseLayers(NETWORK_LAYER_SIZES, createSeededRandom(this.seed));
  }

  async train(
    data: DataPoint[],
    epochs: number,
    learningRate: number = 0.1,
    onProgress?: NeuralNetworkProgressCallback,
    iterationDelay: number = 0
  ): Promise<void> {
    this.inputScale = fitScale(data.map((p) => p.x));
    this.outputScale = fitScale(data.map((p) => p.y));
    const samples = data.map((p) => ({
      x: scale(p.x, this.inputScale),
      y: scale(p.y, this.outputScale),
    }));

    this.beginTraining(samples, learningRate);
    try {
      for (let epoch = 1; epoch <= epochs; epoch++) {
        const scaledLoss = this.trainingStep();

        const shouldContinue = onProgress?.({
          layers: this.getLayers(),
          loss: scaledLoss * this.outputScale.std * this.outputScale.std,
          iteration: epoch,
        });
        if (shouldContinue === false) break;

        await pauseForUi(epoch, iterationDelay);
      }
    } finally {
      this.endTraining();
    }
  }

  forwardPass(x: number): ForwardPass {
    const scaledInput = scale(x, this.inputScale);
    const { outputs } = forwardPropagate(this.getLayers(), this.activation, scaledInput);
    const scaledPrediction = outputs[outputs.length - 1][0];
    return {
      layerOutputs: outputs,
      scaledInput,
      prediction: scaledPrediction * this.outputScale.std + this.outputScale.mean,
    };
  }

  predict(x: number): number {
    return this.forwardPass(x).prediction;
  }

  reset(): void {
    this.inputScale = IDENTITY_SCALE;
    this.outputScale = IDENTITY_SCALE;
  }

  dispose(): void {}
}

function fitScale(values: number[]): Scale {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return { mean, std: Math.sqrt(variance) || 1 };
}

function scale(value: number, { mean, std }: Scale): number {
  return (value - mean) / std;
}

async function pauseForUi(epoch: number, iterationDelay: number): Promise<void> {
  if (iterationDelay > 0) {
    await new Promise((resolve) => setTimeout(resolve, iterationDelay));
  } else if (epoch % EPOCHS_BETWEEN_UI_UPDATES === 0) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}
