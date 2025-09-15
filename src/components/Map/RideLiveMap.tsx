import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Props = {
  rideId: string;
  driverPosition?: { lat: number; lng: number } | null;
  passengerPosition?: { lat: number; lng: number } | null;
  height?: number | string;
  fromAddress?: string;
  toAddress?: string;
};

const RideLiveMap: React.FC<Props> = ({ rideId: _rideId, driverPosition, passengerPosition, height = 260, fromAddress, toAddress }) => {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const driverMarkerRef = useRef<any>(null);
  const paxMarkerRef = useRef<any>(null);
  const driverTrailRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    driverTrailRef.current = L.polyline([], { color: '#2563eb', weight: 3, opacity: 0.8 }).addTo(map);
    map.setView([0.0236, 37.9062], 6);

    return () => {
      try {
        if (routeLineRef.current) {
          map.removeLayer(routeLineRef.current);
          routeLineRef.current = null;
        }
        if (driverMarkerRef.current) {
          map.removeLayer(driverMarkerRef.current);
          driverMarkerRef.current = null;
        }
        if (paxMarkerRef.current) {
          map.removeLayer(paxMarkerRef.current);
          paxMarkerRef.current = null;
        }
        if (driverTrailRef.current) {
          map.removeLayer(driverTrailRef.current);
          driverTrailRef.current = null;
        }
        map.remove();
        mapRef.current = null;
      } catch (_) {
        // ignore
      }
    };
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

      // Add point to driver's trail
      if (driverTrailRef.current) {
        driverTrailRef.current.addLatLng([driverPosition.lat, driverPosition.lng]);
        // Trim trail to last 200 points to avoid memory growth
        const latlngs = driverTrailRef.current.getLatLngs();
        if (Array.isArray(latlngs) && latlngs.length > 200) {
          driverTrailRef.current.setLatLngs(latlngs.slice(latlngs.length - 200));
        }
      }

      // Gently keep map centered around driver as they move when only driver shown
      if (!passengerPosition) {
        map.panTo([driverPosition.lat, driverPosition.lng], { animate: true });
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

  // Reset trail when ride changes
  useEffect(() => {
    if (driverTrailRef.current) {
      driverTrailRef.current.setLatLngs([]);
    }
    if (routeLineRef.current) {
      routeLineRef.current.setLatLngs([]);
    }
  }, [_rideId]);

  // Draw route line between fromAddress and toAddress using simple geocode+route
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!fromAddress || !toAddress) return;

    let cancelled = false;

    async function geocode(q: string) {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      if (!res.ok) throw new Error('geocode failed');
      const arr = await res.json();
      if (!Array.isArray(arr) || !arr.length) throw new Error('no results');
      const p = arr[0];
      return { lat: parseFloat(p.lat), lng: parseFloat(p.lon) };
    }

    async function fetchRoute(a: {lat:number; lng:number}, b: {lat:number; lng:number}) {
      // OSRM public demo (rate limited). If fails, fallback to straight line.
      const url = `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('route failed');
      const data = await res.json();
      const coords = data?.routes?.[0]?.geometry?.coordinates || [];
      if (!coords.length) throw new Error('no route');
      return coords.map((c: [number, number]) => L.latLng(c[1], c[0]));
    }

    (async () => {
      try {
        const [a, b] = await Promise.all([geocode(fromAddress), geocode(toAddress)]);
        if (cancelled) return;
        let latlngs: any[];
        try {
          latlngs = await fetchRoute(a, b);
        } catch {
          latlngs = [L.latLng(a.lat, a.lng), L.latLng(b.lat, b.lng)];
        }
        if (cancelled) return;
        if (!routeLineRef.current) {
          routeLineRef.current = L.polyline(latlngs, { color: '#10b981', weight: 4, opacity: 0.8, dashArray: '6,4' }).addTo(map);
        } else {
          routeLineRef.current.setLatLngs(latlngs);
        }
        map.fitBounds(L.latLngBounds(latlngs), { padding: [24, 24] });
      } catch {
        // ignore
      }
    })();

    return () => { cancelled = true; };
  }, [fromAddress, toAddress]);

  return <div ref={containerRef} style={{ height, width: '100%', borderRadius: 8, overflow: 'hidden' }} />;
};

export default RideLiveMap;
