import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useGameStore } from "@/stores/gameStore";
import { gridToLatLng, latLngToGrid } from "@/utils/routing";
import type { Worker, Job } from "@/types";

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons for different elements
const createCustomIcon = (emoji: string, size: number = 32) => {
  return L.divIcon({
    html: `<div style="
      background: white;
      border: 2px solid #333;
      border-radius: 50%;
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${size * 0.6}px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">${emoji}</div>`,
    className: "custom-div-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Worker icons based on status
const getWorkerIcon = (worker: Worker) => {
  if (worker.isWorking) {
    return createCustomIcon("🚛", 28);
  }
  return createCustomIcon("🛵", 28);
};

// Job icons
const getJobIcon = (job: Job) => {
  if (job.status === "pending") {
    return createCustomIcon("📦", 24);
  }
  return createCustomIcon("🍕", 24);
};

// Coordinate conversion functions are now imported from routing utils

interface CityMapProps {
  onTileClick: (row: number, col: number) => void;
}

// Component to handle map clicks
function MapClickHandler({ onTileClick }: { onTileClick: (row: number, col: number) => void }) {
  const map = useMap();
  
  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const { row, col } = latLngToGrid(lat, lng);
      onTileClick(row, col);
    };
    
    map.on("click", handleClick);
    
    return () => {
      map.off("click", handleClick);
    };
  }, [map, onTileClick]);
  
  return null;
}

export function CityMap({ onTileClick }: CityMapProps) {
  const { workers, jobs } = useGameStore();
  
  // South Berlin center coordinates (Kreuzberg/Neukölln)
  const center: [number, number] = [52.4850, 13.4200]; // Kreuzberg center
  
  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Map click handler */}
        <MapClickHandler onTileClick={onTileClick} />
        
        {/* Worker markers */}
        {workers.map((worker) => {
          const position = gridToLatLng(worker.position.row, worker.position.col);
          return (
            <Marker
              key={worker.id}
              position={[position.lat, position.lng]}
              icon={getWorkerIcon(worker)}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{worker.name}</div>
                  <div>Status: {worker.isWorking ? "Working" : "Available"}</div>
                  <div>Stamina: {worker.stamina}/100</div>
                  <div>Happiness: {worker.happiness}/100</div>
                  {worker.assignedJobId && (
                    <div className="text-blue-600">Assigned to job</div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Job markers */}
        {jobs
          .filter((job) => job.status === "pending" || job.status === "assigned")
          .map((job) => {
            const pickupPosition = gridToLatLng(job.pickup.row, job.pickup.col);
            const dropoffPosition = gridToLatLng(job.dropoff.row, job.dropoff.col);
            
            return (
              <React.Fragment key={job.id}>
                {/* Pickup location */}
                <Marker
                  position={[pickupPosition.lat, pickupPosition.lng]}
                  icon={createCustomIcon("🏪", 26)}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold">Pickup: {job.description}</div>
                      <div>Payment: €{job.payment.toFixed(2)}</div>
                      <div>Status: {job.status}</div>
                      <div>Urgency: {job.urgency}/3</div>
                    </div>
                  </Popup>
                </Marker>
                
                {/* Dropoff location */}
                <Marker
                  position={[dropoffPosition.lat, dropoffPosition.lng]}
                  icon={createCustomIcon("🏠", 26)}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold">Delivery Address</div>
                      <div>For: {job.description}</div>
                      <div>Payment: €{job.payment.toFixed(2)}</div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
      </MapContainer>
      
      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg text-xs z-[1000]">
        <div className="font-semibold mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span>🛵</span>
            <span>Available Courier</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🚛</span>
            <span>Working Courier</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🏪</span>
            <span>Restaurant (Pickup)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🏠</span>
            <span>Customer (Dropoff)</span>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg text-xs z-[1000]">
        <div className="font-semibold mb-1">Kreuzberg & Neukölln Delivery</div>
        <div>Click anywhere on the map to send workers</div>
        <div>Delivering across South Berlin's hippest districts</div>
      </div>
    </div>
  );
}
