import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import { DEFAULT_CLASS, formatClassDate, getNextClassDate } from '@/constants/Classes';
import { bookingStorage } from '@/utils/storage';
import Colors, { BrandColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import type { Booking } from '@/types/booking';

export default function ConfirmationScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    const bookingData = await bookingStorage.getBookingById(bookingId);
    setBooking(bookingData);
    setLoading(false);
  };

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Booking not found</Text>
        <Button title="Go Home" onPress={handleGoHome} style={styles.button} />
      </View>
    );
  }

  const nextDate = getNextClassDate();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <Text style={[styles.successTitle, { color: colors.primary }]}>
          Booking Confirmed!
        </Text>
        <Text style={[styles.successSubtitle, { color: colors.text }]}>
          You're all set for your dance class
        </Text>
      </View>

      <Card variant="elevated" style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Booking Details</Text>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.text }]}>Class:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{DEFAULT_CLASS.name}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.text }]}>Date & Time:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {formatClassDate(nextDate)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.text }]}>Location:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{DEFAULT_CLASS.location}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.text }]}>Address:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{DEFAULT_CLASS.address}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.text }]}>Status:</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Confirmed</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.text }]}>Payment:</Text>
          <Text style={[styles.detailValue, { color: colors.secondary }]}>
            {booking.isFirstClass ? 'FREE (First Class)' : 'Paid'}
          </Text>
        </View>
      </Card>

      <Card variant="outlined" style={styles.card}>
        <Text style={[styles.infoTitle, { color: colors.primary }]}>What's Next?</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>
          • Arrive 10 minutes early for check-in{'\n'}
          • Bring water and wear comfortable clothing{'\n'}
          • Waiver has been signed and is on file{'\n'}
          • See you at the studio!
        </Text>
      </Card>

      <View style={styles.actions}>
        <Button
          title="View Class Details"
          onPress={() => router.push(`/class/${DEFAULT_CLASS.id}`)}
          variant="primary"
          style={styles.button}
        />
        <Button
          title="Back to Home"
          onPress={handleGoHome}
          variant="secondary"
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
  successContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: BrandColors.primaryPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkmark: {
    fontSize: 48,
    color: BrandColors.white,
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.7,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
  statusBadge: {
    backgroundColor: BrandColors.gold,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: BrandColors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 24,
  },
  actions: {
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
});

