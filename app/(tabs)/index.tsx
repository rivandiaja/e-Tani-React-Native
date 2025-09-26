import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
// 1. Impor SafeAreaView dan useSafeAreaInsets
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import WelcomeCard from '../../components/WelcomeCard';
import SensorGrid from '../../components/SensorGrid';
import ChartSection from '../../components/ChartSection';

// Tipe data untuk histori sensor
export interface RawPoint {
  ts: number;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  waterTank: number;
  battery: number;
}

// Tipe data untuk state sensor
export interface SensorData {
  rainfall: number;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  pH: number;
  battery: number;
  waterTank: number;
  windSpeed: number;
}

const HomeScreen = () => {
  // 2. Panggil hook untuk mendapatkan nilai safe area
  const insets = useSafeAreaInsets();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  const [sensorData, setSensorData] = useState<SensorData>({
    rainfall: 15,
    temperature: 30,
    humidity: 65,
    soilMoisture: 42,
    pH: 6.8,
    battery: 76,
    waterTank: 80,
    windSpeed: 5,
  });
  
  const [rawHistory, setRawHistory] = useState<RawPoint[]>([]);

  // Logika useEffect tetap sama
  useEffect(() => {
    const tick = () => {
      setCurrentTime(new Date());
      setSensorData((prev) => {
        const updated = {
          ...prev,
          battery: Math.max(0, Math.min(100, +(prev.battery + (Math.random() * 4 - 2)).toFixed(0))),
          waterTank: Math.max(0, Math.min(100, +(prev.waterTank + (Math.random() * 4 - 2)).toFixed(0))),
          humidity: Math.max(20, Math.min(100, +(prev.humidity + (Math.random() * 4 - 2)).toFixed(1))),
          soilMoisture: Math.max(10, Math.min(100, +(prev.soilMoisture + (Math.random() * 4 - 2)).toFixed(1))),
          windSpeed: Math.max(0, Math.min(50, +(prev.windSpeed + (Math.random() * 2 - 1)).toFixed(1))),
          temperature: Math.max(15, Math.min(40, +(prev.temperature + (Math.random() * 2 - 1)).toFixed(1))),
        };

        setRawHistory((h) => {
          const point: RawPoint = { ts: Date.now(), ...updated };
          const next = [...h, point];
          if (next.length > 500) return next.slice(next.length - 500);
          return next;
        });

        return updated;
      });
    };

    const id = setInterval(tick, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    // Gunakan `edges` untuk kontrol lebih, atau biarkan kosong untuk default
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}> 
      <ScrollView
        contentContainerStyle={[
          styles.container,
          // 3. Terapkan padding atas dan bawah secara dinamis
          { paddingTop: insets.top, paddingBottom: insets.bottom }
        ]}
      >
        <WelcomeCard currentTime={currentTime} />
        <SensorGrid sensorData={sensorData} />
        <ChartSection history={rawHistory} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    // Padding horizontal saja, karena vertikal diatur oleh insets
    paddingHorizontal: 12,
  },
});

export default HomeScreen;