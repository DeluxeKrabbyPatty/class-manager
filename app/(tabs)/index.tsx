import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, RefreshControl } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import ClassCard from '@/components/Class/ClassCard';
import { DEFAULT_CLASS, getNextClassDate } from '@/constants/Classes';
import { bookingStorage, classStorage } from '@/utils/storage';
import Colors, { BrandColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import type { Booking } from '@/types/booking';

export default function HomeScreen() {
  const { user, loading: authLoading } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isFirstClass, setIsFirstClass] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/auth/login');
      } else {
        checkEnrollment();
        initializeClasses();
      }
    }
  }, [user, authLoading]);

  const initializeClasses = async () => {
    const classes = await classStorage.getClasses();
    if (classes.length === 0) {
      await classStorage.setClasses([DEFAULT_CLASS]);
    }
  };

  const checkEnrollment = async () => {
    if (!user) return;

    const bookings = await bookingStorage.getBookingsByUserId(user.userId);
    const nextDate = getNextClassDate().toISOString().split('T')[0];
    const activeBooking = bookings.find(
      (b: Booking) =>
        b.classDate === nextDate &&
        b.status === 'confirmed' &&
        b.classId === DEFAULT_CLASS.id
    );

    setIsEnrolled(!!activeBooking);

    // Check if this is their first class
    const allBookings = bookings.filter((b: Booking) => b.status !== 'cancelled');
    setIsFirstClass(allBookings.length === 0);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkEnrollment();
    setRefreshing(false);
  };

  if (authLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={[styles.welcomeText, { color: colors.text }]}>Welcome, {user.name}!</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Your weekly dance class awaits
        </Text>
      </View>

      <ClassCard
        classData={DEFAULT_CLASS}
        isEnrolled={isEnrolled}
        isFirstClass={isFirstClass}
      />
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
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});
