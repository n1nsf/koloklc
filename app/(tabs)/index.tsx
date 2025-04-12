import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Camera, Info } from 'lucide-react-native';
import { Link } from 'expo-router';

const FEATURED_LOCATIONS = [
  {
    id: '1',
    name: 'Eiffel Tower',
    city: 'Paris',
    image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=800',
    description: "Discover the history of Paris's iconic landmark through AR",
  },
  {
    id: '2',
    name: 'Colosseum',
    city: 'Rome',
    image: 'https://images.unsplash.com/photo-1552432134-0e3ef9ceeb1e?auto=format&fit=crop&q=80&w=800',
    description: 'Step back in time to ancient Rome with interactive AR guides',
  },
];

export default function ExploreScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WanderLens</Text>
        <Text style={styles.subtitle}>Explore the world through AR</Text>
      </View>

      <TouchableOpacity style={styles.scanButton}>
        <Camera size={24} color="#ffffff" />
        <Text style={styles.scanButtonText}>Scan Landmark</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Featured Locations</Text>
      
      {FEATURED_LOCATIONS.map((location) => (
        <Link href={`/location/${location.id}`} key={location.id} asChild>
          <TouchableOpacity style={styles.locationCard}>
            <Image source={{ uri: location.image }} style={styles.locationImage} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>{location.name}</Text>
              <Text style={styles.locationCity}>{location.city}</Text>
              <Text style={styles.locationDescription}>{location.description}</Text>
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
  header: {
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
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
    margin: 24,
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
    color: '#0f172a',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  locationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 24,
    overflow: 'hidden',
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
    color: '#0f172a',
  },
  locationCity: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  locationDescription: {
    fontSize: 14,
    color: '#334155',
    marginTop: 8,
    lineHeight: 20,
  },
  arBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  arBadgeText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
});