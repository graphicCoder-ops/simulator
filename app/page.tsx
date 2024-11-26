// app/page.tsx

'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { fetchDTCData, fetchSensorData, SensorData } from '@/lib/api';
import { FaCar, FaMapMarkerAlt } from 'react-icons/fa';
import { GiTreasureMap } from "react-icons/gi"; // Import icons
import { AlertCircle, CheckCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TbEngine } from "react-icons/tb";

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

interface DTC {
  code: string;
  description: string;
  severity: 'danger' | 'normal';
}

export default function HomePage() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [error, setError] = useState<string | null>(null);
 const [dtcs, setDtcs] = useState<DTC[]>([]);

  
  const [selectedTab, setSelectedTab] = useState<string>('DTCs');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } >({lat:43.65647222,lng:-79.73763889});
  useEffect(() => {
    async function getData() {
      
        const data = await fetchSensorData();
        if (data) {
          setSensorData(data);
        } else {
          setError('Failed to load sensor data.');
        
    }
    }

  //   async function getDTCData() {

      
      
  //     const data = await fetchDTCData();
  //     if (data) {
  //       //setDtcs(data.DTCs);
  //     } else {
  //       setError('Failed to load sensor data.');
      
  // }
  // }
    //getDTCData();
    //setInterval(getData,500);
    getData();

    const data: DTC[] = [
      { code: 'P0300', description: 'Engine misfire detected', severity: 'danger' },
      { code: 'P0420', description: 'Catalyst system efficiency below threshold', severity: 'normal' },
      { code: 'P0171', description: 'System too lean (Bank 1)', severity: 'danger' },
      { code: 'P0172', description: 'System too lean (Bank 1)', severity: 'danger' },
      { code: 'P0173', description: 'System too lean (Bank 1)', severity: 'danger' },
    ];
    setDtcs(data);
    setCurrentLocation({lat:43.65647222,lng:-79.73763889});
    
    // if (navigator.geolocation) {
    //   navigator.geolocation.getCurrentPosition(
    //     (position) => {
    //       setCurrentLocation({
    //         lat: position.coords.latitude,
    //         lng: position.coords.longitude,
    //       });
    //     },
    //     (error) => {
    //       console.error('Error getting location:', error);
    //     }
    //   );
    // } else {
    //   console.error('Geolocation is not supported by this browser.');
    // }
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
          <div className="grid grid-cols-3 md:grid-cols-3 gap-2">
            {fieldsToDisplay.map(({ key, label }) => (
              <Card key={key} className=''>
                <CardHeader className='p-4'>
                  <CardTitle>{label}</CardTitle>
                </CardHeader>
                <CardContent>
                <p>
  {sensorData[key] !== undefined 
    ? parseFloat(sensorData[key]).toFixed(2)
    : 'N/A'}
</p>
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
          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyA1hbmUTv5XBgn9k9-q0JG0L5kGMEl-bdE&q=${currentLocation.lat},${currentLocation.lng}`}
          width="100%"
          height="270"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
        />
        <div className="flex items-center mt-4">
          <span className="text-2xl mr-2">
            {/* React Icons */}
            <i className="fas fa-car"></i>
          </span>
          <span className="text-2xl mx-2">➡️</span>
          <span className="text-2xl mx-2">
            <i className="fas fa-gas-pump"></i>
          </span>
          <span className="ml-4 text-lg font-semibold">
            Estimated distance of <span className="text-blue-600">120 km</span>
          </span>
        </div>
      </div>
      );
    }

    if (selectedTab === 'trips') {
      return (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Trips</h1>
          <p>Trips goes here</p>
        </div>
      );
    }
    if (selectedTab === 'DTCs') {
      return (
        <div className="flex-grow bg-gray-100">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-xl">DTC Information</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ScrollArea className="h-full">
              {dtcs.length > 0 ? (
                <ul className="space-y-4">
                  {dtcs.map((dtc) => (
                    <li
                      key={dtc.code}
                      className={`p-4 rounded border ${
                        dtc.severity === 'danger' ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-lg font-bold ${
                            dtc.severity === 'danger' ? 'text-red-500' : 'text-gray-800'
                          }`}
                        >
                          {dtc.code}
                        </span>
                        {dtc.severity === 'danger' ? (
                          <AlertCircle className="text-red-500" />
                        ) : (
                          <CheckCircle className="text-green-500" />
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-2">{dtc.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">No DTCs found.</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
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
              selectedTab === 'DTCs' ? 'bg-gray-700' : ''
            }`}
            onClick={() => setSelectedTab('DTCs')}
          >
            <TbEngine className='text-xl' />
            DTCs
          </button>
          <button
            className={`w-full p-4 text-left flex items-center gap-4 ${
              selectedTab === 'obd' ? 'bg-gray-700' : ''
            }`}
            onClick={() => setSelectedTab('obd')}
          >
            <FaCar className="text-xl" />
            Info
          </button>
          <button
            className={`w-full p-4 text-left flex items-center gap-4 ${
              selectedTab === 'maps' ? 'bg-gray-700' : ''
            }`}
            onClick={() => setSelectedTab('maps')}
          >
            <FaMapMarkerAlt className="text-xl" />
            Maps
          </button>
          <button
            className={`w-full p-4 text-left flex items-center gap-4 ${
              selectedTab === 'trips' ? 'bg-gray-700' : ''
            }`}
            onClick={() => setSelectedTab('trips')}
          >
            <GiTreasureMap className='text-xl' />
            trips
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-grow bg-gray-100">{renderContent()}</div>
    </div>
  );
}
