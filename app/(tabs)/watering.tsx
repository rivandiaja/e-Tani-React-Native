import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, Switch,
  Alert, Modal, TextInput, Pressable, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';

// Interface dan data awal tidak berubah
interface WateringSchedule {
  id: string;
  type: 'Greenhouse' | 'Ladang';
  time: string;
  days: string[];
  durationInMinutes: number;
  isActive: boolean;
  notes?: string;
}

const DUMMY_SCHEDULES: WateringSchedule[] = [
  { id: '1', type: 'Greenhouse', time: '08:00', days: ['Sen', 'Rab', 'Jum'], durationInMinutes: 15, isActive: true, notes: 'Siram bagian depan saja' },
  { id: '2', type: 'Ladang', time: '16:30', days: ['Sel', 'Kam'], durationInMinutes: 30, isActive: false, notes: 'Gunakan pupuk cair' },
];

const WEEK_DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const DURATION_OPTIONS = [1, 2, 3, 4, 5, 10, 15, 20, 30, 45, 60];

const WateringScreen = () => {
  const [schedules, setSchedules] = useState(DUMMY_SCHEDULES);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WateringSchedule | null>(null);
  const [typeInput, setTypeInput] = useState<'Greenhouse' | 'Ladang'>('Greenhouse');
  const [timeInput, setTimeInput] = useState(new Date());
  const [durationInput, setDurationInput] = useState(15);
  const [daysInput, setDaysInput] = useState<string[]>([]);
  const [notesInput, setNotesInput] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Semua fungsi handler (add, edit, save, dll) tidak ada perubahan
  const handleAddNew = () => { setEditingSchedule(null); setTypeInput('Greenhouse'); setTimeInput(new Date()); setDurationInput(15); setDaysInput([]); setNotesInput(''); setIsModalVisible(true); };
  const handleEdit = (schedule: WateringSchedule) => { setEditingSchedule(schedule); const timeParts = schedule.time.split(':'); const dateForPicker = new Date(); dateForPicker.setHours(parseInt(timeParts[0])); dateForPicker.setMinutes(parseInt(timeParts[1])); setTypeInput(schedule.type); setTimeInput(dateForPicker); setDurationInput(schedule.durationInMinutes); setDaysInput(schedule.days); setNotesInput(schedule.notes || ''); setIsModalVisible(true); };
  const handleSave = () => { if (daysInput.length === 0) { Alert.alert("Input Tidak Lengkap", "Pilih hari perulangan."); return; } const formattedTime = timeInput.getHours().toString().padStart(2, '0') + ':' + timeInput.getMinutes().toString().padStart(2, '0'); if (editingSchedule) { setSchedules(schedules.map(s => s.id === editingSchedule.id ? { ...s, type: typeInput, time: formattedTime, durationInMinutes: durationInput, days: daysInput, notes: notesInput } : s)); } else { const newSchedule: WateringSchedule = { id: Math.random().toString(), type: typeInput, time: formattedTime, durationInMinutes: durationInput, days: daysInput, isActive: true, notes: notesInput }; setSchedules([newSchedule, ...schedules]); } setIsModalVisible(false); };
  const onChangeTime = (event: any, selectedDate?: Date) => { setShowTimePicker(false); if (selectedDate) setTimeInput(selectedDate); };
  const toggleDay = (day: string) => setDaysInput(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  const handleToggleSchedule = (id: string) => setSchedules(schedules.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  const handleDeleteSchedule = (id: string) => Alert.alert("Hapus Jadwal", "Yakin ingin menghapus?", [{ text: "Batal"}, { text: "Hapus", style: "destructive", onPress: () => setSchedules(schedules.filter(s => s.id !== id))}]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}><Text style={styles.title}>Jadwal Penyiraman</Text><TouchableOpacity style={styles.addButton} onPress={handleAddNew}><Icon name="plus" size={24} color="#FFFFFF" /></TouchableOpacity></View>
      <FlatList data={schedules} keyExtractor={item => item.id} contentContainerStyle={styles.listContainer} ListEmptyComponent={<Text style={styles.emptyText}>Belum ada jadwal.</Text>}
        renderItem={({ item }) => {
          const isGreenhouse = item.type === 'Greenhouse';
          return (<View style={styles.card}><View style={[styles.cardHeader, isGreenhouse ? styles.headerGreenhouse : styles.headerLadang]}><Text style={styles.cardHeaderText}>{item.type}</Text><Switch trackColor={{ false: "#E0E0E0", true: isGreenhouse ? "#A5D6A7" : "#FFCC80" }} thumbColor={item.isActive ? (isGreenhouse ? "#00796B" : "#FB8C00") : "#f4f3f4"} onValueChange={() => handleToggleSchedule(item.id)} value={item.isActive} /></View><View style={styles.cardBody}><View style={styles.timeContainer}><Text style={styles.cardTime}>{item.time}</Text></View><View style={styles.detailsContainer}><View style={styles.detailRow}><Icon name="clock" size={16} color="#757575" /><Text style={styles.detailText}>{item.durationInMinutes} Menit</Text></View><View style={styles.detailRow}><Icon name="repeat" size={16} color="#757575" /><Text style={styles.detailText}>{item.days.join(', ')}</Text></View></View></View><View style={styles.cardFooter}><View style={styles.notesContainer}>{item.notes && <Text style={styles.cardNotes} numberOfLines={1} ellipsizeMode='tail'>{item.notes}</Text>}</View><View style={styles.footerActions}><TouchableOpacity style={styles.footerButton} onPress={() => handleEdit(item)}><Icon name="edit-2" size={20} color="#757575" /></TouchableOpacity><TouchableOpacity style={styles.footerButton} onPress={() => handleDeleteSchedule(item.id)}><Icon name="trash-2" size={20} color="#EF5350" /></TouchableOpacity></View></View></View>);
        }}
      />
      
      <Modal visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)} transparent={true} animationType="slide">
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={styles.modalScrollView}>
            <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>{editingSchedule ? 'Edit Jadwal' : 'Jadwal Baru'}</Text>
                <Text style={styles.label}>Tipe</Text>
                <View style={styles.typeSelector}><TouchableOpacity style={[styles.typeButton, typeInput === 'Greenhouse' && styles.typeButtonActive]} onPress={() => setTypeInput('Greenhouse')}><Text style={[styles.typeButtonText, typeInput === 'Greenhouse' && styles.typeButtonTextActive]}>Greenhouse</Text></TouchableOpacity><TouchableOpacity style={[styles.typeButton, typeInput === 'Ladang' && styles.typeButtonActive]} onPress={() => setTypeInput('Ladang')}><Text style={[styles.typeButtonText, typeInput === 'Ladang' && styles.typeButtonTextActive]}>Ladang</Text></TouchableOpacity></View>
                
                <Text style={styles.label}>Jam</Text>
                <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}><Text style={styles.inputText}>{timeInput.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</Text></TouchableOpacity>

                {/* === PERUBAHAN UTAMA DI SINI === */}
                <Text style={styles.label}>Durasi (Menit)</Text>
                <View style={styles.optionsContainer}>
                  {DURATION_OPTIONS.map(duration => (
                    <Pressable 
                      key={duration} 
                      style={[styles.optionButton, durationInput === duration && styles.optionButtonActive]} 
                      onPress={() => setDurationInput(duration)}
                    >
                      <Text style={[styles.optionButtonText, durationInput === duration && styles.optionButtonTextActive]}>{duration}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.label}>Catatan (Opsional)</Text>
                <TextInput style={styles.input} placeholder="Contoh: Siram bagian depan saja" value={notesInput} onChangeText={setNotesInput} />
                <Text style={styles.label}>Perulangan</Text>
                <View style={styles.optionsContainer}>{WEEK_DAYS.map(day => (<Pressable key={day} style={[styles.optionButton, daysInput.includes(day) && styles.optionButtonActive]} onPress={() => toggleDay(day)}><Text style={[styles.optionButtonText, daysInput.includes(day) && styles.optionButtonTextActive]}>{day}</Text></Pressable>))}</View>
                <View style={styles.modalActions}><TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => setIsModalVisible(false)}><Text style={styles.actionButtonText}>Batal</Text></TouchableOpacity><TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSave}><Text style={[styles.actionButtonText, {color: '#fff'}]}>Simpan</Text></TouchableOpacity></View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {showTimePicker && (<DateTimePicker value={timeInput} mode="time" is24Hour={true} display="default" onChange={onChangeTime}/>)}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF' }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 }, title: { fontSize: 24, fontFamily: 'Figtree-Bold', color: '#004D40' }, addButton: { backgroundColor: '#00796B', padding: 8, borderRadius: 50, elevation: 3 }, listContainer: { paddingHorizontal: 16, paddingBottom: 20 }, emptyText: { textAlign: 'center', marginTop: 50, fontFamily: 'Figtree-Regular', color: '#757575' }, card: { backgroundColor: 'white', borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 4, borderWidth: 1, borderColor: '#F0F0F0', overflow: 'hidden' }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16 }, headerGreenhouse: { backgroundColor: '#E0F2F1' }, headerLadang: { backgroundColor: '#FFF3E0' }, cardHeaderText: { fontFamily: 'Figtree-Bold', fontSize: 16, color: '#004D40' }, cardBody: { flexDirection: 'row', alignItems: 'center', padding: 16 }, timeContainer: { flex: 0.9, gap: 4 }, cardTime: { fontFamily: 'Figtree-Bold', fontSize: 40, color: '#004D40' }, detailsContainer: { flex: 1, paddingLeft: 10, gap: 12 }, detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, detailText: { fontFamily: 'Figtree-Regular', fontSize: 14, color: '#333' }, cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, borderColor: '#F5F5F5' }, notesContainer: { flex: 1, marginRight: 8 }, cardNotes: { fontFamily: 'Figtree-Regular', fontSize: 12, color: '#757575', fontStyle: 'italic' }, footerActions: { flexDirection: 'row' }, footerButton: { marginLeft: 16, padding: 4 },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalScrollView: { flexGrow: 1, justifyContent: 'center', width: '100%' },
    modalContainer: { width: '90%', backgroundColor: 'white', borderRadius: 16, padding: 20, gap: 12, alignSelf: 'center' }, 
    modalTitle: { fontSize: 20, fontFamily: 'Figtree-Bold', color: '#004D40', textAlign: 'center', marginBottom: 8 }, 
    label: { fontSize: 14, fontFamily: 'Figtree-Regular', color: '#333', marginBottom: 4 },
    input: { borderWidth: 1, borderColor: '#BDBDBD', borderRadius: 8, paddingHorizontal: 12, height: 48, justifyContent: 'center' },
    inputText: { fontFamily: 'Figtree-Regular', fontSize: 16, color: '#333' },
    typeSelector: { flexDirection: 'row', borderWidth: 1, borderColor: '#00796B', borderRadius: 8, overflow: 'hidden' }, 
    typeButton: { flex: 1, paddingVertical: 10, alignItems: 'center' }, 
    typeButtonActive: { backgroundColor: '#00796B' }, 
    typeButtonText: { fontFamily: 'Figtree-Bold', color: '#00796B' }, 
    typeButtonTextActive: { color: 'white' }, 
    optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    optionButton: { minWidth: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#BDBDBD', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12, },
    optionButtonActive: { backgroundColor: '#00796B', borderColor: '#00796B' },
    optionButtonText: { fontFamily: 'Figtree-Bold', color: '#333', fontSize: 14, },
    optionButtonTextActive: { color: 'white' },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginTop: 16 }, 
    actionButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' }, 
    cancelButton: { backgroundColor: '#E0E0E0' }, 
    saveButton: { backgroundColor: '#00796B' }, 
    actionButtonText: { fontFamily: 'Figtree-Bold', color: '#333' }
});

export default WateringScreen;