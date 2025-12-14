// Custom Linear Regression using Gradient Descent
class CustomLinearRegression {
    constructor() {
        this.slope = 0;
        this.intercept = 0;
        this.normalization = null;
    }

    normalize(data) {
        const temperatures = data.map(d => d.temperature);
        const sales = data.map(d => d.sales);

        const tempMean = temperatures.reduce((a, b) => a + b) / temperatures.length;
        const tempStd = Math.sqrt(temperatures.reduce((sum, val) => sum + Math.pow(val - tempMean, 2), 0) / temperatures.length);

        const salesMean = sales.reduce((a, b) => a + b) / sales.length;
        const salesStd = Math.sqrt(sales.reduce((sum, val) => sum + Math.pow(val - salesMean, 2), 0) / sales.length);

        return {
            tempMean,
            tempStd,
            salesMean,
            salesStd,
            normalizedData: data.map(d => ({
                temperature: (d.temperature - tempMean) / (tempStd || 1),
                sales: (d.sales - salesMean) / (salesStd || 1)
            }))
        };
    }

    async train(data, options = {}) {
        const { epochs = 100, learningRate = 0.01, onProgress, shouldStop, iterationDelay = 0 } = options;

        const { tempMean, tempStd, salesMean, salesStd, normalizedData } = this.normalize(data);
        this.normalization = { tempMean, tempStd, salesMean, salesStd };

        let slope = 0;
        let intercept = 0;
        const n = normalizedData.length;

        for (let epoch = 0; epoch < epochs; epoch++) {
            if (shouldStop && shouldStop()) break;

            let slopeGradient = 0;
            let interceptGradient = 0;
            let totalLoss = 0;

            for (const point of normalizedData) {
                const prediction = slope * point.temperature + intercept;
                const error = prediction - point.sales;

                slopeGradient += error * point.temperature;
                interceptGradient += error;
                totalLoss += error * error;
            }

            slope -= (learningRate * slopeGradient) / n;
            intercept -= (learningRate * interceptGradient) / n;

            const denormalizedSlope = slope * (salesStd / tempStd);
            const denormalizedIntercept = salesMean - denormalizedSlope * tempMean + intercept * salesStd;

            if (onProgress) {
                onProgress({
                    iteration: epoch,
                    slope: denormalizedSlope,
                    intercept: denormalizedIntercept,
                    loss: totalLoss / n
                });
            }

            if (iterationDelay > 0) {
                await new Promise(resolve => setTimeout(resolve, iterationDelay));
            }
        }

        this.slope = slope * (salesStd / tempStd);
        this.intercept = salesMean - this.slope * tempMean + intercept * salesStd;
    }

    predict(temperature) {
        return this.slope * temperature + this.intercept;
    }

    reset() {
        this.slope = 0;
        this.intercept = 0;
        this.normalization = null;
    }
}

// TensorFlow.js Linear Regression
class TensorFlowLinearRegression {
    constructor() {
        this.model = null;
        this.normalization = null;
    }

    createModel() {
        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
        model.compile({
            optimizer: tf.train.sgd(0.01),
            loss: 'meanSquaredError'
        });
        return model;
    }

    normalize(data) {
        const temperatures = data.map(d => d.temperature);
        const sales = data.map(d => d.sales);

        const tempMean = temperatures.reduce((a, b) => a + b) / temperatures.length;
        const tempStd = Math.sqrt(temperatures.reduce((sum, val) => sum + Math.pow(val - tempMean, 2), 0) / temperatures.length);

        const salesMean = sales.reduce((a, b) => a + b) / sales.length;
        const salesStd = Math.sqrt(sales.reduce((sum, val) => sum + Math.pow(val - salesMean, 2), 0) / sales.length);

        return {
            tempMean,
            tempStd: tempStd || 1,
            salesMean,
            salesStd: salesStd || 1,
            normalizedTemps: temperatures.map(t => (t - tempMean) / (tempStd || 1)),
            normalizedSales: sales.map(s => (s - salesMean) / (salesStd || 1))
        };
    }

    async train(data, options = {}) {
        const { epochs = 100, learningRate = 0.01, onProgress, shouldStop, iterationDelay = 0 } = options;

        if (this.model) {
            this.model.dispose();
        }

        this.model = this.createModel();
        this.model.optimizer.learningRate = learningRate;

        const { tempMean, tempStd, salesMean, salesStd, normalizedTemps, normalizedSales } = this.normalize(data);
        this.normalization = { tempMean, tempStd, salesMean, salesStd };

        const xs = tf.tensor2d(normalizedTemps, [normalizedTemps.length, 1]);
        const ys = tf.tensor2d(normalizedSales, [normalizedSales.length, 1]);

        for (let epoch = 0; epoch < epochs; epoch++) {
            if (shouldStop && shouldStop()) break;

            const history = await this.model.fit(xs, ys, {
                epochs: 1,
                verbose: 0
            });

            const weights = this.model.getWeights();
            const normalizedSlope = await weights[0].data();
            const normalizedIntercept = await weights[1].data();

            const denormalizedSlope = normalizedSlope[0] * (salesStd / tempStd);
            const denormalizedIntercept = salesMean - denormalizedSlope * tempMean + normalizedIntercept[0] * salesStd;

            if (onProgress) {
                onProgress({
                    iteration: epoch,
                    slope: denormalizedSlope,
                    intercept: denormalizedIntercept,
                    loss: history.history.loss[0]
                });
            }

            if (iterationDelay > 0) {
                await new Promise(resolve => setTimeout(resolve, iterationDelay));
            }
        }

        xs.dispose();
        ys.dispose();
    }

    predict(temperature) {
        if (!this.model || !this.normalization) {
            throw new Error('Model not trained yet');
        }

        const { tempMean, tempStd, salesMean, salesStd } = this.normalization;
        const normalizedTemp = (temperature - tempMean) / tempStd;

        return tf.tidy(() => {
            const input = tf.tensor2d([normalizedTemp], [1, 1]);
            const normalizedPrediction = this.model.predict(input);
            const prediction = normalizedPrediction.dataSync()[0] * salesStd + salesMean;
            return prediction;
        });
    }

    reset() {
        if (this.model) {
            this.model.dispose();
            this.model = null;
        }
        this.normalization = null;
    }
}

// Data generator
function generateIceCreamData(numPoints = 50) {
    const data = [];
    for (let i = 0; i < numPoints; i++) {
        const temperature = Math.random() * 25 + 15; // 15-40°C
        const sales = Math.round(2 * temperature + 30 + (Math.random() - 0.5) * 20);
        data.push({ temperature, sales });
    }
    return data;
}
