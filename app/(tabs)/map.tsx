import { View, Text, StyleSheet } from 'react-native';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Landmarks</Text>
        <Text style={styles.subtitle}>Discover AR experiences around you</Text>
      </View>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.placeholderText}>Map Coming Soon</Text>
        <Text style={styles.placeholderSubtext}>Find AR-enabled landmarks near you</Text>
      </View>
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
});