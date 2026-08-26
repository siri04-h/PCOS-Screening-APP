import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, type, spacing } from '../../theme/theme';
import { Card, Button, Eyebrow, EmptyState } from '../../components/UI';
import { Input } from '../../components/Input';
import { recommendationApi } from '../../api/predictionApi';

export default function RecommendationsScreen() {
  const [recs, setRecs] = useState([]);
  const [doctorEmail, setDoctorEmail] = useState('');
  const [sharing, setSharing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await recommendationApi.getRecommendations();
      setRecs(data || []);
    } catch (e) {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const shareReport = async () => {
    if (!doctorEmail) {
      Alert.alert('Add an email', 'Enter your healthcare professional’s email to share your report.');
      return;
    }
    setSharing(true);
    try {
      await recommendationApi.shareReportWithDoctor(doctorEmail);
      Alert.alert('Shared', 'Your report has been sent, with your permission, for professional review.');
      setDoctorEmail('');
    } catch (e) {
      Alert.alert('Couldn’t share', 'Check the email and your connection, then try again.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Eyebrow>For you</Eyebrow>
      <Text style={[type.h1, { marginTop: 6, marginBottom: spacing.lg }]}>Personalized recommendations</Text>

      {recs.length === 0 ? (
        <Card><EmptyState icon="💡" message="Recommendations appear here as Lunara learns your patterns." /></Card>
      ) : (
        recs.map((r, i) => (
          <Card key={r.id || i} style={{ marginBottom: spacing.sm }}>
            <Text style={type.h2}>{r.title}</Text>
            <Text style={[type.body, { marginTop: 6 }]}>{r.message}</Text>
            {r.basedOn ? <Text style={[type.caption, { marginTop: 8 }]}>Based on: {r.basedOn}</Text> : null}
          </Card>
        ))
      )}

      <Card style={{ marginTop: spacing.lg }}>
        <Text style={type.h2}>Share with a healthcare professional</Text>
        <Text style={[type.bodyMuted, { marginTop: 4, marginBottom: spacing.sm }]}>
          With your permission, Lunara can send your cycle history, symptoms, trends, and PCOS
          screening — with its explanation — to a doctor for evaluation.
        </Text>
        <Input value={doctorEmail} onChangeText={setDoctorEmail} placeholder="doctor@clinic.com" keyboardType="email-address" style={{ marginBottom: spacing.sm }} />
        <Button title="Share report" onPress={shareReport} loading={sharing} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, backgroundColor: colors.moonlight, flexGrow: 1, paddingTop: 60, paddingBottom: 60 },
});
