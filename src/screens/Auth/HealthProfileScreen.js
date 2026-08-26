import React, { useState } from 'react';
import { ScrollView, Text, View, StyleSheet, Alert } from 'react-native';
import { colors, type, spacing } from '../../theme/theme';
import { Input } from '../../components/Input';
import { Button, Chip, Eyebrow } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';

const SYMPTOM_OPTIONS = [
  'Irregular periods', 'Heavy bleeding', 'Acne', 'Excess hair growth',
  'Hair thinning', 'Weight changes', 'Fatigue', 'Mood swings',
  'Bloating', 'Pelvic pain', 'Sleep issues', 'None of these',
];

export default function HealthProfileScreen() {
  const { completeHealthProfile } = useAuth();
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [avgCycleLength, setAvgCycleLength] = useState('');
  const [avgPeriodLength, setAvgPeriodLength] = useState('');
  const [familyHistory, setFamilyHistory] = useState(null); // 'yes' | 'no' | 'unsure'
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (s) => {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const onSubmit = async () => {
    if (!age || !heightCm || !weightKg || !avgCycleLength) {
      Alert.alert('A little more info', 'Age, height, weight and cycle length help us screen accurately.');
      return;
    }
    setLoading(true);
    try {
      await completeHealthProfile({
        age: Number(age),
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        avgCycleLength: Number(avgCycleLength),
        avgPeriodLength: Number(avgPeriodLength) || undefined,
        pcosFamilyHistory: familyHistory,
        symptomsChecklist: symptoms,
      });
    } catch (e) {
      Alert.alert('Couldn’t save', 'Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Eyebrow>Step 2 of 2</Eyebrow>
      <Text style={[type.h1, { marginTop: 6, marginBottom: spacing.xs }]}>Your health profile</Text>
      <Text style={[type.bodyMuted, { marginBottom: spacing.lg }]}>
        This stays private and is only used to personalize your screening and insights.
      </Text>

      <View style={styles.row}>
        <Input label="Age" value={age} onChangeText={setAge} placeholder="28" keyboardType="number-pad" style={styles.half} />
        <Input label="Height (cm)" value={heightCm} onChangeText={setHeightCm} placeholder="165" keyboardType="number-pad" style={styles.half} />
      </View>
      <View style={styles.row}>
        <Input label="Weight (kg)" value={weightKg} onChangeText={setWeightKg} placeholder="60" keyboardType="number-pad" style={styles.half} />
        <Input label="Avg. cycle length (days)" value={avgCycleLength} onChangeText={setAvgCycleLength} placeholder="28" keyboardType="number-pad" style={styles.half} />
      </View>
      <Input label="Avg. period length (days)" value={avgPeriodLength} onChangeText={setAvgPeriodLength} placeholder="5" keyboardType="number-pad" />

      <Text style={type.label}>Family history of PCOS</Text>
      <View style={[styles.chipRow, { marginTop: 8, marginBottom: spacing.md }]}>
        {['yes', 'no', 'unsure'].map((v) => (
          <Chip key={v} label={v[0].toUpperCase() + v.slice(1)} selected={familyHistory === v} onPress={() => setFamilyHistory(v)} />
        ))}
      </View>

      <Text style={type.label}>Symptoms you’ve noticed</Text>
      <View style={[styles.chipRow, { marginTop: 8, marginBottom: spacing.lg }]}>
        {SYMPTOM_OPTIONS.map((s) => (
          <Chip key={s} label={s} selected={symptoms.includes(s)} onPress={() => toggleSymptom(s)} />
        ))}
      </View>

      <Button title="Finish setup" onPress={onSubmit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, backgroundColor: colors.moonlight, flexGrow: 1, paddingTop: 60 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48%' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
});
