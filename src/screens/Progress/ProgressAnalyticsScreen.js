import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { colors, type, spacing } from '../../theme/theme';
import { Card, Eyebrow, EmptyState } from '../../components/UI';
import { checkinApi } from '../../api/checkinApi';
import cycleApi from '../../api/cycleApi';

const screenWidth = Dimensions.get('window').width - spacing.lg * 2 - spacing.md * 2;

const chartConfig = {
  backgroundGradientFrom: colors.white,
  backgroundGradientTo: colors.white,
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(139, 118, 196, ${opacity})`,
  labelColor: () => colors.inkMuted,
  propsForDots: { r: '3' },
};

export default function ProgressAnalyticsScreen() {
  const [logs, setLogs] = useState([]);
  const [cycles, setCycles] = useState([]);

  const load = useCallback(async () => {
    const results = await Promise.allSettled([
      checkinApi.getDailyLogHistory({ limit: 14 }),
      cycleApi.getCycles({ limit: 6 }),
    ]);
    if (results[0].status === 'fulfilled') setLogs((results[0].value.data || []).reverse());
    if (results[1].status === 'fulfilled') setCycles(results[1].value.data || []);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const hasLogs = logs.length > 1;
  const labels = hasLogs ? logs.map((l) => (l.date || '').slice(5)) : [];
  const sleepData = hasLogs ? logs.map((l) => l.sleepHours || 0) : [];
  const stressData = hasLogs ? logs.map((l) => l.stressLevel || 0) : [];
  const energyData = hasLogs ? logs.map((l) => l.energyLevel || 0) : [];

  const cycleLengths = cycles
    .map((c) => c.lengthDays)
    .filter((v) => typeof v === 'number');

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Eyebrow>Progress</Eyebrow>
      <Text style={[type.h1, { marginTop: 6, marginBottom: spacing.lg }]}>Trends over time</Text>

      <Card style={{ marginBottom: spacing.md }}>
        <Text style={type.h2}>Sleep (hours)</Text>
        {hasLogs ? (
          <LineChart
            data={{ labels: thinLabels(labels), datasets: [{ data: sleepData }] }}
            width={screenWidth}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
          />
        ) : (
          <EmptyState icon="😴" message="Log a few daily check-ins to see this trend." />
        )}
      </Card>

      <Card style={{ marginBottom: spacing.md }}>
        <Text style={type.h2}>Stress vs. energy</Text>
        {hasLogs ? (
          <LineChart
            data={{
              labels: thinLabels(labels),
              datasets: [
                { data: stressData, color: () => colors.coral },
                { data: energyData, color: () => colors.sage },
              ],
              legend: ['Stress', 'Energy'],
            }}
            width={screenWidth}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
          />
        ) : (
          <EmptyState icon="⚡" message="Log a few daily check-ins to see this trend." />
        )}
      </Card>

      <Card>
        <Text style={type.h2}>Cycle length history</Text>
        {cycleLengths.length === 0 ? (
          <EmptyState icon="🌙" message="Log a couple of periods to track cycle length over time." />
        ) : (
          <View style={{ marginTop: spacing.sm }}>
            {cycles.map((c, i) => (
              <View key={i} style={styles.cycleRow}>
                <Text style={type.bodyMuted}>{c.startDate}</Text>
                <Text style={type.label}>{c.lengthDays ? `${c.lengthDays} days` : '—'}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

function thinLabels(labels) {
  // Avoid overcrowding the x-axis on longer histories.
  if (labels.length <= 7) return labels;
  const step = Math.ceil(labels.length / 7);
  return labels.map((l, i) => (i % step === 0 ? l : ''));
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, backgroundColor: colors.moonlight, flexGrow: 1, paddingTop: 60, paddingBottom: 60 },
  chart: { marginTop: spacing.sm, borderRadius: 16, marginLeft: -spacing.md },
  cycleRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
});
