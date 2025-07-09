import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Camera, History, MapPin, Share2, X, Trophy, Award, Navigation } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
// import ModelViewer from '@/components/ModelViewer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useCheckIn } from '@/hooks/useCheckIn';
import type { Database } from '@/types/supabase';

type Location = Database['public']['Tables']['locations']['Row'];
type Mission = Database['public']['Tables']['missions']['Row'];
type CheckIn = Database['public']['Tables']['check_ins']['Row'] & {
  missions: Pick<Mission, 'title' | 'description' | 'points'>;
  locations: Pick<Location, 'name' | 'city' | 'country'>;
};

type RecommendedLocation = Location & {
  priority: number;
  reason: string | null;
};

// Function to calculate distance between two points using Haversine formula
// const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
//   const R = 6371; // Earth's radius in kilometers
//   const dLat = (lat2 - lat1) * Math.PI / 180;
//   const dLon = (lon2 - lon1) * Math.PI / 180;
//   const a = 
//     Math.sin(dLat/2) * Math.sin(dLat/2) +
//     Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
//     Math.sin(dLon/2) * Math.sin(dLon/2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//   return R * c;
// };

const showAlert = (title: string, message: string, onConfirm?: () => void) => {
  if (Platform.OS === 'web') {
    if (onConfirm) {
      if (window.confirm(`${title}\n${message}`)) {
        onConfirm();
      }
    } else {
      window.alert(`${title}\n${message}`);
    }
  } else {
    Alert.alert(
      title,
      message,
      onConfirm ? [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: onConfirm,
        },
      ] : undefined
    );
  }
};

export default function LocationScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { getMissions, checkIn, loading: checkInLoading } = useCheckIn();
  const [location, setLocation] = useState<Location | null>(null);
  const [showAR, setShowAR] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set());
  // const [nearbyLocations, setNearbyLocations] = useState<Location[]>([]);
  const [recommendedLocations, setRecommendedLocations] = useState<RecommendedLocation[]>([]);

  useEffect(() => {
    fetchLocation();
  }, [id]);

  const fetchLocation = async () => {
    try {
      const { data: locationData, error: locationError } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .single();

      if (locationError) throw locationError;
      setLocation(locationData);

      const missionsData = await getMissions(id as string);
      setMissions(missionsData);

      // Fetch completed missions only if user is logged in
      if (user) {
        const { data: checkIns } = await supabase
          .from('check_ins')
          .select('mission_id')
          .eq('user_id', user.id)
          .eq('location_id', id);

        if (checkIns) {
          setCompletedMissions(new Set(checkIns.map(checkIn => checkIn.mission_id)));
        }
      }

      // Fetch nearby locations if current location has coordinates
      // if (locationData.latitude && locationData.longitude) {
      //   const { data: allLocations } = await supabase
      //     .from('locations')
      //     .select('*')
      //     .neq('id', id); // Exclude current location

      //   if (allLocations) {
      //     const nearby = allLocations
      //       .filter(loc => loc.latitude && loc.longitude)
      //       .map(loc => ({
      //         ...loc,
      //         distance: calculateDistance(
      //           locationData.latitude!,
      //           locationData.longitude!,
      //           loc.latitude!,
      //           loc.longitude!
      //         )
      //       }))
      //       .sort((a, b) => a.distance - b.distance)
      //       .slice(0, 3); // Show top 3 nearest locations

      //     setNearbyLocations(nearby);
      //   }
      // }

      // Fetch recommended locations
      await fetchRecommendedLocations();
    } catch (err) {
      setError('Failed to load location');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedLocations = async () => {
    try {
      // Use the new Supabase function to get recommended locations
      const { data: recommendedData, error } = await supabase
        .rpc('get_recommended_locations', {
          p_source_location_id: id as string
        });

      if (error) {
        console.error('Error fetching recommended locations:', error);
        return;
      }

      if (recommendedData) {
        // Filter out locations user has already completed if logged in
        let filteredRecommendations = recommendedData;
        
        if (user) {
          const { data: userCheckIns } = await supabase
            .from('check_ins')
            .select('location_id')
            .eq('user_id', user.id);
          
          if (userCheckIns) {
            const userCompletedLocations = new Set(userCheckIns.map(c => c.location_id));
            filteredRecommendations = recommendedData.filter(
              (loc: RecommendedLocation) => !userCompletedLocations.has(loc.id)
            );
          }
        }

        setRecommendedLocations(filteredRecommendations);
      }
    } catch (err) {
      console.error('Error fetching recommended locations:', err);
    }
  };

  const handleCheckIn = async (missionId: string) => {
    if (!user) {
      showAlert(
        'Login Required',
        'Please log in to check in at this location and earn points.',
        () => router.push('/login')
      );
      return;
    }

    try {
      console.log('checkIn', id, missionId);
      const result = await checkIn(id as string, missionId);
      console.log('result', result);
      if (result) {
        showAlert('Success', 'Check-in successful!');
        setCompletedMissions(prev => new Set([...prev, missionId]));
        fetchLocation(); // Refresh missions
      }
    } catch (err) {
      showAlert('Error', 'Failed to check in');
      console.error('Error:', err);
    }
  };

  const handleRequestCertificate = async () => {
    if (!user) {
      showAlert(
        'Login Required',
        'Please log in to request a certificate.',
        () => router.push('/login')
      );
      return;
    }

    try {
      const { data: certificate, error } = await supabase
        .rpc('generate_certificate', {
          p_user_id: user.id,
          p_location_id: id as string,
          p_points_earned: completedPoints
        });

      if (error) throw error;

      showAlert(
        'Certificate Generated',
        'Your certificate has been generated and will be sent to your email shortly.',
        () => {
          if (certificate?.certificate_url) {
            // Open certificate URL in new tab/window
            window.open(certificate.certificate_url, '_blank');
          }
        }
      );
    } catch (err) {
      console.error('Error generating certificate:', err);
      showAlert('Error', 'Failed to generate certificate. Please try again later.');
    }
  };

  const totalPoints = missions.reduce((sum, mission) => sum + mission.points, 0);
  const completedPoints = missions
    .filter(mission => completedMissions.has(mission.id))
    .reduce((sum, mission) => sum + mission.points, 0);
  const isAllCompleted = missions.length > 0 && completedMissions.size === missions.length;

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
    // setShowAR(true);
    // router.push('/scan');
    window.location.href = location.model_url || '';
  };

  const handleNavigation = () => {
    if (!location.latitude || !location.longitude) {
      showAlert('Navigation Unavailable', 'Location coordinates are not available for navigation.');
      return;
    }

    const lat = location.latitude;
    const lng = location.longitude;
    const label = encodeURIComponent(location.name);
    
    let url;
    if (Platform.OS === 'ios') {
      url = `http://maps.apple.com/?q=${label}&ll=${lat},${lng}`;
    } else {
      url = `geo:${lat},${lng}?q=${lat},${lng}(${label})`;
    }

    Linking.openURL(url).catch(() => {
      // Fallback to Google Maps web
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      Linking.openURL(googleMapsUrl);
    });
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
        <ScrollView style={styles.scrollView}>
          <Image source={{ uri: location.image_url }} style={styles.image} />

          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={2}>{location.name}</Text>
                <View style={styles.locationContainer}>
                  <View style={styles.locationRow}>
                    <MapPin size={16} color="#64748b" />
                    <Text style={styles.city}>{location.city}, {location.country}</Text>
                  </View>
                  <View style={styles.actionButtons}>
                    {location.latitude && location.longitude && (
                      <TouchableOpacity 
                        style={styles.navigationButton}
                        onPress={handleNavigation}>
                        <Navigation size={20} color="#ffffff" />
                        <Text style={styles.navigationButtonText}>Navigate</Text>
                      </TouchableOpacity>
                    )}
                    {location.model_url && (
                      <TouchableOpacity 
                        style={styles.arButton}
                        onPress={startARExperience}>
                        <Camera size={24} color="#ffffff" />
                        <Text style={styles.arButtonText}>Scan AR</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {user && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Progress</Text>
                  <Text style={styles.progressPoints}>{completedPoints}/{totalPoints} points</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(completedPoints / totalPoints) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {completedMissions.size} of {missions.length} missions completed
                </Text>
              </View>
            )}

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

            {missions.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Trophy size={20} color="#0f172a" />
                  <Text style={styles.sectionTitle}>Missions</Text>
                </View>
                {missions.map((mission) => (
                  <View key={mission.id} style={styles.missionCard}>
                    <View style={styles.missionHeader}>
                      <Text style={styles.missionTitle}>{mission.title}</Text>
                      <View style={styles.pointsBadge}>
                        <Text style={styles.pointsText}>{mission.points} pts</Text>
                      </View>
                    </View>
                    <Text style={styles.missionDescription}>{mission.description}</Text>
                    <TouchableOpacity
                      style={[
                        styles.checkInButton,
                        completedMissions.has(mission.id) && styles.checkInButtonCompleted
                      ]}
                      onPress={() => handleCheckIn(mission.id)}
                      disabled={checkInLoading || completedMissions.has(mission.id)}
                    >
                      {checkInLoading ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text style={styles.checkInButtonText}>
                          {completedMissions.has(mission.id) ? 'Completed' : 'Check In'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {recommendedLocations.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Trophy size={20} color="#0f172a" />
                  <Text style={styles.sectionTitle}>Recommended Next Locations</Text>
                </View>
                {recommendedLocations.map((recommendedLocation) => (
                  <TouchableOpacity
                    key={recommendedLocation.id}
                    style={styles.recommendedLocationCard}
                    onPress={() => router.push(`/location/${recommendedLocation.id}`)}
                  >
                    <Image 
                      source={{ uri: recommendedLocation.image_url }} 
                      style={styles.recommendedLocationImage} 
                    />
                    <View style={styles.recommendedLocationInfo}>
                      <View style={styles.recommendedLocationHeader}>
                        <Text style={styles.recommendedLocationName}>{recommendedLocation.name}</Text>
                        <View style={styles.recommendedLocationBadges}>
                          {recommendedLocation.featured && (
                            <View style={styles.featuredBadge}>
                              <Text style={styles.featuredBadgeText}>Featured</Text>
                            </View>
                          )}
                          <View style={styles.priorityBadge}>
                            <Text style={styles.priorityBadgeText}>Priority {recommendedLocation.priority}</Text>
                          </View>
                        </View>
                      </View>
                      <Text style={styles.recommendedLocationCity}>
                        {recommendedLocation.city}, {recommendedLocation.country}
                      </Text>
                      {recommendedLocation.reason && (
                        <Text style={styles.recommendedLocationReason}>
                          {recommendedLocation.reason}
                        </Text>
                      )}
                      <Text style={styles.recommendedLocationDescription} numberOfLines={2}>
                        {recommendedLocation.description}
                      </Text>
                    </View>
                    <View style={styles.recommendedLocationArrow}>
                      <ArrowLeft size={16} color="#64748b" style={{ transform: [{ rotate: '180deg' }] }} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* {nearbyLocations.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Navigation size={20} color="#0f172a" />
                  <Text style={styles.sectionTitle}>Nearby Locations</Text>
                </View>
                {nearbyLocations.map((nearbyLocation) => (
                  <TouchableOpacity
                    key={nearbyLocation.id}
                    style={styles.nearbyLocationCard}
                    onPress={() => router.push(`/location/${nearbyLocation.id}`)}
                  >
                    <Image 
                      source={{ uri: nearbyLocation.image_url }} 
                      style={styles.nearbyLocationImage} 
                    />
                    <View style={styles.nearbyLocationInfo}>
                      <Text style={styles.nearbyLocationName}>{nearbyLocation.name}</Text>
                      <Text style={styles.nearbyLocationCity}>
                        {nearbyLocation.city}, {nearbyLocation.country}
                      </Text>
                      <Text style={styles.nearbyLocationDistance}>
                        {(nearbyLocation as any).distance.toFixed(1)} km away
                      </Text>
                    </View>
                    <View style={styles.nearbyLocationArrow}>
                      <ArrowLeft size={16} color="#64748b" style={{ transform: [{ rotate: '180deg' }] }} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )} */}

            

            {user && isAllCompleted && (
              <TouchableOpacity 
                style={styles.certificateButton}
                onPress={handleRequestCertificate}
              >
                <Award size={20} color="#ffffff" />
                <Text style={styles.certificateButtonText}>Request Certificate</Text>
              </TouchableOpacity>
            )}
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
  scrollView: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  titleContainer: {
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  locationContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  city: {
    fontSize: 16,
    color: '#64748b',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  navigationButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  arButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  arButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
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
  missionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  pointsBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  missionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  checkInButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkInButtonCompleted: {
    backgroundColor: '#22c55e',
  },
  checkInButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
  buttonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 24,
  },
  backButton: {
    marginTop: 12,
  },
  backButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  progressPoints: {
    fontSize: 14,
    color: '#64748b',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  certificateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  certificateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  nearbyLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  nearbyLocationImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  nearbyLocationInfo: {
    flex: 1,
  },
  nearbyLocationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  nearbyLocationCity: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  nearbyLocationDistance: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  nearbyLocationArrow: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendedLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  recommendedLocationImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  recommendedLocationInfo: {
    flex: 1,
  },
  recommendedLocationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  recommendedLocationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  recommendedLocationBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  featuredBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  recommendedLocationCity: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  recommendedLocationReason: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  recommendedLocationDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  recommendedLocationArrow: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});