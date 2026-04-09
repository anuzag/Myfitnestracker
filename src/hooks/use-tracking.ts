"use client";

import { useState, useEffect, useRef } from "react";
import { haversineDistance } from "@/lib/haversine";
import { insforge } from "@/lib/insforge";
import { calculateCalories } from "@/lib/calories";

interface Location {
  lat: number;
  lng: number;
  timestamp: number;
}

export function useTracking() {
  const [isTracking, setIsTracking] = useState(false);
  const [distance, setDistance] = useState(0); // in km
  const [duration, setDuration] = useState(0); // in seconds
  const [calories, setCalories] = useState(0);
  const [path, setPath] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  const watchId = useRef<number | null>(null);
  const passiveWatchId = useRef<number | null>(null);
  const timerId = useRef<NodeJS.Timeout | null>(null);
  const lastLocation = useRef<Location | null>(null);

  // Passive watch for live map updates even when not tracking
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      passiveWatchId.current = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: position.timestamp,
          });
        },
        (err) => console.log("Passive watch error:", err),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
    }

    return () => {
      if (passiveWatchId.current !== null) {
        navigator.geolocation.clearWatch(passiveWatchId.current);
      }
    };
  }, []);

  const startTracking = (activityType: string = "walk") => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsTracking(true);
    setDistance(0);
    setDuration(0);
    setCalories(0);
    setPath([]);
    lastLocation.current = null;

    // Start timer
    timerId.current = setInterval(() => {
      setDuration((prev) => {
        const nextDuration = prev + 1;
        setCalories(calculateCalories(activityType, nextDuration));
        return nextDuration;
      });
    }, 1000);

    // Start watching position
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation: Location = {
          lat: latitude,
          lng: longitude,
          timestamp: position.timestamp,
        };

        setCurrentLocation(newLocation);
        setPath((prev) => [...prev, newLocation]);
        setError(null); // Clear any previous timeout/error

        if (lastLocation.current) {
          const d = haversineDistance(
            lastLocation.current.lat,
            lastLocation.current.lng,
            newLocation.lat,
            newLocation.lng
          );
          // Only add distance if it's significant (e.g., > 10 meters)
          if (d > 0.01) {
            setDistance((prev) => prev + d);
            lastLocation.current = newLocation;
          }
        } else {
           lastLocation.current = newLocation;
        }
      },
      (err) => {
        setError(err.message);
        // Only stop tracking on fatal errors (1: Denied, 2: Unavailable)
        // Code 3 is TIMEOUT - we want to keep trying
        if (err.code !== 3) {
          stopTracking();
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  const stopTracking = async () => {
    setIsTracking(false);
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (timerId.current !== null) {
      clearInterval(timerId.current);
      timerId.current = null;
    }
    setCalories(0);
  };

  const saveActivity = async (userId: string, type: string = "walk") => {
    if (path.length < 2) return { error: "Not enough data to save activity" };

    const { data, error: saveError } = await insforge.database
      .from("activities")
      .insert({
        user_id: userId,
        type,
        distance,
        duration,
        calories,
        gps_path: path,
        date: new Date().toISOString(),
      })
      .select();

    return { data, error: saveError };
  };

  useEffect(() => {
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      if (timerId.current !== null) clearInterval(timerId.current);
    };
  }, []);

  return {
    isTracking,
    distance,
    duration,
    calories,
    path,
    currentLocation,
    error,
    startTracking,
    stopTracking,
    saveActivity,
  };
}
