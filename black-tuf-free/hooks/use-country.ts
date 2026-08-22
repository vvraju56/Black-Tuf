"use client";

import { useState, useEffect, useCallback } from "react";
import {
  COUNTRIES,
  COUNTRY_BY_CODE,
  detectCountry,
  type CountryMeta,
} from "@/utils/constants";

export interface CountryDetection {
  country: CountryMeta;
  isDetected: boolean;
  isLoading: boolean;
  setCountry: (code: string) => void;
}

const STORAGE_KEY = "black-tuf_user_country";

function getStoredCountry(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

function storeCountry(code: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, code);
}

export function useCountryDetection(): CountryDetection {
  const [countryCode, setCountryCode] = useState<string>(() => {
    const stored = getStoredCountry();
    return stored && COUNTRY_BY_CODE[stored] ? stored : detectCountry();
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDetected, setIsDetected] = useState(!getStoredCountry());

  // Try geolocation for finer detection (non-blocking).
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        // Geolocation permission granted — we already have a good guess from
        // timezone/locale, so we just confirm the detection is final.
        setIsDetected(true);
        setIsLoading(false);
      },
      () => {
        // Denied or failed — fall back to timezone/locale detection.
        const detected = detectCountry();
        if (!getStoredCountry()) {
          setCountryCode(detected);
          storeCountry(detected);
        }
        setIsDetected(true);
        setIsLoading(false);
      },
      { timeout: 5000, maximumAge: 600000 },
    );
  }, []);

  const setCountry = useCallback((code: string) => {
    if (!COUNTRY_BY_CODE[code]) return;
    storeCountry(code);
    setCountryCode(code);
    setIsDetected(false);
  }, []);

  // Persist on change.
  useEffect(() => {
    storeCountry(countryCode);
  }, [countryCode]);

  return {
    country: COUNTRY_BY_CODE[countryCode] ?? COUNTRIES[1],
    isDetected,
    isLoading,
    setCountry,
  };
}
