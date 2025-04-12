import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Camera, History, MapPin, Share2, X } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import ModelViewer from '@/components/ModelViewer';

const LOCATIONS = {
  '1': {
    name: 'Eiffel Tower',
    city: 'Paris, France',
    image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=800',
    description: "The Eiffel Tower, completed in 1889, stands as Paris's iconic symbol. This wrought-iron marvel rises 324 meters (1,063 ft) above the city, offering breathtaking views of the French capital.",
    facts: [
      "Originally built as a temporary structure for the 1889 World's Fair",
      "Named after engineer Gustave Eiffel",
      "Takes 20,000 light bulbs to make it sparkle at night",
      "Repainted every 7 years using 60 tons of paint"
    ],
    arContent: {
      model: 'https://models.readyplayer.me/63e4d94d7c40f3bea4f94959.glb',
      description: 'Explore the Eiffel Tower in 3D. Drag to rotate, pinch to zoom.',
    }
  },
  '2': {
    name: 'Colosseum',
    city: 'Rome, Italy',
    image: 'https://images.unsplash.com/photo-1552432134-0e3ef9ceeb1e?auto=format&fit=crop&q=80&w=800',
    description: "The Colosseum, completed in 80 AD, is the largest ancient amphitheater ever built. This architectural marvel could hold up to 50,000-80,000 spectators and hosted gladiatorial contests, animal hunts, and dramatic performances.",
    facts: [
      "Construction took 8-10 years using over 60,000 Jewish slaves",
      "Originally known as the Flavian Amphitheatre",
      "Could be filled with water for mock naval battles",
      "About one-third of the original structure remains"
    ],
    arContent: {
      model: 'https://models.readyplayer.me/63e4d94d7c40f3bea4f94959.glb',
      description: 'Step back in time and explore the Colosseum in 3D.',
    }
  }
};

export default function LocationScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const location = LOCATIONS[id as keyof typeof LOCATIONS];
  const [showAR, setShowAR] = useState(false);

  if (!location) {
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
          <ModelViewer modelUrl={location.arContent.model} />
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
              <Text style={styles.arDescription}>{location.arContent.description}</Text>
            </BlurView>
          </View>
        </View>
      ) : (
        <ScrollView>
          <View style={styles.imageContainer}>
            <Image source={{ uri: location.image }} style={styles.image} />
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}>
              <BlurView intensity={80} style={styles.buttonBlur}>
                <ArrowLeft size={24} color="#ffffff" />
              </BlurView>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.backButton, styles.shareButton]}
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
                  <Text style={styles.city}>{location.city}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.arButton}
                onPress={startARExperience}>
                <Camera size={24} color="#ffffff" />
                <Text style={styles.arButtonText}>View in 3D</Text>
              </TouchableOpacity>
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
    left: undefined,
    right: 16,
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