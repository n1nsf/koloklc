import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Crosshair } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    requestPermission();
  }, []);

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera size={48} color="#64748b" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to enable AR landmark scanning
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Access</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleScan = () => {
    setScanning(true);
    // Simulate landmark detection
    setTimeout(() => {
      setScanning(false);
      router.push('/location/1');
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}>
              <BlurView intensity={80} style={styles.buttonBlur}>
                <ArrowLeft size={24} color="#ffffff" />
              </BlurView>
            </TouchableOpacity>
          </View>

          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <Crosshair size={48} color="#ffffff" />
            </View>
            {scanning && (
              <BlurView intensity={80} style={styles.scanningOverlay}>
                <Text style={styles.scanningText}>Scanning Landmark...</Text>
              </BlurView>
            )}
          </View>

          <View style={styles.footer}>
            <BlurView intensity={80} style={styles.instructions}>
              <Text style={styles.instructionsText}>
                Point your camera at a landmark to scan
              </Text>
            </BlurView>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleScan}
              disabled={scanning}>
              <BlurView intensity={80} style={styles.buttonBlur}>
                <Camera size={32} color="#ffffff" />
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
  },
  backButton: {
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
  scanArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanningOverlay: {
    position: 'absolute',
    bottom: 100,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  scanningText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  instructions: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  instructionsText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  scanButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
  },
  permissionText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});