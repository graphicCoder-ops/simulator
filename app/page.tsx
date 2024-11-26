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
import { FaCar, FaMapMarkerAlt, FaCog } from 'react-icons/fa'; // Import icons

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
  const [selectedTab, setSelectedTab] = useState<string>('obd');

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

  const renderContent = () => {
    if (selectedTab === 'obd') {
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

    if (selectedTab === 'maps') {
      return (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Google Maps</h1>
          <iframe
            title="Google Maps"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835434509364!2d144.95373531531692!3d-37.81627977975195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0xf5777d5e68af6e74!2sFlinders%20St%20Station!5e0!3m2!1sen!2sau!4v1602219317463!5m2!1sen!2sau"
            width="100%"
            height="600"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
          />
        </div>
      );
    }

    if (selectedTab === 'settings') {
      return (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          <p>Settings content goes here.</p>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 md:w-1/6 bg-black text-white flex flex-col">
        <div className="p-4">
          <h2 className="text-xl font-bold">Menu</h2>
        </div>
        <div className="flex-grow">
          <button
            className={`w-full p-4 text-left flex items-center gap-4 ${
              selectedTab === 'obd' ? 'bg-gray-700' : ''
            }`}
            onClick={() => setSelectedTab('obd')}
          >
            <FaCar className="text-xl" />
          </button>
          <button
            className={`w-full p-4 text-left flex items-center gap-4 ${
              selectedTab === 'maps' ? 'bg-gray-700' : ''
            }`}
            onClick={() => setSelectedTab('maps')}
          >
            <FaMapMarkerAlt className="text-xl" />
          </button>
          <button
            className={`w-full p-4 text-left flex items-center gap-4 ${
              selectedTab === 'settings' ? 'bg-gray-700' : ''
            }`}
            onClick={() => setSelectedTab('settings')}
          >
            <FaCog className="text-xl" />
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-grow bg-gray-100">{renderContent()}</div>
    </div>
  );
}
