import Button from '@/components/UI/Button';
import Card from '@/components/UI/Card';
import { useColorScheme } from '@/components/useColorScheme';
import { DEFAULT_CLASS, formatClassDate, getNextClassDate } from '@/constants/Classes';
import Colors from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import type { Booking } from '@/types/booking';
import { bookingStorage } from '@/utils/storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ClassDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isFirstClass, setIsFirstClass] = useState(false);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const classData = DEFAULT_CLASS;
  const nextDate = getNextClassDate();

  useEffect(() => {
    checkEnrollment();
  }, [user]);

  const checkEnrollment = async () => {
    if (!user) return;

    const bookings = await bookingStorage.getBookingsByUserId(user.userId);
    const nextDateStr = nextDate.toISOString().split('T')[0];
    const activeBooking = bookings.find(
      (b: Booking) =>
        b.classDate === nextDateStr &&
        b.status === 'confirmed' &&
        b.classId === classData.id
    );

    setIsEnrolled(!!activeBooking);

    const allBookings = bookings.filter((b: Booking) => b.status !== 'cancelled');
    setIsFirstClass(allBookings.length === 0);
    setLoading(false);
  };

  const handleBookClass = () => {
    router.push('/booking/waiver');
  };

  const handleCancelClass = async () => {
    if (!user) return;

    const bookings = await bookingStorage.getBookingsByUserId(user.userId);
    const nextDateStr = nextDate.toISOString().split('T')[0];
    const activeBooking = bookings.find(
      (b: Booking) =>
        b.classDate === nextDateStr &&
        b.status === 'confirmed' &&
        b.classId === classData.id
    );

    if (activeBooking) {
      await bookingStorage.cancelBooking(activeBooking.id);
      setIsEnrolled(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card variant="elevated" style={styles.card}>
        <Text style={[styles.title, { color: colors.text }]}>{classData.name}</Text>
        <Text style={[styles.description, { color: colors.text }]}>{classData.description}</Text>
      </Card>

      <Card variant="outlined" style={styles.card}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Time & Location</Text>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>Date & Time:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {formatClassDate(nextDate)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>Location:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{classData.location}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>Address:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{classData.address}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>Duration:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{classData.duration} minutes</Text>
          </View>
        </View>
      </Card>

      <Card variant="outlined" style={styles.card}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>What to Expect</Text>
          {classData.whatToExpect.map((item, index) => (
            <View key={index} style={styles.expectationItem}>
              <Text style={[styles.bullet, { color: colors.secondary }]}>•</Text>
              <Text style={[styles.expectationText, { color: colors.text }]}>{item}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card variant="outlined" style={styles.card}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Pricing</Text>
          <View style={styles.pricingRow}>
            <Text style={[styles.priceLabel, { color: colors.text }]}>Class Price:</Text>
            <Text style={[styles.priceValue, { color: colors.secondary }]}>
              {isFirstClass ? 'FREE (First Class)' : `$${classData.price.toFixed(2)}`}
            </Text>
          </View>
          {isFirstClass && (
            <Text style={[styles.freeNote, { color: colors.secondary }]}>
              Your first class is on us! 🎉
            </Text>
          )}
        </View>
      </Card>

      <View style={styles.actions}>
        {isEnrolled ? (
          <>
            <Button
              title="Cancel Enrollment"
              onPress={handleCancelClass}
              variant="outline"
              style={styles.button}
            />
            <Text style={[styles.enrolledNote, { color: colors.text }]}>
              You are enrolled in this class
            </Text>
          </>
        ) : (
          <Button
            title={isFirstClass ? 'Book Free Class' : `Book Class - $${classData.price.toFixed(2)}`}
            onPress={handleBookClass}
            variant="primary"
            style={styles.button}
          />
        )}
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
  description: {
    fontSize: 16,
    opacity: 0.8,
    lineHeight: 24,
  },
  section: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    lineHeight: 22,
  },
  expectationItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  expectationText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  freeNote: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
  actions: {
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    marginBottom: 12,
  },
  enrolledNote: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.7,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});

