import React from 'react';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { Camera, Info } from 'lucide-react-native';
import { Link } from 'expo-router';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Location = Database['public']['Tables']['locations']['Row'];

export default function ExploreScreen() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .eq('featured', true)
          .limit(10);

        if (error) throw error;
        setLocations(data);
      } catch (err) {
        setError('Failed to load locations');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Link href="/" asChild>
          <TouchableOpacity onPress={() => Linking.openURL('https://koloklc.com')}>
            <Image 
              source={require('@/assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Link>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Kolok Learning City</Text>
          <Text style={styles.subtitle}>Explore the world through AR</Text>
        </View>
      </View>
      {/* <Link href="/" asChild>
        <TouchableOpacity style={styles.scanButton} onPress={() => Linking.openURL('https://koloklc.com/app/ar/location')}>
          <Camera size={24} color="#ffffff" />
          <Text style={styles.scanButtonText}>Scan Landmark</Text>
        </TouchableOpacity>
      </Link> */}

      <Text style={styles.sectionTitle}>Featured Locations</Text>
      
      {locations.map((location) => (
        <Link href={`/location/${location.id}`} key={location.id} asChild>
          <TouchableOpacity style={styles.locationCard}>
            <Image source={{ uri: location.image_url }} style={styles.locationImage} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>{location.name}</Text>
              <Text style={styles.locationCity}>{location.city}, {location.country}</Text>
              <Text style={styles.locationDescription} numberOfLines={5}>{location.description}</Text>
              <View style={styles.arBadge}>
                <Info size={16} color="#2563eb" />
                <Text style={styles.arBadgeText}>AR Experience Available</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    padding: 16,
    paddingTop: 24,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    width: 80,
    height: 80,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 8,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    padding: 16,
    paddingBottom: 8,
  },
  locationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationImage: {
    width: '100%',
    height: 200,
  },
  locationInfo: {
    padding: 16,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  locationCity: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  locationDescription: {
    fontSize: 14,
    color: '#475569',
    marginTop: 8,
    lineHeight: 20,
  },
  arBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  arBadgeText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '500',
  },
});