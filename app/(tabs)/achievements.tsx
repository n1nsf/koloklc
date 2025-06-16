import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Linking, Platform } from 'react-native';
import { useAuth } from '@/lib/auth';
import { useCheckIn } from '@/hooks/useCheckIn';
import { LogOut, Trophy, Award } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import type { Database } from '@/types/supabase';

type CheckIn = Database['public']['Tables']['check_ins']['Row'] & {
  missions: Pick<Database['public']['Tables']['missions']['Row'], 'title' | 'description' | 'points'>;
  locations: Pick<Database['public']['Tables']['locations']['Row'], 'name' | 'city' | 'country'>;
};

type Certificate = Database['public']['Tables']['certificates']['Row'] & {
  locations: Pick<Database['public']['Tables']['locations']['Row'], 'name' | 'city' | 'country'>;
};

type Location = Database['public']['Tables']['locations']['Row'] & {
  completed_missions: number;
  total_missions: number;
  total_points: number;
  completed_points: number;
};

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

export default function SettingsScreen() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const { getCheckIns, loading: checkInLoading } = useCheckIn();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [checkInsData, { data: certificatesData }, { data: locationsData }] = await Promise.all([
        getCheckIns(),
        supabase
          .from('certificates')
          .select(`
            *,
            locations:location_id (
              name,
              city,
              country
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('locations')
          .select(`
            *,
            missions:missions(count)
          `)
      ]);

      setCheckIns(checkInsData);
      setCertificates(certificatesData || []);

      // Process locations data to include completion status
      if (locationsData) {
        const processedLocations = await Promise.all(
          locationsData.map(async (location) => {
            const { data: checkIns } = await supabase
              .from('check_ins')
              .select('mission_id, points_earned')
              .eq('user_id', user?.id)
              .eq('location_id', location.id);

            const { data: missions } = await supabase
              .from('missions')
              .select('points')
              .eq('location_id', location.id)
              .eq('active', true);

            const completedMissions = new Set(checkIns?.map(c => c.mission_id)).size;
            const totalMissions = missions?.length || 0;
            const completedPoints = checkIns?.reduce((sum, c) => sum + c.points_earned, 0) || 0;
            const totalPoints = missions?.reduce((sum, m) => sum + m.points, 0) || 0;

            return {
              ...location,
              completed_missions: completedMissions,
              total_missions: totalMissions,
              completed_points: completedPoints,
              total_points: totalPoints,
            };
          })
        );

        setLocations(processedLocations);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleRequestCertificate = async () => {
    Linking.openURL('https://koloklc.com/%e0%b8%a3%e0%b8%b1%e0%b8%9a%e0%b9%80%e0%b8%81%e0%b8%b5%e0%b8%a2%e0%b8%a3%e0%b8%95%e0%b8%b4%e0%b8%9a%e0%b8%b1%e0%b8%95%e0%b8%a3/')
    // if (!user) {
    //   showAlert(
    //     'Login Required',
    //     'Please log in to request a certificate.',
    //     () => router.push('/login')
    //   );
    //   return;
    // }

    // try {
    //   const incompleteLocations = locations.filter(
    //     l => l.completed_missions < l.total_missions
    //   );

    //   if (incompleteLocations.length > 0) {
    //     showAlert(
    //       'Incomplete Locations',
    //       `You need to complete all missions at ${incompleteLocations.length} location(s) to request a master certificate.`
    //     );
    //     return;
    //   }

    //   const totalPoints = locations.reduce((sum, l) => sum + l.completed_points, 0);
    //   const { data: certificate, error } = await supabase
    //     .rpc('generate_certificate', {
    //       p_user_id: user.id,
    //       p_points_earned: totalPoints
    //     });

    //   if (error) throw error;

    //   showAlert(
    //     'Master Certificate Generated',
    //     'Your master certificate has been generated and will be sent to your email shortly.',
    //     () => {
    //       if (certificate?.certificate_url) {
    //         window.open(certificate.certificate_url, '_blank');
    //       }
    //     }
    //   );

    //   // Refresh data
    //   loadData();
    // } catch (err) {
    //   console.error('Error generating certificate:', err);
    //   showAlert('Error', 'Failed to generate certificate. Please try again later.');
    // }
  };

  const totalPoints = checkIns.reduce((sum, checkIn) => sum + checkIn.points_earned, 0);
  const uniqueLocations = new Set(checkIns.map(checkIn => checkIn.location_id)).size;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }
  console.log('locations', locations);
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.subtitle}>Manage your account</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account</Text>
        </View>
        <View style={styles.sectionContent}>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Trophy size={20} color="#0f172a" />
          <Text style={styles.sectionTitle}>Achievements</Text>
        </View>
        <View style={styles.sectionContent}>
          <View style={styles.statsGrid}>
            <View style={styles.statsCard}>
              <Text style={styles.statsValue}>{totalPoints}</Text>
              <Text style={styles.statsLabel}>Total Points</Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsValue}>{checkIns.length}</Text>
              <Text style={styles.statsLabel}>Check-ins</Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsValue}>{uniqueLocations}</Text>
              <Text style={styles.statsLabel}>Locations</Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsValue}>{certificates.length}</Text>
              <Text style={styles.statsLabel}>Certificates</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Award size={20} color="#0f172a" />
          <Text style={styles.sectionTitle}>Master Certificate</Text>
        </View>
        <View style={styles.sectionContent}>
          <View style={styles.masterCertificateCard}>
            <View style={styles.masterCertificateHeader}>
              <Text style={styles.masterCertificateTitle}>Complete All Locations</Text>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>
                  {checkIns.reduce((sum, l) => sum + l.points_earned, 0)}/{locations.reduce((sum, l) => sum + l.total_missions, 0)} pts
                </Text>
              </View>
            </View>
            <Text style={styles.masterCertificateDescription}>
              Complete all missions at every location to earn a master certificate.
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(checkIns.length / locations.reduce((sum, l) => sum + l.total_missions, 0)) * 100}%` 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {checkIns.length} of {locations.length} locations completed
            </Text>
            {checkIns.length >= locations.reduce((sum, l) => sum + l.total_missions, 0) * 0.8 && (
              <TouchableOpacity
                style={styles.masterCertificateButton}
                onPress={handleRequestCertificate}
              >
                <Award size={20} color="#ffffff" />
                <Text style={styles.masterCertificateButtonText}>Request Certificate</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {certificates.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Award size={20} color="#0f172a" />
            <Text style={styles.sectionTitle}>Your Certificates</Text>
          </View>
          <View style={styles.sectionContent}>
            {certificates.map((certificate) => (
              <TouchableOpacity
                key={certificate.id}
                style={styles.certificateCard}
                onPress={() => certificate.certificate_url && Linking.openURL(certificate.certificate_url)}
              >
                <View style={styles.certificateHeader}>
                  <Text style={styles.certificateTitle}>
                    {certificate.locations.name}
                  </Text>
                  <View style={styles.pointsBadge}>
                    <Text style={styles.pointsText}>{certificate.points_earned} pts</Text>
                  </View>
                </View>
                <Text style={styles.certificateLocation}>
                  {certificate.locations.city}, {certificate.locations.country}
                </Text>
                <Text style={styles.certificateDate}>
                  {new Date(certificate.created_at).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {checkIns.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Check-ins</Text>
          </View>
          <View style={styles.sectionContent}>
            {checkIns.map((checkIn) => (
              <View key={checkIn.id} style={styles.checkInCard}>
                <View style={styles.checkInHeader}>
                  <Text style={styles.checkInTitle}>{checkIn.missions.title}</Text>
                  <View style={styles.pointsBadge}>
                    <Text style={styles.pointsText}>+{checkIn.points_earned} pts</Text>
                  </View>
                </View>
                <Text style={styles.checkInLocation}>
                  {checkIn.locations.name}, {checkIn.locations.city}
                </Text>
                <Text style={styles.checkInDate}>
                  {new Date(checkIn.created_at).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <LogOut size={20} color="#ef4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
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
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  section: {
    marginTop: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  sectionContent: {
    padding: 16,
  },
  email: {
    fontSize: 16,
    color: '#64748b',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statsCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  locationCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  locationCity: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
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
    marginBottom: 12,
  },
  certificateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  certificateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  certificateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  certificateBadgeText: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '600',
  },
  certificateCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  certificateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  certificateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  certificateLocation: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  certificateDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  checkInCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  checkInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  checkInTitle: {
    fontSize: 16,
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
  checkInLocation: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  checkInDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 32,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  masterCertificateCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  masterCertificateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  masterCertificateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  masterCertificateDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  masterCertificateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 12,
  },
  masterCertificateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});