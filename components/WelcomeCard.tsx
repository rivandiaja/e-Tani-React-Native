import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface WelcomeCardProps {
  currentTime: Date;
}

// Fungsi untuk mendapatkan ucapan salam berdasarkan jam
const getGreeting = (date: Date): string => {
  const hour = date.getHours();
  if (hour < 4) {
    return 'Selamat Dini Hari';
  } else if (hour < 11) {
    return 'Selamat Pagi';
  } else if (hour < 15) {
    return 'Selamat Siang';
  } else if (hour < 19) {
    return 'Selamat Sore';
  } else {
    return 'Selamat Malam';
  }
};

const WelcomeCard: React.FC<WelcomeCardProps> = ({ currentTime }) => {
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <LinearGradient
      colors={['#E0F2F1', '#B2DFDB']}
      style={styles.gradientWrapper}
    >
      <View style={styles.content}>
        <Text style={styles.greeting}>Hi Rivandi</Text>
        {/* Panggil fungsi getGreeting di sini */}
        <Text style={styles.subGreeting}>{getGreeting(currentTime)}</Text>
      </View>
      <View style={styles.scheduleCard}>
        <Text style={styles.scheduleText}>Jadwal Terdekat</Text>
        <Text style={styles.scheduleTime}>{formattedTime}</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientWrapper: {
    width: '100%',
    borderRadius: 20,
    padding: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#4DB6AC',
  },
  content: {
    marginBottom: 12,
  },
  greeting: {
    fontSize: 20,
    color: '#004D40',
    fontFamily: 'NotoSerifTamil-Bold', 
  },
  subGreeting: {
    fontSize: 14,
    color: '#004D40',
    fontFamily: 'Figtree-Regular',
  },
  scheduleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#00796B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  scheduleText: {
    fontSize: 16,
    color: '#004D40',
    fontFamily: 'Figtree-Bold',
  },
  scheduleTime: {
    fontSize: 18,
    color: '#004D40',
    fontFamily: 'Figtree-Bold',
  },
});

export default WelcomeCard;