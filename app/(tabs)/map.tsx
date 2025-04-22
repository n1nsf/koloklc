import { View, Text, StyleSheet, Platform } from 'react-native';
import { MapPin } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Location = Database['public']['Tables']['locations']['Row'];

const NARATHIWAT_COORDS = {
  lat: 6.0691082,
  lng: 101.833148
};


declare global {
  interface Window {
    longdo: any;
    map: any;
    navigateToLocation: (id: string) => void;
  }
}

export default function MapScreen() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchLocations() {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('*');

        if (error) throw error;
        setLocations(data || []);
      } catch (err) {
        setError('Failed to load locations');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && !loading && locations.length > 0) {
      const script = document.createElement('script');
      script.src = `https://api.longdo.com/map/?key=0c293ce1bb81ed7264e852f54ae1955e`;
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const { longdo } = window;
        if (mapContainerRef.current && longdo) {
          const map = new longdo.Map({
            placeholder: mapContainerRef.current,
            language: 'en',
          });

          const centerLat = NARATHIWAT_COORDS.lat;
          const centerLng = NARATHIWAT_COORDS.lng;
          
          map.location({ lon: centerLng, lat: centerLat }, true);
          map.zoom(10, true);

          // Define navigation function globally
          window.navigateToLocation = (locationId: string) => {
            router.push(`/location/${locationId}`);
          };

          locations.forEach(location => {
            if (location.latitude && location.longitude) {

              const marker = new longdo.Marker(
                { lon: location.longitude, lat: location.latitude },
                {
                  title: location.name,
                  detail: `
                    <button onclick="navigateToLocation('${location.id}')" style="background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background-color 0.2s;">View Details</button>
                  `,
                  visibleRange: { min: 7, max: 18 },
                  draggable: false,
                  weight: longdo.OverlayWeight.Top,
                  clickable: true,
                }
              );

              map.Overlays.add(marker);
            }
          });

          // Set map style
          map.Layers.setBase(longdo.Layers.GRAY);
        }
      };

      return () => {
        document.body.removeChild(script);
        // delete window.navigateToLocation;
      };
    }
  }, [loading, locations, router]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Nearby Landmarks</Text>
          <Text style={styles.subtitle}>Discover AR experiences around you</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading locations...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Nearby Landmarks</Text>
          <Text style={styles.subtitle}>Discover AR experiences around you</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Landmarks</Text>
        <Text style={styles.subtitle}>Discover AR experiences around you</Text>
      </View>
      
      {Platform.OS === 'web' ? (
        <View style={styles.mapContainer}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
        </View>
      ) : (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.placeholderText}>Map Coming Soon</Text>
          <Text style={styles.placeholderSubtext}>Find AR-enabled landmarks near you</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  mapContainer: {
    flex: 1,
    height: 500,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
    margin: 16,
    borderRadius: 12,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
    margin: 16,
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
    margin: 16,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
});