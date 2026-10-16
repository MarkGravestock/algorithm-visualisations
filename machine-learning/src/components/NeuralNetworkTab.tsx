import { useMemo, useRef, useState } from 'react';
import { DataPoint } from '../ml/ILinearRegression';
import { Activation, INeuralNetwork, LayerParameters, NeuralNetworkTrainingState } from '../ml/INeuralNetwork';
import { CustomNeuralNetwork } from '../ml/CustomNeuralNetwork';
import { TensorFlowNeuralNetwork } from '../ml/TensorFlowNeuralNetwork';
import { randomSeed } from '../ml/neuralNetworkMaths';
import { fitStraightLine, meanSquaredError } from '../ml/leastSquares';
import { generateHeatwaveIceCreamData } from '../utils/dataGenerator';
import { NeuralNetworkChart } from './NeuralNetworkChart';
import { NetworkDiagram } from './NetworkDiagram';
import { HiddenNeuronChart } from './HiddenNeuronChart';
import { LossChart } from './LossChart';
import { DataTable } from './DataTable';

type MLStrategy = 'custom' | 'tensorflow';

const MIN_PROBE_TEMPERATURE = 10;
const MAX_PROBE_TEMPERATURE = 42;
const CURVE_SAMPLES = 80;

function createNetwork(strategy: MLStrategy, activation: Activation, seed: number): INeuralNetwork {
  return strategy === 'custom' ? new CustomNeuralNetwork(activation, seed) : new TensorFlowNeuralNetwork(activation, seed);
}

function sampleTemperatures(): number[] {
  const step = (MAX_PROBE_TEMPERATURE - MIN_PROBE_TEMPERATURE) / (CURVE_SAMPLES - 1);
  return Array.from({ length: CURVE_SAMPLES }, (_, i) => MIN_PROBE_TEMPERATURE + i * step);
}

export function NeuralNetworkTab() {
  const [numPoints, setNumPoints] = useState(60);
  const [epochs, setEpochs] = useState(1000);
  const [learningRate, setLearningRate] = useState(0.1);
  const [iterationDelay, setIterationDelay] = useState(0);
  const [strategy, setStrategy] = useState<MLStrategy>('custom');
  const [activation, setActivation] = useState<Activation>('tanh');
  const [seed, setSeed] = useState(randomSeed);

  const [data, setData] = useState<DataPoint[]>(() => generateHeatwaveIceCreamData(60));
  const [network, setNetwork] = useState<INeuralNetwork>(() => createNetwork('custom', 'tanh', seed));
  const [isTraining, setIsTraining] = useState(false);
  const shouldStopTrainingRef = useRef(false);
  // The weights after the latest epoch; null until the network has been trained on the current data
  const [trainedLayers, setTrainedLayers] = useState<LayerParameters[] | null>(null);
  const [lossHistory, setLossHistory] = useState<(number | null)[]>([]);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [probeTemperature, setProbeTemperature] = useState(38);

  const clearResults = () => {
    setTrainedLayers(null);
    setLossHistory([]);
    setCurrentIteration(0);
  };

  const replaceNetwork = (newStrategy: MLStrategy, newActivation: Activation, newSeed: number) => {
    network.dispose();
    setNetwork(createNetwork(newStrategy, newActivation, newSeed));
    clearResults();
  };

  const handleStrategyChange = (value: MLStrategy) => {
    setStrategy(value);
    replaceNetwork(value, activation, seed);
  };

  const handleActivationChange = (value: Activation) => {
    setActivation(value);
    replaceNetwork(strategy, value, seed);
  };

  const handleNewStartingWeights = () => {
    const newSeed = randomSeed();
    setSeed(newSeed);
    replaceNetwork(strategy, activation, newSeed);
  };

  const generateNewData = () => {
    setData(generateHeatwaveIceCreamData(numPoints));
    network.reset();
    clearResults();
  };

  const handleDataChange = (newData: DataPoint[]) => {
    setData(newData);
    network.reset();
    clearResults();
  };

  const handleTrain = async () => {
    setIsTraining(true);
    shouldStopTrainingRef.current = false;
    setTrainedLayers(null);
    setLossHistory(Array(epochs).fill(null));
    setCurrentIteration(0);
    network.reset();

    const onProgress = (state: NeuralNetworkTrainingState) => {
      setTrainedLayers(state.layers);
      setLossHistory((prev) => {
        const updated = [...prev];
        updated[state.iteration - 1] = state.loss;
        return updated;
      });
      setCurrentIteration(state.iteration);
      return !shouldStopTrainingRef.current;
    };

    try {
      await network.train(data, epochs, learningRate, onProgress, iterationDelay);
    } catch (error) {
      console.error('Training error:', error);
    } finally {
      setIsTraining(false);
      shouldStopTrainingRef.current = false;
    }
  };

  const straightLine = useMemo(() => (data.length > 1 ? fitStraightLine(data) : null), [data]);
  const straightLineError = straightLine
    ? meanSquaredError(data, (x) => straightLine.slope * x + straightLine.intercept)
    : null;

  // trainedLayers changes every epoch, which re-renders and re-reads the network below
  const isTrained = trainedLayers !== null;
  const temperatures = sampleTemperatures();
  const passes = isTrained ? temperatures.map((temperature) => ({ temperature, pass: network.forwardPass(temperature) })) : [];
  const probePass = isTrained ? network.forwardPass(probeTemperature) : null;
  const networkError = isTrained ? meanSquaredError(data, (x) => network.predict(x)) : null;
  const straightLinePrediction = straightLine ? straightLine.slope * probeTemperature + straightLine.intercept : null;

  return (
    <>
      <p className="tab-intro">
        On scorching days people stay indoors, so sales peak and then <em>fall</em>. A straight line can't bend to follow
        that. This small neural network can: 1 input, two hidden layers of 2 neurons each, and 1 output. Each hidden neuron
        learns a simple S-shaped response to temperature, and the layers combine those shapes into a curve.
      </p>

      <div className="container">
        <div className="controls-section">
          <h2>Configuration</h2>

          <div className="control-group">
            <label>ML Strategy:</label>
            <select value={strategy} onChange={(e) => handleStrategyChange(e.target.value as MLStrategy)} disabled={isTraining}>
              <option value="custom">Custom (Backpropagation)</option>
              <option value="tensorflow">TensorFlow.js</option>
            </select>
          </div>

          <div className="control-group">
            <label>Activation Function:</label>
            <select value={activation} onChange={(e) => handleActivationChange(e.target.value as Activation)} disabled={isTraining}>
              <option value="tanh">tanh</option>
              <option value="sigmoid">sigmoid</option>
              <option value="relu">ReLU</option>
            </select>
          </div>

          <div className="control-group">
            <label>Number of Training Points:</label>
            <input
              type="number"
              min="10"
              max="500"
              value={numPoints}
              onChange={(e) => setNumPoints(parseInt(e.target.value))}
              disabled={isTraining}
            />
          </div>

          <div className="control-group">
            <label>Training Epochs:</label>
            <input
              type="number"
              min="10"
              max="10000"
              value={epochs}
              onChange={(e) => setEpochs(parseInt(e.target.value))}
              disabled={isTraining}
            />
          </div>

          <div className="control-group">
            <label>Learning Rate:</label>
            <input
              type="number"
              step="0.01"
              min="0.001"
              max="1"
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
              disabled={isTraining}
            />
          </div>

          <div className="control-group">
            <label>Iteration Delay (ms):</label>
            <input
              type="number"
              min="0"
              max="1000"
              step="10"
              value={iterationDelay}
              onChange={(e) => setIterationDelay(parseInt(e.target.value))}
              disabled={isTraining}
            />
          </div>

          <button onClick={generateNewData} disabled={isTraining} className="button">
            Generate New Data
          </button>

          <button onClick={handleNewStartingWeights} disabled={isTraining} className="button">
            New Random Starting Weights
          </button>

          {!isTraining ? (
            <button onClick={handleTrain} disabled={data.length === 0} className="button button-primary">
              Start Training
            </button>
          ) : (
            <button onClick={() => (shouldStopTrainingRef.current = true)} className="button button-stop">
              Stop Training
            </button>
          )}

          {isTraining && (
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${(currentIteration / epochs) * 100}%` }} />
              <div className="progress-text">
                {currentIteration} / {epochs} ({Math.round((currentIteration / epochs) * 100)}%)
              </div>
            </div>
          )}

          {networkError !== null && straightLineError !== null && (
            <div className="equation">
              <h3>Error (MSE):</h3>
              <p>Neural network: {networkError.toFixed(1)}</p>
              <p>Best straight line: {straightLineError.toFixed(1)}</p>
              <p className="interpretation">
                The same starting weights are used for both strategies, so Custom and TensorFlow.js should end up with
                (almost) the same fit. Try a few random starts, or ReLU, to see a network get stuck.
              </p>
            </div>
          )}
        </div>

        <div className="visualization-section">
          <NeuralNetworkChart
            data={data}
            networkCurve={passes.map(({ temperature, pass }) => ({ x: temperature, y: pass.prediction }))}
            straightLine={
              straightLine
                ? [MIN_PROBE_TEMPERATURE, MAX_PROBE_TEMPERATURE].map((x) => ({ x, y: straightLine.slope * x + straightLine.intercept }))
                : undefined
            }
            predictionPoint={probePass ? { x: probeTemperature, y: probePass.prediction } : undefined}
          />

          {lossHistory.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <LossChart lossHistory={lossHistory} />
            </div>
          )}
        </div>
      </div>

      {trainedLayers && probePass && (
        <div className="prediction-section">
          <h2>Inside the Network</h2>
          <div className="control-group">
            <label>
              Temperature: <strong>{probeTemperature.toFixed(1)}°C</strong>
            </label>
            <input
              type="range"
              min={MIN_PROBE_TEMPERATURE}
              max={MAX_PROBE_TEMPERATURE}
              step="0.5"
              value={probeTemperature}
              onChange={(e) => setProbeTemperature(parseFloat(e.target.value))}
              className="temperature-slider"
            />
          </div>

          <div className="prediction-result">
            <p>
              At <strong>{probeTemperature.toFixed(1)}°C</strong> the network predicts{' '}
              <strong>{Math.round(probePass.prediction)}</strong> sales
              {straightLinePrediction !== null && (
                <>
                  ; the straight line would say <strong>{Math.round(straightLinePrediction)}</strong>
                </>
              )}
              .
            </p>
          </div>

          <div className="network-panels">
            <NetworkDiagram layers={trainedLayers} forwardPass={probePass} temperature={probeTemperature} />
            <HiddenNeuronChart passes={passes} probeTemperature={probeTemperature} />
          </div>
        </div>
      )}

      <div className="data-section">
        <h2>Training Data (Editable)</h2>
        <DataTable data={data} onDataChange={handleDataChange} />
      </div>
    </>
  );
}
