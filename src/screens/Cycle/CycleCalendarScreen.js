import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, type, spacing, radii } from '../../theme/theme';
import { Card, Eyebrow, Button } from '../../components/UI';
import MoonPhase from '../../components/MoonPhase';
import cycleApi from '../../api/cycleApi';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CycleCalendarScreen({ navigation }) {
  const [monthDate, setMonthDate] = useState(new Date());
  const [cycles, setCycles] = useState([]);
  const [summary, setSummary] = useState(null);

  const load = useCallback(async () => {
    try {
      const [listRes, summaryRes] = await Promise.allSettled([
        cycleApi.getCycles({ limit: 12 }),
        cycleApi.getCycleSummary(),
      ]);
      if (listRes.status === 'fulfilled') setCycles(listRes.value.data || []);
      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data);
    } catch (e) {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const periodDates = new Set(
    cycles.flatMap((c) => datesBetween(c.startDate, c.endDate))
  );

  const days = daysInMonthGrid(monthDate);

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Eyebrow>Cycle calendar</Eyebrow>
      <Text style={[type.h1, { marginTop: 6, marginBottom: spacing.lg }]}>Your cycle history</Text>

      <Card style={styles.summaryCard}>
        <MoonPhase progress={summary ? summary.currentCycleDay / summary.avgCycleLength : 0.5} size={64} />
        <View style={{ marginLeft: spacing.md, flex: 1 }}>
          <Text style={type.h2}>Cycle day {summary?.currentCycleDay ?? '—'}</Text>
          <Text style={type.bodyMuted}>
            Avg. cycle {summary?.avgCycleLength ?? '—'} days · Avg. period {summary?.avgPeriodLength ?? '—'} days
          </Text>
        </View>
      </Card>

      <Card style={{ marginTop: spacing.md }}>
        <View style={styles.monthHeader}>
          <Pressable onPress={() => setMonthDate(addMonths(monthDate, -1))}><Text style={styles.monthNav}>{'‹'}</Text></Pressable>
          <Text style={type.h2}>{monthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
          <Pressable onPress={() => setMonthDate(addMonths(monthDate, 1))}><Text style={styles.monthNav}>{'›'}</Text></Pressable>
        </View>
        <View style={styles.weekRow}>
          {WEEKDAYS.map((d, i) => (
            <Text key={i} style={styles.weekday}>{d}</Text>
          ))}
        </View>
        <View style={styles.grid}>
          {days.map((d, i) => {
            const iso = d ? isoDate(d) : null;
            const isPeriod = iso && periodDates.has(iso);
            const isToday = iso === isoDate(new Date());
            return (
              <View key={i} style={styles.cell}>
                {d ? (
                  <View style={[styles.dayCircle, isPeriod && styles.dayPeriod, isToday && styles.dayToday]}>
                    <Text style={[styles.dayText, isPeriod && { color: colors.white }]}>{d.getDate()}</Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.blushDeep }]} />
            <Text style={type.caption}>Period</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { borderWidth: 1.5, borderColor: colors.lavenderDeep, backgroundColor: 'transparent' }]} />
            <Text style={type.caption}>Today</Text>
          </View>
        </View>
      </Card>

      <Button
        title="Log a period"
        onPress={() => navigation.navigate('LogPeriod')}
        style={{ marginTop: spacing.lg }}
      />
    </ScrollView>
  );
}

function daysInMonthGrid(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function datesBetween(start, end) {
  if (!start) return [];
  const out = [];
  const s = new Date(start);
  const e = end ? new Date(end) : s;
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    out.push(isoDate(new Date(d)));
  }
  return out;
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, backgroundColor: colors.moonlight, flexGrow: 1, paddingTop: 60, paddingBottom: 60 },
  summaryCard: { flexDirection: 'row', alignItems: 'center' },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthNav: { fontSize: 22, color: colors.lavenderDeep, paddingHorizontal: 10 },
  weekRow: { flexDirection: 'row', marginTop: spacing.md },
  weekday: { flex: 1, textAlign: 'center', ...type.caption },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 4 },
  dayCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dayPeriod: { backgroundColor: colors.blushDeep },
  dayToday: { borderWidth: 1.5, borderColor: colors.lavenderDeep },
  dayText: { fontFamily: type.body.fontFamily, fontSize: 13, color: colors.ink },
  legendRow: { flexDirection: 'row', marginTop: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.md },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
});
