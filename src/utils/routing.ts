// Routing utilities using OSRM (Open Source Routing Machine)

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface Route {
  coordinates: RoutePoint[];
  distance: number; // in meters
  duration: number; // in seconds
}

// Get route between two points using OSRM
export const getRoute = async (
  start: RoutePoint,
  end: RoutePoint
): Promise<Route | null> => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn("OSRM routing failed, using direct path");
      return getDirectRoute(start, end);
    }

    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coordinates = route.geometry.coordinates.map(
        (coord: [number, number]) => ({
          lat: coord[1],
          lng: coord[0],
        })
      );

      return {
        coordinates,
        distance: route.distance,
        duration: route.duration,
      };
    }

    // Fallback to direct route
    return getDirectRoute(start, end);
  } catch (error) {
    console.warn("Routing error, using direct path:", error);
    return getDirectRoute(start, end);
  }
};

// Fallback: direct line between points
const getDirectRoute = (start: RoutePoint, end: RoutePoint): Route => {
  const distance = calculateDistance(start, end);
  const duration = distance / 8.33; // Assume ~30 km/h average speed

  return {
    coordinates: [start, end],
    distance,
    duration,
  };
};

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (
  point1: RoutePoint,
  point2: RoutePoint
): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) *
      Math.cos(toRadians(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Interpolate along a route for smooth animation
export const interpolateRoute = (
  route: RoutePoint[],
  progress: number
): RoutePoint => {
  if (route.length === 0) return { lat: 0, lng: 0 };
  if (route.length === 1) return route[0];
  if (progress <= 0) return route[0];
  if (progress >= 1) return route[route.length - 1];

  const totalSegments = route.length - 1;
  const segmentIndex = Math.floor(progress * totalSegments);
  const segmentProgress = progress * totalSegments - segmentIndex;

  if (segmentIndex >= totalSegments) return route[route.length - 1];

  const start = route[segmentIndex];
  const end = route[segmentIndex + 1];

  return {
    lat: start.lat + (end.lat - start.lat) * segmentProgress,
    lng: start.lng + (end.lng - start.lng) * segmentProgress,
  };
};

// Convert grid coordinates to South Berlin lat/lng (Kreuzberg/Neukölln area)
export const gridToLatLng = (row: number, col: number): RoutePoint => {
  const bounds = {
    north: 52.51, // ~Kreuzberg North (around Landwehrkanal)
    south: 52.46, // ~Neukölln South (around Britz)
    east: 13.46, // ~Treptow
    west: 13.38, // ~Schöneberg
  };

  const lat = bounds.south + (row / 11) * (bounds.north - bounds.south);
  const lng = bounds.west + (col / 11) * (bounds.east - bounds.west);

  return { lat, lng };
};

// Convert lat/lng back to grid coordinates
export const latLngToGrid = (
  lat: number,
  lng: number
): { row: number; col: number } => {
  const bounds = {
    north: 52.51, // ~Kreuzberg North (around Landwehrkanal)
    south: 52.46, // ~Neukölln South (around Britz)
    east: 13.46, // ~Treptow
    west: 13.38, // ~Schöneberg
  };

  const row = Math.round(
    ((lat - bounds.south) / (bounds.north - bounds.south)) * 11
  );
  const col = Math.round(
    ((lng - bounds.west) / (bounds.east - bounds.west)) * 11
  );

  return {
    row: Math.max(0, Math.min(11, row)),
    col: Math.max(0, Math.min(11, col)),
  };
};
