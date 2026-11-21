import { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { BigButton } from './BigButton';
import { Pressy } from './Pressy';
import { font, radius, useTheme } from '../theme/theme';

const AR_DIGITS = ['صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];

/**
 * Parental gate (required by Apple for Kids-category apps before settings, data deletion and links).
 * The question is written in words, so a pre-reader cannot solve it by matching digits.
 */
function makeQuestion() {
  const a = 3 + Math.floor(Math.random() * 7), b = 3 + Math.floor(Math.random() * 7);
  const answer = a * b;
  const opts = new Set([answer]);
  while (opts.size < 4) opts.add(Math.max(1, answer + (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 8))));
  return { a, b, answer, options: [...opts].sort(() => Math.random() - 0.5) };
}

export function ParentalGate({ visible, onPass, onCancel }: { visible: boolean; onPass: () => void; onCancel: () => void }) {
  const t = useTheme();
  const [q, setQ] = useState(makeQuestion);
  const [wrong, setWrong] = useState(false);
  // A fresh question after every attempt, so it cannot be solved by trying each option.
  const answer = (o: number) => {
    setQ(makeQuestion());
    if (o === q.answer) { setWrong(false); onPass(); } else setWrong(true);
  };
  const cancel = () => { setQ(makeQuestion()); setWrong(false); onCancel(); };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={cancel}>
      <View style={[styles.backdrop, { backgroundColor: t.overlay }]}>
        <View style={[styles.card, { backgroundColor: t.card }]}>
          <Text style={[font.h2, { color: t.text, textAlign: 'center' }]}>للأهل فقط 🔒</Text>
          <Text style={[font.body, { color: t.textMuted, textAlign: 'center', marginTop: 8 }]}>
            كم يساوي {AR_DIGITS[q.a]} ضرب {AR_DIGITS[q.b]}؟
          </Text>
          <View style={styles.grid}>
            {q.options.map((o) => (
              <Pressy key={o} style={[styles.opt, { backgroundColor: t.cardAlt }]} onPress={() => answer(o)}>
                <Text style={[font.h2, { color: t.text }]}>{o}</Text>
              </Pressy>
            ))}
          </View>
          {wrong && <Text style={[font.small, { color: t.hint, textAlign: 'center' }]}>إجابة غير صحيحة</Text>}
          <BigButton small label="إلغاء" color={t.cardAlt} textColor={t.text} onPress={cancel} style={{ marginTop: 12 }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 420, borderRadius: radius.lg, padding: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginVertical: 20 },
  opt: { width: 96, height: 72, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
