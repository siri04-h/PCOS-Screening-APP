import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, type, spacing, radii } from '../../theme/theme';
import { Card, Badge, Eyebrow, EmptyState } from '../../components/UI';
import { recommendationApi } from '../../api/predictionApi';
import emotionApi from '../../api/emotionApi';

export default function AIInsightsScreen() {
  const [patterns, setPatterns] = useState([]);
  const [baseline, setBaseline] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [emotionHistory, setEmotionHistory] = useState([]);

  const load = useCallback(async () => {
    const results = await Promise.allSettled([
      recommendationApi.getPatterns(),
      recommendationApi.getBaseline(),
      recommendationApi.getAlerts(),
      emotionApi.getEmotionHistory({ limit: 7 }),
    ]);
    if (results[0].status === 'fulfilled') setPatterns(results[0].value.data || []);
    if (results[1].status === 'fulfilled') setBaseline(results[1].value.data);
    if (results[2].status === 'fulfilled') setAlerts(results[2].value.data || []);
    if (results[3].status === 'fulfilled') setEmotionHistory(results[3].value.data || []);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Eyebrow>AI insights</Eyebrow>
      <Text style={[type.h1, { marginTop: 6, marginBottom: spacing.lg }]}>What Lunara has noticed</Text>

      {alerts.length > 0 && (
        <Card style={[styles.alertCard]}>
          <Badge label="Persistent change" color={colors.coral} />
          {alerts.map((a, i) => (
            <Text key={i} style={[type.body, { marginTop: spacing.sm }]}>{a.message}</Text>
          ))}
        </Card>
      )}

      <Text style={[type.h2, { marginTop: spacing.lg, marginBottom: spacing.sm }]}>Recurring patterns</Text>
      {patterns.length === 0 ? (
        <Card><EmptyState icon="🔍" message="Keep checking in daily — patterns appear after a couple of weeks of data." /></Card>
      ) : (
        patterns.map((p, i) => (
          <Card key={i} style={{ marginBottom: spacing.sm }}>
            <Text style={type.label}>{p.title}</Text>
            <Text style={[type.bodyMuted, { marginTop: 4 }]}>{p.description}</Text>
            <Text style={[type.caption, { marginTop: 6, fontStyle: 'italic' }]}>
              A personal pattern, not a medical diagnosis.
            </Text>
          </Card>
        ))
      )}

      <Text style={[type.h2, { marginTop: spacing.lg, marginBottom: spacing.sm }]}>Your baseline vs. now</Text>
      {baseline ? (
        <Card>
          {Object.entries(baseline).map(([key, v]) => (
            <View key={key} style={styles.baselineRow}>
              <Text style={type.label}>{formatKey(key)}</Text>
              <Text style={type.bodyMuted}>
                Usual {v.usual} · Now {v.current}
              </Text>
            </View>
          ))}
        </Card>
      ) : (
        <Card><EmptyState icon="📏" message="Your baseline builds up as you log more check-ins." /></Card>
      )}

      <Text style={[type.h2, { marginTop: spacing.lg, marginBottom: spacing.sm }]}>Emotion trend (last 7 days)</Text>
      {emotionHistory.length === 0 ? (
        <Card><EmptyState icon="🧠" message="No emotion check-ins yet this week." /></Card>
      ) : (
        <Card style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {emotionHistory.map((e, i) => (
            <View key={i} style={styles.emotionPill}>
              <Text style={type.caption}>{e.date?.slice(5) || ''}</Text>
              <Text style={type.label}>{e.overallEmotion}</Text>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

function formatKey(k) {
  return k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}

const styles = StyleSheet.create({
  body: { padding: spacing.lg, backgroundColor: colors.moonlight, flexGrow: 1, paddingTop: 60, paddingBottom: 60 },
  alertCard: { borderWidth: 1, borderColor: colors.coral + '55' },
  baselineRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  emotionPill: {
    backgroundColor: colors.cloud,
    borderRadius: radii.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    alignItems: 'center',
  },
});
