import { DataPoint, DataPoint2D } from '../ml/ILinearRegression';

const TEMPERATURE_COEFFICIENT = 2;
const BASE_SALES = 30;
const NOISE_RANGE = 15;
const MIN_TEMPERATURE = 15;
const MAX_TEMPERATURE = 40;

export function generateIceCreamData(count: number): DataPoint[] {
  const data: DataPoint[] = [];

  for (let i = 0; i < count; i++) {
    const temperature = generateRandomTemperature();
    const sales = calculateSalesWithNoise(temperature);

    data.push({
      x: roundToOneDecimal(temperature),
      y: Math.round(sales),
    });
  }

  return sortByTemperature(data);
}

function generateRandomTemperature(): number {
  const range = MAX_TEMPERATURE - MIN_TEMPERATURE;
  return MIN_TEMPERATURE + Math.random() * range;
}

function calculateSalesWithNoise(temperature: number): number {
  const baseSales = TEMPERATURE_COEFFICIENT * temperature + BASE_SALES;
  const noise = (Math.random() - 0.5) * NOISE_RANGE;
  return Math.max(0, baseSales + noise);
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function sortByTemperature(data: DataPoint[]): DataPoint[] {
  return data.sort((a, b) => a.x - b.x);
}

const TEMPERATURE_COEFFICIENT_2D = 2;
const UNEMPLOYMENT_COEFFICIENT = -3;
const BASE_SALES_2D = 50;
const MIN_UNEMPLOYMENT = 3;
const MAX_UNEMPLOYMENT = 12;

export function generateIceCreamData2D(count: number): DataPoint2D[] {
  const data: DataPoint2D[] = [];

  for (let i = 0; i < count; i++) {
    const temperature = generateRandomTemperature();
    const unemployment = generateRandomUnemploymentRate();
    const sales = calculateSalesWithTwoFactors(temperature, unemployment);

    data.push({
      x1: roundToOneDecimal(temperature),
      x2: roundToOneDecimal(unemployment),
      y: Math.round(sales),
    });
  }

  return sortByTemperature2D(data);
}

function generateRandomUnemploymentRate(): number {
  const range = MAX_UNEMPLOYMENT - MIN_UNEMPLOYMENT;
  return MIN_UNEMPLOYMENT + Math.random() * range;
}

function calculateSalesWithTwoFactors(temperature: number, unemployment: number): number {
  const baseSales = TEMPERATURE_COEFFICIENT_2D * temperature +
                    UNEMPLOYMENT_COEFFICIENT * unemployment +
                    BASE_SALES_2D;
  const noise = (Math.random() - 0.5) * NOISE_RANGE;
  return Math.max(0, baseSales + noise);
}

function sortByTemperature2D(data: DataPoint2D[]): DataPoint2D[] {
  return data.sort((a, b) => a.x1 - b.x1);
}

export function validateDataPoint(temperature: number, sales: number): boolean {
  return isValidNumber(temperature) && isValidNumber(sales);
}

export function validateDataPoint2D(temperature: number, unemployment: number, sales: number): boolean {
  return isValidNumber(temperature) && isValidNumber(unemployment) && isValidNumber(sales);
}

function isValidNumber(value: number): boolean {
  return !isNaN(value) && isFinite(value);
}
