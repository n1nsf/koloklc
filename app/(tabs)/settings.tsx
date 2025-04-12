import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Bell, Globe, Moon, Share2 } from 'lucide-react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your experience</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Globe size={24} color="#64748b" />
            <Text style={styles.settingText}>Language</Text>
          </View>
          <Text style={styles.settingValue}>English</Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Moon size={24} color="#64748b" />
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch value={false} />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Bell size={24} color="#64748b" />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch value={true} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Share</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Share2 size={24} color="#ffffff" />
          <Text style={styles.shareButtonText}>Share WanderLens</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Version 1.0.0</Text>
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
  section: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#1e293b',
  },
  settingValue: {
    fontSize: 16,
    color: '#64748b',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 24,
    fontSize: 14,
  },
});