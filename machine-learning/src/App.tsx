import { useState, useRef } from 'react';
import { Tabs } from './components/Tabs';
import { ScatterChart } from './components/ScatterChart';
import { ScatterChart3D } from './components/ScatterChart3D';
import { LossChart } from './components/LossChart';
import { DataTable } from './components/DataTable';
import { DataTable2D } from './components/DataTable2D';
import { DataPoint, DataPoint2D, TrainingState } from './ml/ILinearRegression';
import { CustomLinearRegression } from './ml/CustomLinearRegression';
import { TensorFlowLinearRegression } from './ml/TensorFlowLinearRegression';
import { CustomLinearRegression2D } from './ml/CustomLinearRegression2D';
import { TensorFlowLinearRegression2D } from './ml/TensorFlowLinearRegression2D';
import { generateIceCreamData, generateIceCreamData2D } from './utils/dataGenerator';
import './App.css';

type MLStrategy = 'custom' | 'tensorflow';
type TabType = '1d' | '2d';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('1d');

  // Shared configuration
  const [numPoints, setNumPoints] = useState(50);
  const [epochs, setEpochs] = useState(100);
  const [learningRate, setLearningRate] = useState(0.01);
  const [iterationDelay, setIterationDelay] = useState(0);
  const [strategy, setStrategy] = useState<MLStrategy>('custom');

  // 1D state
  const [data1D, setData1D] = useState<DataPoint[]>(generateIceCreamData(50));
  const [isTraining1D, setIsTraining1D] = useState(false);
  const shouldStopTraining1DRef = useRef(false);
  const [regressionLine1D, setRegressionLine1D] = useState<{ slope: number; intercept: number } | null>(null);
  const [lossHistory1D, setLossHistory1D] = useState<(number | null)[]>([]);
  const [currentIteration1D, setCurrentIteration1D] = useState(0);
  const [predictionTemp1D, setPredictionTemp1D] = useState('');
  const [predictionResult1D, setPredictionResult1D] = useState<DataPoint | null>(null);

  // 2D state
  const [data2D, setData2D] = useState<DataPoint2D[]>(generateIceCreamData2D(50));
  const [isTraining2D, setIsTraining2D] = useState(false);
  const shouldStopTraining2DRef = useRef(false);
  const [regressionPlane2D, setRegressionPlane2D] = useState<{ slope1: number; slope2: number; intercept: number } | null>(null);
  const [lossHistory2D, setLossHistory2D] = useState<(number | null)[]>([]);
  const [currentIteration2D, setCurrentIteration2D] = useState(0);
  const [predictionTemp2D, setPredictionTemp2D] = useState('');
  const [predictionUnemployment2D, setPredictionUnemployment2D] = useState('');
  const [predictionResult2D, setPredictionResult2D] = useState<number | null>(null);

  // Models
  const [models] = useState(() => ({
    custom1D: new CustomLinearRegression(),
    tensorflow1D: new TensorFlowLinearRegression(),
    custom2D: new CustomLinearRegression2D(),
    tensorflow2D: new TensorFlowLinearRegression2D(),
  }));

  // 1D Functions
  const generateNewData1D = () => {
    const newData = generateIceCreamData(numPoints);
    setData1D(newData);
    setRegressionLine1D(null);
    setLossHistory1D([]);
    setCurrentIteration1D(0);
    setPredictionResult1D(null);
  };

  const handleTrain1D = async () => {
    setIsTraining1D(true);
    shouldStopTraining1DRef.current = false;
    setLossHistory1D(Array(epochs).fill(null));
    setCurrentIteration1D(0);
    setPredictionResult1D(null);

    const currentModel = strategy === 'custom' ? models.custom1D : models.tensorflow1D;
    currentModel.reset();

    const onProgress = (state: TrainingState) => {
      setRegressionLine1D({ slope: state.coefficients[0], intercept: state.intercept });
      setLossHistory1D((prev) => {
        const updated = [...prev];
        updated[state.iteration - 1] = state.loss;
        return updated;
      });
      setCurrentIteration1D(state.iteration);
      return !shouldStopTraining1DRef.current;
    };

    try {
      await currentModel.train(data1D, epochs, learningRate, onProgress, iterationDelay);
    } catch (error) {
      console.error('Training error:', error);
    } finally {
      setIsTraining1D(false);
      shouldStopTraining1DRef.current = false;
    }
  };

  const handleStopTraining1D = () => {
    shouldStopTraining1DRef.current = true;
  };

  const handlePredict1D = () => {
    const temp = parseFloat(predictionTemp1D);
    if (isNaN(temp)) {
      alert('Please enter a valid temperature');
      return;
    }

    const currentModel = strategy === 'custom' ? models.custom1D : models.tensorflow1D;
    const sales = Math.round(currentModel.predict(temp));
    setPredictionResult1D({ x: temp, y: sales });
  };

  const generateRandomPrediction1D = () => {
    const randomTemp = Math.round((15 + Math.random() * 25) * 10) / 10;
    setPredictionTemp1D(randomTemp.toString());

    const currentModel = strategy === 'custom' ? models.custom1D : models.tensorflow1D;
    const sales = Math.round(currentModel.predict(randomTemp));
    setPredictionResult1D({ x: randomTemp, y: sales });
  };

  // 2D Functions
  const generateNewData2D = () => {
    const newData = generateIceCreamData2D(numPoints);
    setData2D(newData);
    setRegressionPlane2D(null);
    setLossHistory2D([]);
    setCurrentIteration2D(0);
    setPredictionResult2D(null);
  };

  const handleTrain2D = async () => {
    setIsTraining2D(true);
    shouldStopTraining2DRef.current = false;
    setLossHistory2D(Array(epochs).fill(null));
    setCurrentIteration2D(0);
    setPredictionResult2D(null);

    const currentModel = strategy === 'custom' ? models.custom2D : models.tensorflow2D;
    currentModel.reset();

    const onProgress = (state: TrainingState) => {
      setRegressionPlane2D({
        slope1: state.coefficients[0],
        slope2: state.coefficients[1],
        intercept: state.intercept
      });
      setLossHistory2D((prev) => {
        const updated = [...prev];
        updated[state.iteration - 1] = state.loss;
        return updated;
      });
      setCurrentIteration2D(state.iteration);
      return !shouldStopTraining2DRef.current;
    };

    try {
      await currentModel.train(data2D, epochs, learningRate, onProgress, iterationDelay);
    } catch (error) {
      console.error('Training error:', error);
    } finally {
      setIsTraining2D(false);
      shouldStopTraining2DRef.current = false;
    }
  };

  const handleStopTraining2D = () => {
    shouldStopTraining2DRef.current = true;
  };

  const handlePredict2D = () => {
    const temp = parseFloat(predictionTemp2D);
    const unemployment = parseFloat(predictionUnemployment2D);
    if (isNaN(temp) || isNaN(unemployment)) {
      alert('Please enter valid temperature and unemployment values');
      return;
    }

    const currentModel = strategy === 'custom' ? models.custom2D : models.tensorflow2D;
    const sales = Math.round(currentModel.predict(temp, unemployment));
    setPredictionResult2D(sales);
  };

  const generateRandomPrediction2D = () => {
    const randomTemp = Math.round((15 + Math.random() * 25) * 10) / 10;
    const randomUnemployment = Math.round((3 + Math.random() * 9) * 10) / 10;
    setPredictionTemp2D(randomTemp.toString());
    setPredictionUnemployment2D(randomUnemployment.toString());

    const currentModel = strategy === 'custom' ? models.custom2D : models.tensorflow2D;
    const sales = Math.round(currentModel.predict(randomTemp, randomUnemployment));
    setPredictionResult2D(sales);
  };

  // Get current tab values
  const isTraining = activeTab === '1d' ? isTraining1D : isTraining2D;
  const currentIteration = activeTab === '1d' ? currentIteration1D : currentIteration2D;

  return (
    <div className="app">
      <h1>Ice Cream Sales ML Predictor</h1>

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="container">
        <div className="controls-section">
          <h2>Configuration</h2>

          <div className="control-group">
            <label>ML Strategy:</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as MLStrategy)}
              disabled={isTraining}
            >
              <option value="custom">Custom (Gradient Descent)</option>
              <option value="tensorflow">TensorFlow.js</option>
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
              max="1000"
              value={epochs}
              onChange={(e) => setEpochs(parseInt(e.target.value))}
              disabled={isTraining}
            />
          </div>

          <div className="control-group">
            <label>Learning Rate:</label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              max="0.1"
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

          <button
            onClick={activeTab === '1d' ? generateNewData1D : generateNewData2D}
            disabled={isTraining}
            className="button"
          >
            Generate New Data
          </button>

          {!isTraining ? (
            <button
              onClick={activeTab === '1d' ? handleTrain1D : handleTrain2D}
              disabled={(activeTab === '1d' ? data1D.length : data2D.length) === 0}
              className="button button-primary"
            >
              Start Training
            </button>
          ) : (
            <button
              onClick={activeTab === '1d' ? handleStopTraining1D : handleStopTraining2D}
              className="button button-stop"
            >
              Stop Training
            </button>
          )}

          {isTraining && (
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: `${(currentIteration / epochs) * 100}%` }}
              />
              <div className="progress-text">
                {currentIteration} / {epochs} ({Math.round((currentIteration / epochs) * 100)}%)
              </div>
            </div>
          )}

          {activeTab === '1d' && regressionLine1D && (
            <div className="equation">
              <h3>Equation:</h3>
              <p>
                y = {regressionLine1D.slope.toFixed(4)}x + {regressionLine1D.intercept.toFixed(4)}
              </p>
              <p className="interpretation">
                Sales = {regressionLine1D.slope.toFixed(2)} × Temperature + {regressionLine1D.intercept.toFixed(2)}
              </p>
            </div>
          )}

          {activeTab === '2d' && regressionPlane2D && (
            <div className="equation">
              <h3>Equation:</h3>
              <p className="interpretation">
                Sales = {regressionPlane2D.slope1.toFixed(2)} × Temperature {regressionPlane2D.slope2 >= 0 ? '+' : ''} {regressionPlane2D.slope2.toFixed(2)} × Unemployment + {regressionPlane2D.intercept.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        <div className="visualization-section">
          {activeTab === '1d' ? (
            <>
              <ScatterChart
                data={data1D}
                regressionLine={regressionLine1D || undefined}
                predictionPoint={predictionResult1D || undefined}
              />

              {lossHistory1D.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <LossChart lossHistory={lossHistory1D} />
                </div>
              )}
            </>
          ) : (
            <>
              <ScatterChart3D
                data={data2D}
                regressionPlane={regressionPlane2D || undefined}
              />

              {lossHistory2D.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <LossChart lossHistory={lossHistory2D} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {activeTab === '1d' && regressionLine1D && (
        <div className="prediction-section">
          <h2>Make Predictions</h2>
          <div className="prediction-controls">
            <div className="control-group">
              <label>Temperature (°C):</label>
              <input
                type="number"
                step="0.1"
                value={predictionTemp1D}
                onChange={(e) => setPredictionTemp1D(e.target.value)}
                placeholder="Enter temperature"
              />
            </div>
            <button onClick={handlePredict1D} className="button">
              Predict Sales
            </button>
            <button onClick={generateRandomPrediction1D} className="button">
              Random Temperature
            </button>
          </div>

          {predictionResult1D && (
            <div className="prediction-result">
              <h3>Prediction Result:</h3>
              <p>
                At <strong>{predictionResult1D.x.toFixed(1)}°C</strong>,
                predicted sales: <strong>{Math.round(predictionResult1D.y)}</strong> units
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === '2d' && regressionPlane2D && (
        <div className="prediction-section">
          <h2>Make Predictions</h2>
          <div className="prediction-controls">
            <div className="control-group">
              <label>Temperature (°C):</label>
              <input
                type="number"
                step="0.1"
                value={predictionTemp2D}
                onChange={(e) => setPredictionTemp2D(e.target.value)}
                placeholder="Enter temperature"
              />
            </div>
            <div className="control-group">
              <label>Unemployment (%):</label>
              <input
                type="number"
                step="0.1"
                value={predictionUnemployment2D}
                onChange={(e) => setPredictionUnemployment2D(e.target.value)}
                placeholder="Enter unemployment rate"
              />
            </div>
            <button onClick={handlePredict2D} className="button">
              Predict Sales
            </button>
            <button onClick={generateRandomPrediction2D} className="button">
              Random Values
            </button>
          </div>

          {predictionResult2D !== null && (
            <div className="prediction-result">
              <h3>Prediction Result:</h3>
              <p>
                At <strong>{parseFloat(predictionTemp2D).toFixed(1)}°C</strong> and{' '}
                <strong>{parseFloat(predictionUnemployment2D).toFixed(1)}%</strong> unemployment,
                predicted sales: <strong>{predictionResult2D}</strong> units
              </p>
            </div>
          )}
        </div>
      )}

      <div className="data-section">
        <h2>Training Data (Editable)</h2>
        {activeTab === '1d' ? (
          <DataTable data={data1D} onDataChange={setData1D} />
        ) : (
          <DataTable2D data={data2D} onDataChange={setData2D} />
        )}
      </div>
    </div>
  );
}

export default App;
