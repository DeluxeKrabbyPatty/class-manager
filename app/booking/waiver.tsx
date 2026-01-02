import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import SignaturePad from '@/components/Booking/SignaturePad';
import Colors, { BrandColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const WAIVER_TEXT = `
RELEASE OF LIABILITY, WAIVER OF CLAIMS, ASSUMPTION OF RISKS AND INDEMNITY AGREEMENT

By signing this waiver, I acknowledge that:

1. I understand that dance classes involve physical activity and may involve risk of injury.

2. I am voluntarily participating in dance classes offered by Dance With Helen.

3. I understand that I should consult with my physician before beginning any exercise program.

4. I agree to assume all risks associated with my participation in the dance classes.

5. I release Dance With Helen, its instructors, and staff from any and all liability for any injury, loss, or damage that may occur during my participation.

6. I understand that this waiver applies to each class I attend and must be signed before each booking.

I have read and understood this waiver and agree to its terms.
`;

export default function WaiverScreen() {
  const { user } = useAuth();
  const [signature, setSignature] = useState<string | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleContinue = () => {
    if (signature) {
      // Store waiver signature (will be saved with booking)
      router.push({
        pathname: '/booking/payment',
        params: { waiverSignature: signature },
      });
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      onScroll={() => setHasScrolled(true)}
      scrollEventThrottle={16}
    >
      <Card variant="elevated" style={styles.card}>
        <Text style={[styles.title, { color: colors.text }]}>Class Waiver</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Please read and sign the waiver to continue
        </Text>
      </Card>

      <Card variant="outlined" style={styles.card}>
        <ScrollView style={styles.waiverTextContainer}>
          <Text style={[styles.waiverText, { color: colors.text }]}>{WAIVER_TEXT}</Text>
        </ScrollView>
      </Card>

      <Card variant="outlined" style={styles.card}>
        <Text style={[styles.signatureLabel, { color: colors.text }]}>Your Signature</Text>
        <Text style={[styles.signatureHint, { color: colors.text }]}>
          Please sign below to acknowledge you have read and agree to the terms
        </Text>
        <SignaturePad onSignatureChange={setSignature} width={300} height={150} />
      </Card>

      <View style={styles.actions}>
        <Button
          title="Continue to Payment"
          onPress={handleContinue}
          disabled={!signature}
          variant="primary"
          style={styles.button}
        />
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="outline"
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  waiverTextContainer: {
    maxHeight: 300,
  },
  waiverText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'justify',
  },
  signatureLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  signatureHint: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  actions: {
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    marginBottom: 12,
  },
});

