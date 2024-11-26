// utils/api.ts

export interface SensorData {
  RPM?: number;
  SPEED?: number;
  ENGINE_LOAD?: number;
  LONG_FUEL_TRIM_1?: number;
  O2_B1S1?: number;
  THROTTLE_POS?: number;
  COOLANT_TEMP?: number;
  MAF?: number;
  FUEL_LEVEL?: number;
  [key: string]: number | undefined;
}

export async function fetchSensorData(): Promise<SensorData | null> {
  try {
    const response = await fetch('/api/sensor-data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Disable caching for up-to-date data
      cache: 'no-store',
    });

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

export interface DTCdata {
  DTCs?:Array<string>
}

export async function fetchDTCData(): Promise<DTCdata | null> {
  try {
    const response = await fetch('/api/dtc', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Disable caching for up-to-date data
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data: DTCdata = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch sensor data:', error);
    return null;
  }
}

