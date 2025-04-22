import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Camera, History, MapPin, Share2, X } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
// import ModelViewer from '@/components/ModelViewer';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Location = Database['public']['Tables']['locations']['Row'];

export default function LocationScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [location, setLocation] = useState<Location | null>(null);
  const [showAR, setShowAR] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocation() {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setLocation(data);
      } catch (err) {
        setError('Failed to load location');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLocation();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error || !location) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Location not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startARExperience = () => {
    setShowAR(true);
  };

  return (
    <View style={styles.container}>
      {showAR ? (
        <View style={styles.arContainer}>
          {/* <ModelViewer modelUrl={location.model_url || ''} /> */}
          <View style={styles.arControls}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowAR(false)}>
              <BlurView intensity={80} style={styles.buttonBlur}>
                <X size={24} color="#ffffff" />
              </BlurView>
            </TouchableOpacity>
            <BlurView intensity={80} style={styles.arOverlay}>
              <Text style={styles.arTitle}>3D View</Text>
              <Text style={styles.arDescription}>Explore the {location.name} in 3D. Drag to rotate, pinch to zoom.</Text>
            </BlurView>
          </View>
        </View>
      ) : (
        <ScrollView>
          <View style={styles.imageContainer}>
            <Image source={{ uri: location.image_url }} style={styles.image} />
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}>
              <BlurView intensity={80} style={styles.buttonBlur}>
                <ArrowLeft size={24} color="#ffffff" />
              </BlurView>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={() => {}}>
              <BlurView intensity={80} style={styles.buttonBlur}>
                <Share2 size={24} color="#ffffff" />
              </BlurView>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>{location.name}</Text>
                <View style={styles.locationRow}>
                  <MapPin size={16} color="#64748b" />
                  <Text style={styles.city}>{location.city}, {location.country}</Text>
                </View>
              </View>
              {location.model_url && (
                <TouchableOpacity 
                  style={styles.arButton}
                  onPress={startARExperience}>
                  <Camera size={24} color="#ffffff" />
                  <Text style={styles.arButtonText}>View in 3D</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.description}>{location.description}</Text>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <History size={20} color="#0f172a" />
                <Text style={styles.sectionTitle}>Historical Facts</Text>
              </View>
              {location.facts.map((fact, index) => (
                <View key={index} style={styles.factItem}>
                  <View style={styles.factBullet} />
                  <Text style={styles.factText}>{fact}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
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
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  shareButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  buttonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  city: {
    fontSize: 16,
    color: '#64748b',
  },
  arButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  arButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  factItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  factBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    marginTop: 8,
  },
  factText: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
  arContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  arControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  arOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 48 : 24,
  },
  arTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  arDescription: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 24,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 24,
  },
  backButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
});