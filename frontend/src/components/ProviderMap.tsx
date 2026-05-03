"use client";

import { useEffect, useRef } from "react";
import type { ProviderResult } from "@/store/useJourneyStore";

// Leaflet CSS is loaded in globals.css via @import

interface ProviderMapProps {
  providers: ProviderResult[];
  centerLat?: number;
  centerLng?: number;
  onSelectProvider?: (p: ProviderResult) => void;
}

export default function ProviderMap({ providers, centerLat, centerLng, onSelectProvider }: ProviderMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;

    // Dynamic import — Leaflet must only run client-side
    import("leaflet").then((L) => {
      // Clean up old map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const validProviders = providers.filter(p => p.latitude && p.longitude);
      if (validProviders.length === 0) return;

      const defaultLat = centerLat || validProviders[0]?.latitude || 18.52;
      const defaultLng = centerLng || validProviders[0]?.longitude || 73.86;

      const map = L.map(mapRef.current!, {
        scrollWheelZoom: true,
        zoomControl: true,
      }).setView([defaultLat, defaultLng], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        maxZoom: 18,
      }).addTo(map);

      // Tier-specific marker colors
      const tierColors: Record<string, string> = {
        PREMIUM: "#7C3AED",  // purple
        MID: "#0891B2",      // teal (primary)
        BUDGET: "#16A34A",   // green
      };

      // Add markers
      validProviders.forEach((p) => {
        const color = tierColors[p.tier] || "#0891B2";
        const tierBadge = p.tier === "PREMIUM" ? "₹₹₹" : p.tier === "MID" ? "₹₹" : "₹";

        const markerIcon = L.divIcon({
          className: "custom-marker",
          html: `<div style="width:32px;height:32px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/></svg>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -34],
        });

        // Stars display
        const stars = "★".repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? "½" : "");

        const popup = L.popup({ className: "provider-popup", maxWidth: 260 }).setContent(`
          <div style="font-family:system-ui;min-width:200px;">
            <div style="font-weight:600;font-size:14px;margin-bottom:4px;">${p.name}</div>
            <div style="font-size:12px;color:#666;margin-bottom:4px;">${p.distance} km · ${tierBadge}</div>
            <div style="font-size:12px;color:#F59E0B;margin-bottom:8px;">${stars} <span style="color:#999;">(${p.reviewCount})</span></div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:13px;font-weight:500;">${p.costEstimate}</span>
              <span style="background:${color};color:white;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;">${p.rankingScore}</span>
            </div>
            <button data-provider-id="${p.id}" style="margin-top:8px;width:100%;padding:6px;background:${color};color:white;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;">View Cost Details</button>
          </div>
        `);

        L.marker([p.latitude, p.longitude], { icon: markerIcon })
          .addTo(map)
          .bindPopup(popup);
      });

      // Handle popup button clicks via event delegation
      map.on("popupopen", () => {
        const btns = document.querySelectorAll("[data-provider-id]");
        btns.forEach((btn) => {
          btn.addEventListener("click", (e) => {
            const id = (e.currentTarget as HTMLElement).getAttribute("data-provider-id");
            const provider = providers.find(p => p.id === id);
            if (provider && onSelectProvider) {
              onSelectProvider(provider);
            }
          });
        });
      });

      // Fit bounds if multiple providers
      if (validProviders.length > 1) {
        const bounds = L.latLngBounds(validProviders.map((p) => [p.latitude, p.longitude] as [number, number]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [providers, centerLat, centerLng]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={mapRef}
      className="w-full h-[500px] rounded-2xl overflow-hidden border border-foreground/10"
      style={{ zIndex: 0 }}
    />
  );
}
