import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Props = {
  rideId: string;
  driverPosition?: { lat: number; lng: number } | null;
  passengerPosition?: { lat: number; lng: number } | null;
  height?: number | string;
};

const RideLiveMap: React.FC<Props> = ({ rideId, driverPosition, passengerPosition, height = 260 }) => {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const driverMarkerRef = useRef<any>(null);
  const paxMarkerRef = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    map.setView([0.0236, 37.9062], 6);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (driverPosition) {
      if (!driverMarkerRef.current) {
        driverMarkerRef.current = L.marker([driverPosition.lat, driverPosition.lng], {
          title: 'Driver',
          icon: L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          }),
        }).addTo(map);
      } else {
        driverMarkerRef.current.setLatLng([driverPosition.lat, driverPosition.lng]);
      }
    }

    if (passengerPosition) {
      if (!paxMarkerRef.current) {
        paxMarkerRef.current = L.marker([passengerPosition.lat, passengerPosition.lng], {
          title: 'You',
          opacity: 0.85,
        }).addTo(map);
      } else {
        paxMarkerRef.current.setLatLng([passengerPosition.lat, passengerPosition.lng]);
      }
    }

    const points: any[] = [];
    if (driverPosition) points.push([driverPosition.lat, driverPosition.lng]);
    if (passengerPosition) points.push([passengerPosition.lat, passengerPosition.lng]);

    if (points.length === 2) {
      map.fitBounds(L.latLngBounds(points), { padding: [24, 24] });
    } else if (points.length === 1) {
      map.setView(points[0], 14);
    }
  }, [driverPosition, passengerPosition]);

  return <div ref={containerRef} style={{ height, width: '100%', borderRadius: 8, overflow: 'hidden' }} />;
};

export default RideLiveMap;
