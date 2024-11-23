// utils/api.ts

export interface SensorData {
  RPM: number;
  SPEED: number;
  ENGINE_LOAD: number;
  LONG_FUEL_TRIM_1: number;
  O2_B1S1: number;
  THROTTLE_POS: number;
  COOLANT_TEMP: number;
  MAF: number;
  FUEL_LEVEL: number;
  [key: string]: number;
}

export async function fetchSensorData(username: string): Promise<SensorData | null> {
  try {
    const API = 'http://34.42.34.201:8080';
    const response = await fetch(`${API}/sensor/get/${username}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: SensorData = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch sensor data:', error);
    return null;
  }
}
