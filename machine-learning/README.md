# Ice Cream Sales ML Predictor

An interactive TypeScript + React application demonstrating linear regression in action. Predict ice cream sales based on temperature using machine learning!

## Features

- **Two ML Strategies**:
  - Custom implementation using gradient descent from scratch
  - TensorFlow.js neural network implementation

- **Interactive Training**:
  - Generate random training data (10-500 points)
  - Adjustable training epochs (10-1000)
  - Configurable learning rate (0.001-0.1)
  - Configurable iteration delay (0-1000ms) for slower visualization
  - Real-time animated visualization during training
  - Visual progress bar showing training completion percentage
  - Stop button to halt training at any point (red button replaces start during training)

- **Visualizations** (powered by Chart.js):
  - Scatter plot showing temperature vs ice cream sales
  - Animated regression line that updates in real-time during training
  - Loss curve showing all iterations with values appearing as training progresses
  - Loss graph updates every iteration with no animation flicker
  - Current line equation display

- **Prediction Interface**:
  - Manual temperature input
  - Random temperature generator
  - Visual prediction results on graph

- **Neural Network tab**: a 1 → 2 → 2 → 1 network fitted to "heatwave" data where sales peak and then fall (see below)

- **Data Management**:
  - Random data generation with realistic noise
  - Editable data table (modify/delete points)
  - Whole number sales values

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **ML Libraries**:
  - Custom gradient descent implementation with feature normalization
  - TensorFlow.js
- **Visualization**: Chart.js with react-chartjs-2
- **Testing**: Vitest

## Installation

```bash
npm install
```

## Running the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm run preview
```

## Running Tests

```bash
npm test
```

The linear regression tests run one shared suite against both the Custom and TensorFlow.js implementations:
- Parameter learning accuracy
- Loss reduction over training
- Prediction accuracy
- Model reset functionality
- Handling of noisy data

The tests use a unified test suite that runs the same test cases against both the Custom and TensorFlow.js implementations, ensuring consistent behavior.

## How It Works

### Data Generation
The app generates realistic ice cream sales data following the relationship:
```
sales ≈ 2 × temperature + 30 (with random noise)
```

Temperature ranges from 15°C to 40°C, and sales are always whole numbers.

### Training Process
Both implementations use:
1. **Feature Normalization**: Standardizes data to mean=0, std=1 for stable training
2. **Gradient Descent**: Iteratively minimizes mean squared error
3. **Denormalization**: Converts parameters back to original scale for display

### Custom Implementation
- Pure TypeScript gradient descent
- Manual parameter updates with configurable learning rate
- Normalized features for numerical stability

### TensorFlow.js Implementation
- Single-layer dense neural network
- SGD optimizer
- Automatic differentiation for gradient computation

### Neural Network Tab
Sales follow an inverted U (`sales ≈ 100 − 0.3 × (temperature − 28)²`), which no straight line can fit. A network with one input, two hidden layers of two neurons and one linear output learns the curve:
- **Custom**: hand-written forward pass and backpropagation (`src/ml/neuralNetworkMaths.ts`), checked against numerical gradients in the tests
- **TensorFlow.js**: the same architecture, with gradients from automatic differentiation
- Both start from the same seeded weights, so they can be compared like for like
- The diagram shows each weight and each neuron's output for a chosen temperature; the neuron chart shows how each hidden neuron responds across the whole range
- Try `sigmoid` (slower to learn) or `ReLU` (neurons can "die" and get stuck) to see why the activation function matters

Further reading: [Neural Networks and Deep Learning, ch. 2 (backpropagation)](http://neuralnetworksanddeeplearning.com/chap2.html), [3Blue1Brown: Neural networks](https://www.3blue1brown.com/topics/neural-networks), [TensorFlow Playground](https://playground.tensorflow.org/).

## Project Structure

```
src/
├── ml/
│   ├── CustomLinearRegression.ts         # Custom gradient descent
│   ├── CustomLinearRegression.test.ts
│   ├── TensorFlowLinearRegression.ts     # TensorFlow.js implementation
│   └── TensorFlowLinearRegression.test.ts
├── components/
│   ├── ScatterChart.tsx                  # Main data visualization
│   ├── LossChart.tsx                     # Training loss graph
│   └── DataTable.tsx                     # Editable data table
├── utils/
│   └── dataGenerator.ts                  # Ice cream data generation
├── App.tsx                               # Main application
└── main.tsx                              # Entry point
```

## Key Learning Points

1. **Feature Normalization**: Critical for gradient descent stability, especially with different scales
2. **Learning Rate**: Too high causes divergence, too low slows convergence
3. **Epochs**: More iterations generally improve fit, but with diminishing returns
4. **Overfitting**: With enough parameters, models can memorize noise rather than learn patterns

## License

MIT
