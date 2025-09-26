import React from 'react';
import { Tabs } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00796B', // Warna ikon saat aktif
        headerShown: false,
        tabBarShowLabel: false, // <-- GUNAKAN PROPERTI INI UNTUK MENGHILANGKAN LABEL
        tabBarStyle: {
          height: 60, // Sedikit lebih tinggi untuk tampilan ikon saja
          paddingTop: 10,
        }
      }}>

      {/* --- Tombol Dashboard --- */}
      <Tabs.Screen
        name="index" // Merujuk ke file: index.tsx
        options={{
          tabBarIcon: ({ color }) => (
            <Icon 
              name="home" 
              size={28} // Ukuran ikon bisa sedikit diperbesar
              color={color} 
            />
          ),
        }}
      />

      {/* --- Tombol Watering (Baru) --- */}
      <Tabs.Screen
        name="watering" // Anda perlu membuat file baru: watering.tsx
        options={{
          tabBarIcon: ({ color }) => (
            <Icon 
              name="cloud-drizzle" // Ikon untuk penyiraman
              size={28} 
              color={color}
            />
          ),
        }}
      />

      {/* --- Tombol Settings --- */}
      <Tabs.Screen
        name="settings" // Merujuk ke file: settings.tsx
        options={{
          tabBarIcon: ({ color }) => (
            <Icon 
              name="settings"
              size={28}
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}