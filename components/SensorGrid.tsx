import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { SensorData } from '../app/(tabs)/index';

interface AnimatedBubbleProps {
  size: number;
  duration: number;
  delay?: number; // Tambahkan prop delay
  horizontalOffset: number; // Tambahkan prop untuk posisi horizontal
}

const AnimatedBubble: React.FC<AnimatedBubbleProps> = ({ size, duration, delay = 0, horizontalOffset }) => {
  const yPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      yPosition.setValue(0);
      Animated.loop(
        Animated.timing(yPosition, {
          toValue: -60, // Sedikit lebih tinggi agar bisa keluar dari tandon
          duration: duration,
          easing: Easing.linear,
          useNativeDriver: true,
          delay: delay, // Terapkan delay di sini
        })
      ).start();
    };

    startAnimation();
  }, [duration, yPosition, delay]);

  const animatedStyle = {
    width: size,
    height: size,
    transform: [{ translateY: yPosition }],
    left: horizontalOffset, // Terapkan posisi horizontal
  };

  return <Animated.View style={[styles.waterTankBubble, animatedStyle]} />;
};

interface SensorGridProps {
  sensorData: SensorData;
}

const SensorCard: React.FC<{ icon: string; title: string; value: string; unit: string; optimal: string; progress: number;}> = ({ icon, title, value, unit, optimal, progress }) => (
    <View style={[styles.card, { flex: 1, marginHorizontal: 6 }]}><View style={styles.cardHeader}><Icon name={icon} size={16} color="#00796B" /><Text style={styles.cardTitle}>{title}</Text></View><Text style={styles.cardValue}>{value}{unit}</Text><View style={styles.progressBarBackground}><View style={[styles.progressBarFill, { width: `${progress}%` }]} /></View><Text style={styles.cardOptimal}>{optimal}</Text></View>
);

const SensorGrid: React.FC<SensorGridProps> = ({ sensorData }) => {
  const getStatusColor = (value: number, high: number, low: number, reverse: boolean = false) => {
    const green = '#16a34a'; const yellow = '#eab308'; const red = '#dc2626';
    if (reverse) { if (value < high) return green; if (value < low) return yellow; return red; }
    if (value > high) return green; if (value > low) return yellow; return red;
  };

  const batteryColor = getStatusColor(sensorData.battery, 60, 30);
  const waterTankColor = getStatusColor(sensorData.waterTank, 60, 30);
  const tempColor = getStatusColor(sensorData.temperature, 30, 35, true);

  return (
    <View style={styles.gridContainer}>
      <View style={styles.card}><View style={styles.cardHeader}><Icon name="cloud-rain" size={16} color="#00796B" /><Text style={styles.cardTitle}>Curah Hujan & Suhu</Text></View><View style={styles.dualContent}><View style={styles.dualItem}><Icon name="thermometer" size={20} color={tempColor} /><Text style={styles.smallLabel}>Suhu</Text><Text style={[styles.largeValue, { color: tempColor }]}>{sensorData.temperature.toFixed(1)}°C</Text></View><View style={styles.dualItem}><Icon name="cloud-rain" size={20} color="#00796B" /><Text style={styles.smallLabel}>Curah Hujan</Text><Text style={[styles.largeValue, { color: '#00796B' }]}>{sensorData.rainfall.toFixed(1)} mm</Text></View></View></View>
      <View style={styles.card}><View style={styles.cardHeader}><Icon name="battery-charging" size={16} color="#00796B" /><Text style={styles.cardTitle}>Baterai & Tandon Air</Text></View><View style={styles.dualContent}><View style={[styles.dualItem, { flexDirection: 'row', alignItems: 'center' }]}><View style={styles.batteryContainer}><View style={[styles.batteryFill, { width: `${sensorData.battery}%`, backgroundColor: batteryColor }]}/><Icon name="zap" size={14} color="white" style={styles.batteryIcon} /></View><View style={styles.batteryTerminal} /><Text style={[styles.smallValue, { color: batteryColor, marginLeft: 10 }]}>{sensorData.battery.toFixed(0)}%</Text></View>
            <View style={styles.dualItem}>
                <View>
                    <View style={[styles.waterTankTopCover, { backgroundColor: waterTankColor }]} />
                    <View style={[styles.waterTankContainer, { borderColor: waterTankColor }]}>
                        <View style={[styles.waterTankFill, { height: `${sensorData.waterTank}%`, backgroundColor: waterTankColor }]}>
                            {sensorData.waterTank > 10 && (
                                <>
                                    <AnimatedBubble size={8} duration={4000} delay={0} horizontalOffset={5} />
                                    <AnimatedBubble size={6} duration={3500} delay={500} horizontalOffset={20} />
                                    <AnimatedBubble size={7} duration={4500} delay={1000} horizontalOffset={30} />
                                </>
                            )}
                        </View>
                    </View>
                </View>
                <Text style={[styles.smallValue, { color: waterTankColor }]}>{sensorData.waterTank.toFixed(0)}%</Text>
            </View>
        </View>
      </View>
      
      <View style={styles.row}>
        {/* Ikon Kelembapan Udara (tetap droplet) */}
        <SensorCard icon="droplet" title="Kelembapan Udara" value={sensorData.humidity.toFixed(1)} unit="%" optimal="Optimal: 40-70%" progress={sensorData.humidity} />
        {/* Ikon Kelembapan Tanah (ganti ke cloud-snow atau sun, tergantung keinginan visual 'tanah kering/lembab') */}
        <SensorCard icon="cloud-drizzle" title="Kelembapan Tanah" value={sensorData.soilMoisture.toFixed(1)} unit="%" optimal="Optimal: 30-60%" progress={sensorData.soilMoisture} />
      </View>
      <View style={styles.row}>
        {/* Ikon pH Air (ganti ke flask) */}
        <SensorCard icon="activity" title="pH Air" value={sensorData.pH.toFixed(1)} unit="" optimal="Rentang: 4.0-10.0" progress={((sensorData.pH - 4) / 6) * 100} />
        <SensorCard icon="wind" title="Kecepatan Angin" value={sensorData.windSpeed.toFixed(1)} unit=" m/s" optimal="Maks: 50 m/s" progress={(sensorData.windSpeed / 50) * 100} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: { width: '100%', gap: 12, marginTop: 12 }, row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' }, card: { backgroundColor: 'white', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0', minHeight: 128 }, cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 }, cardTitle: { fontSize: 14, fontWeight: '600', color: '#004D40', marginLeft: 8 }, cardValue: { fontSize: 22, fontWeight: 'bold', color: '#00796B' }, cardOptimal: { fontSize: 10, color: '#757575', marginTop: 4 }, progressBarBackground: { height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, marginTop: 8, overflow: 'hidden' }, progressBarFill: { height: '100%', backgroundColor: '#26A69A', borderRadius: 3 }, dualContent: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', flex: 1 }, dualItem: { alignItems: 'center', justifyContent: 'center', flex: 1 }, smallLabel: { fontSize: 12, color: '#757575', marginTop: 4 }, largeValue: { fontSize: 18, fontWeight: 'bold' }, smallValue: { fontSize: 14, fontWeight: 'bold', marginTop: 4 }, batteryContainer: { width: 60, height: 30, borderRadius: 6, borderWidth: 2, borderColor: '#E0E0E0', backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }, batteryFill: { position: 'absolute', left: 0, top: 0, bottom: 0 }, batteryIcon: { opacity: 0.8, position: 'absolute' }, batteryTerminal: { width: 6, height: 12, backgroundColor: '#E0E0E0', borderRadius: 2, marginLeft: 2 }, waterTankTopCover: { width: 20, height: 5, borderRadius: 1.5, marginBottom: -2, alignSelf: 'center' }, waterTankContainer: { width: 40, height: 40, borderRadius: 8, borderWidth: 2, backgroundColor: '#F9FAFB', justifyContent: 'flex-end', overflow: 'hidden', position: 'relative' }, waterTankFill: { width: '100%', position: 'relative' },
  
  // Gaya untuk gelembung dan wrapper-nya
  bubbleWrapper: {
    position: 'absolute',
    bottom: -20, // Mulai dari dasar tandon
  },
  waterTankBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 50, // Bulat sempurna
    position: 'absolute', // Penting agar bisa diatur posisinya secara dinamis oleh AnimatedBubble
    // bottom: 0, // Dihapus karena AnimatedBubble akan mengaturnya
  },
});

export default SensorGrid;