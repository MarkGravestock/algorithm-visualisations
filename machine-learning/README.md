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

All 12 tests validate both ML implementations using a shared test suite:
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
