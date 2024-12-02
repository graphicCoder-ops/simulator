// app/page.tsx

'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  fetchDTCData,
  fetchSensorData,
  SensorData,
  fetchTripData,
  TripsData,
  fetchGPSData,
} from '@/lib/api';
import { FaCar, FaMapMarkerAlt } from 'react-icons/fa';
import { GiTreasureMap } from 'react-icons/gi';
import { AlertCircle} from 'lucide-react';
import { TbEngine } from 'react-icons/tb';

import { LineChart, Line } from 'recharts';


import dynamic from 'next/dynamic';

const GoogleMapComponent = dynamic(
  () => import('@/components/ui/GoogleMapComponent'),
  { ssr: false }
);

// Import Recharts components
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BsFillFuelPumpFill } from "react-icons/bs";
import { IoIosWarning } from "react-icons/io";
import AnimatedRouteMap from '@/components/ui/AnimatedRouteMap';

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

export interface TripData {
  _id: string;
  username: string;
  Date: string;
  __v: number;
  DistanceTravelled: number;
  FuelConsumption: number;
  CO2Emissions: number;
}

const fieldRanges: Record<string, [number, number]> = {
  RPM: [0, 8000],
  SPEED: [0, 200],
  ENGINE_LOAD: [0, 100],
  LONG_FUEL_TRIM_1: [-50, 50],
  O2_B1S1: [0, 1],
  THROTTLE_POS: [0, 100],
  COOLANT_TEMP: [0, 120],
  MAF: [0, 300],
  FUEL_LEVEL: [0, 100],
};

export default function HomePage() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [sensorHistory, setSensorHistory] = useState<Record<string, Array<{ time: string; value: number }>>>({});
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dtcs, setDtcs] = useState<DTC[]>([]);

    // Define start and end locations
    const [startLocation, setStartLocation] = useState<google.maps.LatLngLiteral>({
      lat: 43.65696647404934, // Toronto
      lng: -79.74090879453345,
    });
  
    const [endLocation, setEndLocation] = useState<google.maps.LatLngLiteral>({
      lat: 43.72375,// Brampton
      lng: -79.697722,
    });

  const [selectedTab, setSelectedTab] = useState<string>('DTCs');
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  }>({ lat: 43.65647222, lng: -79.73763889 });

  const [tripsData, setTripsData] = useState<TripsData[] | null>(null);
  const [isTripsLoading, setIsTripsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function getData() {
      const data = await fetchSensorData();
      if (data) {
        setSensorHistory((prev) => {
          const updatedHistory = { ...prev };
          Object.keys(data).forEach((key) => {
            const value = data[key];
            if (!updatedHistory[key]) {
              updatedHistory[key] = [];
            }
            const timestamp = new Date().toLocaleTimeString();
            updatedHistory[key] = [...updatedHistory[key], { time: timestamp, value: value! }].slice(-10); // Keep the last 10 values
          });
          return updatedHistory;
        });
        setSensorData(data);
      } else {
        setError('Failed to load sensor data.');
      }
    }

    async function getGPSData() {
      const data = await fetchGPSData();
      if (data) {
        // Uncomment and adjust this line if your API returns DTCs
        if(data.Latitude!=currentLocation.lat && data.Longitude!=currentLocation.lng)
      setCurrentLocation({
        lat: data.Latitude,
        lng: data.Longitude
      });
      } else {
        setError('Failed to load DTC data.');
      }
    }
    setInterval(getGPSData,500);
    //setInterval(getGPSData,500);
    setInterval(getData,1000);

    // Sample DTC data
    const dtcData: DTC[] = [
      {
        code: 'P0131',
        description: 'Oxygen Sensor Circuit Low Voltage Detected',
        severity: 'normal',
      },
      {
        code: 'P07A3',
        description: 'Transmission issue – friction element stuck, potential shifting problems.',
        severity: 'danger',
      },
      {
        code: 'P0171',
        description: 'Catalytic converter not working efficiently, higher emissions possible',
        severity: 'normal',
      },
      {
        code: 'P0420',
        description: 'Clutch disengagement problem – possible difficulty driving or moving vehicle',
        severity: 'danger',
      },
    ];
    setDtcs(dtcData);

    async function getTripData() {
      setIsTripsLoading(true);
      const data = await fetchTripData(); // Replace with the actual username if needed
      if (data) {
        // Sort trips by date descending
        data.sort(
          (a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime()
        );
        setTripsData(data);
      } else {
        setError('Failed to load trips data.');
      }
      setIsTripsLoading(false);
    }
    getTripData();
  }, []);


  const handleCardClick = (key: string) => {
    setSelectedField(key);
  };

  const closeChart = () => {
    setSelectedField(null);
  };
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
      <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
        {fieldsToDisplay.map(({ key, label }) => (
          <Card key={key} onClick={() => handleCardClick(key)} className="cursor-pointer">
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                {sensorData[key] !== undefined
                  ? parseFloat(sensorData[key] as any).toFixed(2)
                  : 'N/A'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-[600px]">
            <button
              onClick={closeChart}
              className="absolute top-2 right-2 text-gray-500 text-black text-3xl"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-4">Real-Time Data for {selectedField}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={sensorHistory[selectedField]}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(time) => time}
                  label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
                />
                <YAxis domain={fieldRanges[selectedField!] || [0, 100]} // Use the custom range or a default
                  label={{ value: 'Value', angle: -90, position: 'insideLeft' }}/>
                <Tooltip />
                <Line type="linear" dataKey="value" stroke="#8884d8" strokeWidth={2}  />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
      );
    }

    if (selectedTab === 'maps') {
      return (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Google Maps</h1>
          <GoogleMapComponent
          currentLocation={currentLocation}
          startLocation={startLocation}
          endLocation={endLocation}
        />
          <div className="flex items-center mt-4">
            <span className="text-2xl mr-2">
              <FaCar />
            </span>
            <span className="text-2xl mx-2">➡️</span>
            <span className="text-2xl mr-2">
            <BsFillFuelPumpFill />
            </span>
            
            <span className="ml-4 text-3xl font-semibold">
              Estimated distance of <span className="text-blue-600">{parseFloat((10*(sensorData["FUEL_LEVEL"])/100 * 73) as any).toFixed()} km</span>
            </span>
          </div>
        </div>
      );
    }

    if (selectedTab === 'trips') {
      if (error) {
        return <div>{error}</div>;
      }

      if (isTripsLoading) {
        return <div>Loading trips data...</div>;
      }

      if (!tripsData || tripsData.length === 0) {
        return (
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Trips</h1>
            <p>No trips data available.</p>
          </div>
        );
      }

      const [mostRecentTrip, ...otherTrips] = tripsData;

      const last90Days = new Date();
      last90Days.setDate(last90Days.getDate() - 90);

      const tripsLast90Days = tripsData.filter(
        (trip) => new Date(trip.Date) >= last90Days
      );

      const tripsByDate = tripsLast90Days.reduce((acc: any, trip) => {
        const date = new Date(trip.Date).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, totalFuel: 0 };
        }
        acc[date].totalFuel += trip.FuelConsumption;
        return acc;
      }, {});

      const chartData = Object.values(tripsByDate).map((item: any) => ({
        date: item.date,
        totalFuelConsumption: item.totalFuel,
      }));

      return (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Trips</h1>
          <div className="space-y-4">
            {/* Most Recent Trip */}
            <Card key={mostRecentTrip._id} className="p-4">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">
                  Most Recent Trip on{' '}
                  {new Date(mostRecentTrip.Date).toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent className='text-2xl'>
                <p>
                  Date: {new Date(mostRecentTrip.Date).toLocaleString()}
                </p>
                <p>
                  Distance Travelled: {mostRecentTrip.DistanceTravelled} km
                </p>
                <p>
                  Fuel Consumption: {mostRecentTrip.FuelConsumption} liters
                </p>
                <p>CO₂ Emissions: {mostRecentTrip.CO2Emissions} g</p>
              </CardContent>
            </Card>

            {/* Bar Graph */}
            <h2 className="text-xl font-bold mt-8">
              Total Fuel Consumption (Last 90 Days)
            </h2>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalFuelConsumption" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Previous Trips */}
            {otherTrips.length > 0 && (
              <>
                <h2 className="text-xl font-bold mt-8">Previous Trips</h2>
                {otherTrips.map((trip) => (
                  <Card key={trip._id} className="p-4">
                    <CardHeader>
                      <CardTitle className="text-2xl font-semibold">
                        Trip on {new Date(trip.Date).toLocaleDateString()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='text-2xl'>
                      <p>Date: {new Date(trip.Date).toLocaleString()}</p>
                      <p>Distance Travelled: {trip.DistanceTravelled} km</p>
                      <p>Fuel Consumption: {trip.FuelConsumption} liters</p>
                      <p>CO₂ Emissions: {trip.CO2Emissions} g</p>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </div>
      );
    }

    if (selectedTab === 'DTCs') {
      return (
        <div className="p-4 h-full">
  <h1 className="text-2xl font-bold mb-4">DTC Information</h1>

  {dtcs.length > 0 ? (
    <ScrollArea className="h-[390px] overflow-y-auto">
      <ul className="space-y-4">
        {dtcs.map((dtc) => (
          <li
            key={dtc.code}
            className={`p-4 rounded border ${
              dtc.severity === 'danger'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-lg font-bold ${
                  dtc.severity === 'danger'
                    ? 'text-red-500'
                    : 'text-gray-800'
                }`}
              >
                {dtc.code}
              </span>
              {dtc.severity === 'danger' ? (
                <AlertCircle className="text-red-500" />
              ) : (
                <IoIosWarning className="text-yellow-500 text-3xl" />

              )}
            </div>
            <p className="text-gray-600 text-sm mt-2">{dtc.description}</p>
          </li>
        ))}
      </ul>
    </ScrollArea>
  ) : (
    <p className="text-center text-gray-500">No DTCs found.</p>
  )}
</div>

      );
    }
  };

  return (
    <div
      className="relative"
      style={{ width: '800px', height: '480px', margin: '0 auto', overflow: 'hidden' }}
    >
      {/* Sidebar */}
      <div
        className="bg-black text-white flex flex-col"
        style={{
          width: '150px',
          height: '480px',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <div className="p-4">
          <h2 className="text-2xl font-bold">Menu</h2>
        </div>
        <div className="flex-grow">
          <button
            className={`w-full p-4 text-xl text-left flex items-center gap-4 ${
              selectedTab === 'DTCs' ? 'bg-gray-700' : ''
            }`}
            onClick={() => setSelectedTab('DTCs')}
          >
            <TbEngine className="text-3xl" />
            DTCs
          </button>
          <button
            className={`w-full p-4 text-xl text-left flex items-center gap-4 ${
              selectedTab === 'obd' ? 'bg-gray-700' : ''
            }`}
            onClick={() => setSelectedTab('obd')}
          >
            <FaCar className="text-2xl" />
            Info
          </button>
          <button
            className={`w-full p-4 text-xl text-left flex items-center gap-4 ${
              selectedTab === 'maps' ? 'bg-gray-700' : ''
            }`}
            onClick={() => setSelectedTab('maps')}
          >
            <FaMapMarkerAlt className="text-2xl" />
            Maps
          </button>
          <button
            className={`w-full p-4 text-xl text-left flex items-center gap-4 ${
              selectedTab === 'trips' ? 'bg-gray-700' : ''
            }`}
            onClick={() => setSelectedTab('trips')}
          >
            <GiTreasureMap className="text-2xl" />
            Trips
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div
        className="bg-gray-100"
        style={{
          marginLeft: '150px',
          height: '480px',
          overflowY: 'auto',
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
}
