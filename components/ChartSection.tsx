import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { RawPoint } from '../app/(tabs)/index';

interface ChartSectionProps {
  history: RawPoint[];
}

interface FilterButtonProps {
    label: string;
    onPress: () => void;
    active: boolean;
}

type ViewType = 'hourly' | 'daily' | 'weekly' | 'monthly';
type ChartType = 'line' | 'bar';

const screenWidth = Dimensions.get('window').width;

const FilterButton: React.FC<FilterButtonProps> = ({ label, onPress, active }) => (
  <TouchableOpacity onPress={onPress} style={[styles.button, active && styles.activeButton]}>
    <Text style={[styles.buttonText, active && styles.activeButtonText]}>{label}</Text>
  </TouchableOpacity>
);

const getAverage = (arr: number[]) => {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((a, b) => a + b, 0);
  return parseFloat((sum / arr.length).toFixed(1));
};

const chartColors = {
  temp: (opacity = 1) => `rgba(220, 38, 38, ${opacity})`,
  humidity: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
  soil: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  water: (opacity = 1) => `rgba(8, 145, 178, ${opacity})`,
  battery: (opacity = 1) => `rgba(234, 179, 8, ${opacity})`,
};

const ChartSection: React.FC<ChartSectionProps> = ({ history }) => {
  const [view, setView] = useState<ViewType>('hourly');
  const [chartType, setChartType] = useState<ChartType>('line');

  const { lineChartData, barChartData } = useMemo(() => {
    const emptyData = { labels: ['...'], datasets: [{ data: [0] }] };
    if (history.length === 0) {
      return { lineChartData: emptyData, barChartData: emptyData };
    }

    const now = new Date();
    const groups: { [key: string]: { temp: number[], humidity: number[], soil: number[], water: number[], battery: number[] } } = {};

    history.forEach(p => {
      const pointDate = new Date(p.ts);
      let key = '';
      if (view === 'hourly' && now.getTime() - pointDate.getTime() <= 24 * 3600 * 1000) key = `${pointDate.getHours().toString().padStart(2, '0')}:00`;
      else if (view === 'daily' && now.getTime() - pointDate.getTime() <= 30 * 24 * 3600 * 1000) key = `${pointDate.getDate()}/${pointDate.getMonth() + 1}`;
      else if (view === 'weekly' && now.getTime() - pointDate.getTime() <= 12 * 7 * 24 * 3600 * 1000) key = `W${Math.ceil(pointDate.getDate() / 7)}`;
      else if (view === 'monthly' && now.getFullYear() - pointDate.getFullYear() <= 1) key = pointDate.toLocaleString('default', { month: 'short' });

      if (key) {
        if (!groups[key]) groups[key] = { temp: [], humidity: [], soil: [], water: [], battery: [] };
        groups[key].temp.push(p.temperature);
        groups[key].humidity.push(p.humidity);
        groups[key].soil.push(p.soilMoisture);
        groups[key].water.push(p.waterTank);
        groups[key].battery.push(p.battery);
      }
    });

    const labels = Object.keys(groups).slice(-7);
    if (labels.length === 0) {
      return { lineChartData: emptyData, barChartData: emptyData };
    }

    const legendLabels = ["Suhu", "K. Udara", "K. Tanah", "Tandon", "Baterai"];
    const colorFunctions = [chartColors.temp, chartColors.humidity, chartColors.soil, chartColors.water, chartColors.battery];

    const lineDatasets = legendLabels.map((legend, index) => {
        const key = Object.keys(chartColors)[index] as keyof typeof chartColors;
        return {
            data: labels.map(labelKey => getAverage(groups[labelKey]?.[key])),
            color: colorFunctions[index],
            legend: legend
        }
    });
    
    // ======================= PERUBAHAN UNTUK BARCHART =======================
    // 1. Buat array of functions, bukan array of strings
    const barData = labels.map(key => getAverage(groups[key]?.temp));
    const barColors = barData.map((_, i) => (opacity = 1) => chartColors.temp(opacity));

    return {
      lineChartData: { labels, datasets: lineDatasets },
      barChartData: { labels, datasets: [{ data: barData, colors: barColors }] },
    };
  }, [history, view]);

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.8,
    decimalPlaces: 0,
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#fafafa" },
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Grafik Sensor</Text>
        <View style={styles.filters}>
          <FilterButton label="Line" onPress={() => setChartType('line')} active={chartType === 'line'}/>
          <FilterButton label="Bar" onPress={() => setChartType('bar')} active={chartType === 'bar'}/>
        </View>
      </View>
      
      <View style={styles.viewSelector}>
          <FilterButton label="Jam" onPress={() => setView('hourly')} active={view === 'hourly'}/>
          <FilterButton label="Hari" onPress={() => setView('daily')} active={view === 'daily'}/>
          <FilterButton label="Minggu" onPress={() => setView('weekly')} active={view === 'weekly'}/>
          <FilterButton label="Bulan" onPress={() => setView('monthly')} active={view === 'monthly'}/>
      </View>

      {chartType === 'line' ? (
        <LineChart
            data={lineChartData}
            width={screenWidth - 20}
            height={230}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={false}
            fromZero
            // 2. Properti 'legend' sudah dihapus dari sini
        />
      ) : (
        <BarChart
            data={barChartData}
            width={screenWidth - 20}
            height={240}
            chartConfig={chartConfig}
            yAxisLabel=""
            yAxisSuffix=""
            style={styles.chart}
            fromZero
            withInnerLines={false}
            showValuesOnTopOfBars
            withCustomBarColorFromData
            flatColor
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: { width: '100%', marginTop: 12, backgroundColor: 'white', borderRadius: 20, paddingVertical: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0', alignItems: 'center' },
    header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 },
    title: { fontSize: 16, fontWeight: '600', color: '#004D40', fontFamily: 'Figtree-Bold' },
    filters: { flexDirection: 'row' },
    viewSelector: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 16, marginBottom: 8, paddingHorizontal: 8, },
    button: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#BDBDBD', marginHorizontal: 4 },
    activeButton: { backgroundColor: '#00796B', borderColor: '#00796B' },
    buttonText: { fontSize: 12, color: '#333', fontFamily: 'Figtree-Regular' },
    activeButtonText: { color: 'white', fontWeight: 'bold' },
    chart: { borderRadius: 16, paddingRight: 25, paddingLeft: 0, marginLeft: -20 },
});

export default ChartSection;