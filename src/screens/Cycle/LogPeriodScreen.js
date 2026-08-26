import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert } from 'react-native';
import { colors, type, spacing } from '../../theme/theme';
import { Input } from '../../components/Input';
import { Button, Chip, Eyebrow } from '../../components/UI';
import cycleApi from '../../api/cycleApi';

const FLOWS = ['Light', 'Medium', 'Heavy'];
const SYMPTOMS = ['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Backache', 'Mood swings'];

export default function LogPeriodScreen({ navigation }) {
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const [flow, setFlow] = useState('Medium');
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (s) =>
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const onSubmit = async () => {
    if (!startDate) {
      Alert.alert('Start date needed', 'Enter the date your period started.');
      return;
    }
    setLoading(true);
    try {
      await cycleApi.logPeriod({
        startDate,
        endDate: endDate || undefined,
        flow: flow.toLowerCase(),
        symptoms,
      });
      Alert.alert('Logged', 'Your period has been added to your cycle history.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Couldn’t save', 'Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Eyebrow>Log a period</Eyebrow>
      <Text style={[type.h1, { marginTop: 6, marginBottom: spacing.lg }]}>Add to your history</Text>

      <Input label="Start date (YYYY-MM-DD)" value={startDate} onChangeText={setStartDate} placeholder="2026-08-01" />
      <Input label="End date (optional)" value={endDate} onChangeText={setEndDate} placeholder="2026-08-05" />

      <Text style={type.label}>Flow</Text>
      <View style={[styles.chipRow, { marginTop: 8, marginBottom: spacing.md }]}>
        {FLOWS.map((f) => (
          <Chip key={f} label={f} selected={flow === f} onPress={() => setFlow(f)} />
        ))}
      </View>

      <Text style={type.label}>Symptoms during this period</Text>
      <View style={[styles.chipRow, { marginTop: 8, marginBottom: spacing.lg }]}>
        {SYMPTOMS.map((s) => (
          <Chip key={s} label={s} selected={symptoms.includes(s)} onPress={() => toggleSymptom(s)} />
        ))}
      </View>

      <Button title="Save period" onPress={onSubmit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, backgroundColor: colors.moonlight, flexGrow: 1, paddingTop: 60 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
});
