// app/page.tsx

'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { fetchSensorData, SensorData } from '@/lib/api';

const fieldsToDisplay: { key: keyof SensorData; label: string }[] = [
  { key: 'RPM', label: 'RPM' },
  { key: 'SPEED', label: 'Speed' },
  { key: 'ENGINE_LOAD', label: 'Engine Load' },
  { key: 'LONG_FUEL_TRIM_1', label: 'Long Fuel Trim 1' },
  { key: 'O2_B1S1', label: 'O2 Sensor B1S1' },
  { key: 'THROTTLE_POS', label: 'Throttle Position' },
  { key: 'COOLANT_TEMP', label: 'Coolant Temperature' },
  { key: 'MAF', label: 'Mass Air Flow (MAF)' },
  { key: 'FUEL_LEVEL', label: 'Fuel Level' },
];

export default function HomePage() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getData() {
      const data = await fetchSensorData();
      if (data) {
        setSensorData(data);
      } else {
        setError('Failed to load sensor data.');
      }
    }
    getData();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (!sensorData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">OBD Information</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fieldsToDisplay.map(({ key, label }) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{sensorData[key] !== undefined ? sensorData[key] : 'N/A'}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
