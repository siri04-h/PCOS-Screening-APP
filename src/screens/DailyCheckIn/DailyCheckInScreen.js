import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert } from 'react-native';
import { colors, type, spacing } from '../../theme/theme';
import { Input, ScaleSelector } from '../../components/Input';
import { Button, Card, Chip, Eyebrow } from '../../components/UI';
import { checkinApi } from '../../api/checkinApi';

const CRAVINGS = ['Sweet', 'Salty', 'Carbs', 'Chocolate', 'Fried food', 'None'];
const PHYSICAL_SYMPTOMS = ['Cramps', 'Headache', 'Bloating', 'Breast tenderness', 'Backache', 'Nausea', 'None'];

export default function DailyCheckInScreen({ navigation }) {
  const [sleepHours, setSleepHours] = useState('');
  const [waterGlasses, setWaterGlasses] = useState('');
  const [activityMinutes, setActivityMinutes] = useState('');
  const [cravings, setCravings] = useState([]);
  const [physicalSymptoms, setPhysicalSymptoms] = useState([]);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [stressLevel, setStressLevel] = useState(3);
  const [loading, setLoading] = useState(false);

  const toggle = (list, setList, item) =>
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  const onSubmit = async () => {
    setLoading(true);
    try {
      await checkinApi.submitDailyLog({
        date: new Date().toISOString().slice(0, 10),
        sleepHours: Number(sleepHours) || undefined,
        waterIntakeMl: waterGlasses ? Number(waterGlasses) * 250 : undefined,
        activityMinutes: Number(activityMinutes) || undefined,
        foodCravings: cravings,
        physicalSymptoms,
        energyLevel,
        stressLevel,
      });
      Alert.alert('Saved', 'Today’s check-in has been logged.', [
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
      <Eyebrow>Daily check-in</Eyebrow>
      <Text style={[type.h1, { marginTop: 6, marginBottom: spacing.lg }]}>How was today?</Text>

      <Card style={{ marginBottom: spacing.md }}>
        <Text style={type.h2}>Sleep & body</Text>
        <View style={styles.row}>
          <Input label="Sleep (hours)" value={sleepHours} onChangeText={setSleepHours} placeholder="7.5" keyboardType="decimal-pad" style={styles.half} />
          <Input label="Water (glasses)" value={waterGlasses} onChangeText={setWaterGlasses} placeholder="6" keyboardType="number-pad" style={styles.half} />
        </View>
        <Input label="Activity (minutes)" value={activityMinutes} onChangeText={setActivityMinutes} placeholder="30" keyboardType="number-pad" />
      </Card>

      <Card style={{ marginBottom: spacing.md }}>
        <Text style={type.h2}>Food & cravings</Text>
        <View style={[styles.chipRow, { marginTop: spacing.sm }]}>
          {CRAVINGS.map((c) => (
            <Chip key={c} label={c} selected={cravings.includes(c)} onPress={() => toggle(cravings, setCravings, c)} />
          ))}
        </View>
      </Card>

      <Card style={{ marginBottom: spacing.md }}>
        <Text style={type.h2}>Physical symptoms today</Text>
        <View style={[styles.chipRow, { marginTop: spacing.sm }]}>
          {PHYSICAL_SYMPTOMS.map((s) => (
            <Chip key={s} label={s} selected={physicalSymptoms.includes(s)} onPress={() => toggle(physicalSymptoms, setPhysicalSymptoms, s)} />
          ))}
        </View>
      </Card>

      <Card style={{ marginBottom: spacing.lg }}>
        <Text style={type.h2}>Energy & stress</Text>
        <View style={{ marginTop: spacing.sm }}>
          <ScaleSelector label="Energy level" value={energyLevel} onChange={setEnergyLevel} lowLabel="Drained" highLabel="Energized" />
          <ScaleSelector label="Stress level" value={stressLevel} onChange={setStressLevel} lowLabel="Calm" highLabel="Overwhelmed" />
        </View>
      </Card>

      <Button title="Save check-in" onPress={onSubmit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, backgroundColor: colors.moonlight, flexGrow: 1, paddingTop: 60 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48%' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
});
