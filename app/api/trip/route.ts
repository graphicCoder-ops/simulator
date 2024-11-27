// app/api/sensor-data/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const API = 'http://34.42.34.201:8080';
    const username = 'tirth';
    const response = await fetch(`${API}/trip/get/${username}`, {
      // Ensure fetch is not cached
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch sensor data from external API.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching trip data:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
