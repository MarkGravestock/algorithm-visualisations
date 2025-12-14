// Application state
const state = {
    data: generateIceCreamData(50),
    isTraining: false,
    shouldStopTraining: false,
    currentModel: null,
    regressionLine: null,
    lossHistory: []
};

// Models
const models = {
    custom: new CustomLinearRegression(),
    tensorflow: new TensorFlowLinearRegression()
};

// DOM elements
const elements = {
    strategy: document.getElementById('strategy'),
    numPoints: document.getElementById('numPoints'),
    epochs: document.getElementById('epochs'),
    learningRate: document.getElementById('learningRate'),
    iterationDelay: document.getElementById('iterationDelay'),
    generateBtn: document.getElementById('generateBtn'),
    trainBtn: document.getElementById('trainBtn'),
    stopBtn: document.getElementById('stopBtn'),
    progressFill: document.getElementById('progressFill'),
    equation: document.getElementById('equation'),
    predictionTemp: document.getElementById('predictionTemp'),
    randomTempBtn: document.getElementById('randomTempBtn'),
    predictBtn: document.getElementById('predictBtn'),
    predictionResult: document.getElementById('predictionResult'),
    dataTableBody: document.getElementById('dataTableBody')
};

// Initialize charts
let scatterChart, lossChart;

function initCharts() {
    const scatterCtx = document.getElementById('scatterChart').getContext('2d');
    scatterChart = new Chart(scatterCtx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Training Data',
                    data: state.data.map(d => ({ x: d.temperature, y: d.sales })),
                    backgroundColor: 'rgba(102, 126, 234, 0.5)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    pointRadius: 5
                },
                {
                    label: 'Regression Line',
                    data: [],
                    type: 'line',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: 'Prediction',
                    data: [],
                    backgroundColor: 'rgba(40, 167, 69, 1)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    pointRadius: 8,
                    pointStyle: 'star'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Temperature vs Ice Cream Sales'
                },
                legend: {
                    display: true
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Ice Cream Sales'
                    }
                }
            }
        }
    });

    const lossCtx = document.getElementById('lossChart').getContext('2d');
    lossChart = new Chart(lossCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Training Loss',
                data: [],
                borderColor: 'rgba(102, 126, 234, 1)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Training Loss Over Time'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Epoch'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Loss (MSE)'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// Update data table
function updateDataTable() {
    elements.dataTableBody.innerHTML = '';
    state.data.forEach((point, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${point.temperature.toFixed(1)}</td>
            <td>${point.sales}</td>
            <td>
                <button onclick="deleteDataPoint(${index})">Delete</button>
            </td>
        `;
        elements.dataTableBody.appendChild(row);
    });
}

// Delete data point
window.deleteDataPoint = function(index) {
    state.data.splice(index, 1);
    updateDataTable();
    updateScatterChart();
};

// Update scatter chart
function updateScatterChart() {
    scatterChart.data.datasets[0].data = state.data.map(d => ({ x: d.temperature, y: d.sales }));
    scatterChart.update();
}

// Update regression line
function updateRegressionLine(slope, intercept) {
    const temps = state.data.map(d => d.temperature);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);

    scatterChart.data.datasets[1].data = [
        { x: minTemp, y: slope * minTemp + intercept },
        { x: maxTemp, y: slope * maxTemp + intercept }
    ];
    scatterChart.update();

    elements.equation.textContent = `y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`;
}

// Update loss chart
function updateLossChart(iteration, loss) {
    lossChart.data.labels.push(iteration);
    lossChart.data.datasets[0].data.push(loss);
    lossChart.update();
}

// Generate new data
elements.generateBtn.addEventListener('click', () => {
    const numPoints = parseInt(elements.numPoints.value);
    state.data = generateIceCreamData(numPoints);
    state.regressionLine = null;
    state.lossHistory = [];

    updateDataTable();
    updateScatterChart();

    scatterChart.data.datasets[1].data = [];
    scatterChart.data.datasets[2].data = [];
    scatterChart.update();

    lossChart.data.labels = [];
    lossChart.data.datasets[0].data = [];
    lossChart.update();

    elements.equation.textContent = 'Not trained yet';
    elements.predictionResult.textContent = '';
    elements.progressFill.style.width = '0%';
});

// Train model
elements.trainBtn.addEventListener('click', async () => {
    state.isTraining = true;
    state.shouldStopTraining = false;
    elements.trainBtn.style.display = 'none';
    elements.stopBtn.style.display = 'inline-block';
    elements.predictionResult.textContent = '';

    const strategy = elements.strategy.value;
    const epochs = parseInt(elements.epochs.value);
    const learningRate = parseFloat(elements.learningRate.value);
    const iterationDelay = parseInt(elements.iterationDelay.value);

    state.currentModel = models[strategy];
    state.currentModel.reset();

    lossChart.data.labels = [];
    lossChart.data.datasets[0].data = [];
    state.lossHistory = [];

    scatterChart.data.datasets[2].data = [];

    try {
        await state.currentModel.train(state.data, {
            epochs,
            learningRate,
            iterationDelay,
            shouldStop: () => state.shouldStopTraining,
            onProgress: (progress) => {
                updateRegressionLine(progress.slope, progress.intercept);
                updateLossChart(progress.iteration, progress.loss);

                const percentage = ((progress.iteration + 1) / epochs) * 100;
                elements.progressFill.style.width = percentage + '%';
            }
        });
    } catch (error) {
        console.error('Training error:', error);
        alert('Training failed: ' + error.message);
    }

    state.isTraining = false;
    elements.trainBtn.style.display = 'inline-block';
    elements.stopBtn.style.display = 'none';
});

// Stop training
elements.stopBtn.addEventListener('click', () => {
    state.shouldStopTraining = true;
});

// Random temperature
elements.randomTempBtn.addEventListener('click', () => {
    const temp = Math.random() * 25 + 15;
    elements.predictionTemp.value = temp.toFixed(1);
});

// Make prediction
elements.predictBtn.addEventListener('click', () => {
    if (!state.currentModel || !state.currentModel.normalization) {
        elements.predictionResult.textContent = 'Please train the model first!';
        elements.predictionResult.style.color = '#dc3545';
        return;
    }

    const temperature = parseFloat(elements.predictionTemp.value);
    const prediction = state.currentModel.predict(temperature);

    elements.predictionResult.textContent = `Predicted sales at ${temperature.toFixed(1)}°C: ${Math.round(prediction)} units`;
    elements.predictionResult.style.color = '#667eea';

    scatterChart.data.datasets[2].data = [{ x: temperature, y: prediction }];
    scatterChart.update();
});

// Initialize
initCharts();
updateDataTable();
