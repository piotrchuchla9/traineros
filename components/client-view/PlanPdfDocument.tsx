'use client'

import { Document, Page, Text, View, StyleSheet, Font, Link } from '@react-pdf/renderer'
import type { PlanState } from '@/types/database'
import { getT, type Locale } from '@/lib/i18n/translations'
import { exName, exDesc } from '@/lib/i18n/exercise'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 700 },
  ],
})

const s = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Roboto', backgroundColor: '#ffffff' },
  header: { marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 16 },
  label: { fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 11, color: '#6b7280', marginBottom: 8 },
  meta: { fontSize: 10, color: '#9ca3af' },
  day: { marginBottom: 20 },
  dayTitle: { fontSize: 13, fontWeight: 700, color: '#111827', backgroundColor: '#f9fafb', padding: '8 12', marginBottom: 8, borderRadius: 4 },
  exercise: { marginBottom: 12, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: '#e5e7eb' },
  exerciseName: { fontSize: 11, fontWeight: 700, color: '#111827', marginBottom: 2 },
  muscleTag: { fontSize: 9, color: '#6b7280', marginBottom: 6 },
  stats: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  stat: { backgroundColor: '#f3f4f6', borderRadius: 4, padding: '4 8', alignItems: 'center' },
  statValue: { fontSize: 13, fontWeight: 700, color: '#111827' },
  statLabel: { fontSize: 8, color: '#9ca3af' },
  description: { fontSize: 9, color: '#6b7280', marginTop: 3 },
  notes: { fontSize: 9, color: '#374151', backgroundColor: '#fefce8', padding: '4 8', borderRadius: 4, marginTop: 4 },
  videoLink: { fontSize: 9, color: '#2563eb', marginTop: 3 },
  footer: { position: 'absolute', bottom: 24, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#d1d5db' },
})

export function PlanPdfDocument({ plan, clientName, locale = 'pl' }: { plan: PlanState; clientName?: string; locale?: Locale }) {
  const t = getT(locale)

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.label}>{t.clientView.title}</Text>
          <Text style={s.title}>{plan.name}</Text>
          {clientName && <Text style={s.subtitle}>{t.clientView.for} {clientName}</Text>}
          <Text style={s.meta}>{t.clientView.trainingDays(plan.days.length)} · {t.clientView.weeks(plan.weeks)}</Text>
        </View>

        {plan.days.map(day => (
          <View key={day.id} style={s.day} wrap={false}>
            <Text style={s.dayTitle}>{day.name}</Text>
            {day.exercises.map(ex => (
              <View key={ex.id} style={s.exercise}>
                <Text style={s.exerciseName}>{exName(ex.exercise, locale)}</Text>
                <Text style={s.muscleTag}>{(t.muscle as Record<string, string>)[ex.exercise.muscle_group] ?? ex.exercise.muscle_group}</Text>
                <View style={s.stats}>
                  <View style={s.stat}>
                    <Text style={s.statValue}>{ex.sets}</Text>
                    <Text style={s.statLabel}>{t.clientView.sets}</Text>
                  </View>
                  <View style={s.stat}>
                    <Text style={s.statValue}>{ex.reps}</Text>
                    <Text style={s.statLabel}>{t.clientView.reps}</Text>
                  </View>
                  {ex.rest_seconds ? (
                    <View style={s.stat}>
                      <Text style={s.statValue}>{ex.rest_seconds}s</Text>
                      <Text style={s.statLabel}>{t.clientView.rest}</Text>
                    </View>
                  ) : null}
                </View>
                {ex.exercise.description && <Text style={s.description}>{exDesc(ex.exercise, locale)}</Text>}
                {ex.notes && <Text style={s.notes}>» {ex.notes}</Text>}
                {ex.exercise.youtube_url && (
                  <Link src={ex.exercise.youtube_url} style={s.videoLink}>
                    ▶ {t.clientView.watchVideo}: {ex.exercise.youtube_url}
                  </Link>
                )}
              </View>
            ))}
          </View>
        ))}

        <Text style={s.footer}>{t.clientView.footer}</Text>
      </Page>
    </Document>
  )
}
