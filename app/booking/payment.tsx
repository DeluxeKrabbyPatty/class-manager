import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import { DEFAULT_CLASS, getNextClassDate } from '@/constants/Classes';
import { bookingStorage } from '@/utils/storage';
import Colors, { BrandColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { validateEmail } from '@/utils/validation';

export default function PaymentScreen() {
  const { waiverSignature } = useLocalSearchParams<{ waiverSignature?: string }>();
  const { user } = useAuth();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isFirstClass, setIsFirstClass] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[(colorScheme ?? 'light') as 'light' | 'dark'];

  const nextDate = getNextClassDate();

  useEffect(() => {
    checkFirstClass();
  }, [user]);

  const checkFirstClass = async () => {
    if (!user) return;
    const bookings = await bookingStorage.getBookingsByUserId(user.userId);
    const allBookings = bookings.filter((b) => b.status !== 'cancelled');
    setIsFirstClass(allBookings.length === 0);
  };

  useEffect(() => {
    if (user) {
      setCardholderName(user.name);
      setBillingEmail(user.email || '');
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!expiryDate.trim() || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }

    if (!cvv.trim() || cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    if (!billingEmail.trim()) {
      newErrors.billingEmail = 'Billing email is required';
    } else if (!validateEmail(billingEmail)) {
      newErrors.billingEmail = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user || !waiverSignature) {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    setLoading(true);

    // Mock payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if this is first class
    const bookings = await bookingStorage.getBookingsByUserId(user.userId);
    const allBookings = bookings.filter((b) => b.status !== 'cancelled');
    const isFirst = allBookings.length === 0;

    // Create booking
    const booking = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: user.userId,
      classId: DEFAULT_CLASS.id,
      classDate: nextDate.toISOString().split('T')[0],
      status: 'confirmed' as const,
      waiverSigned: true,
      waiverSignature: waiverSignature,
      waiverSignedAt: new Date().toISOString(),
      paymentStatus: isFirst ? ('free' as const) : ('paid' as const),
      isFirstClass: isFirst,
      createdAt: new Date().toISOString(),
    };

    await bookingStorage.createBooking(booking);

    setLoading(false);

    router.push({
      pathname: '/booking/confirmation',
      params: { bookingId: booking.id },
    });
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card variant="elevated" style={styles.card}>
        <Text style={[styles.title, { color: colors.text }]}>Payment Information</Text>
        {isFirstClass && (
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>🎉 Your first class is FREE!</Text>
          </View>
        )}
        <View style={styles.summary}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Class:</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{DEFAULT_CLASS.name}</Text>
        </View>
        <View style={styles.summary}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Date:</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {nextDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.summary}>
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Amount:</Text>
          <Text style={[styles.summaryAmount, { color: colors.secondary }]}>
            {isFirstClass ? 'FREE' : `$${DEFAULT_CLASS.price.toFixed(2)}`}
          </Text>
        </View>
      </Card>

      <Card variant="outlined" style={styles.card}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Payment Details
        </Text>
        <Text style={[styles.note, { color: colors.text }]}>
          This is a mock payment form. No actual charges will be made.
        </Text>

        <Input
          label="Card Number"
          value={cardNumber}
          onChangeText={(text) => setCardNumber(formatCardNumber(text))}
          placeholder="1234 5678 9012 3456"
          keyboardType="numeric"
          maxLength={19}
          error={errors.cardNumber}
          containerStyle={styles.inputContainer}
        />

        <View style={styles.row}>
          <View style={[styles.halfWidth, { marginRight: 8 }]}>
            <Input
              label="Expiry Date"
              value={expiryDate}
              onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
              placeholder="MM/YY"
              keyboardType="numeric"
              maxLength={5}
              error={errors.expiryDate}
              containerStyle={styles.inputContainer}
            />
          </View>
          <View style={styles.halfWidth}>
            <Input
              label="CVV"
              value={cvv}
              onChangeText={(text) => setCvv(text.replace(/\D/g, '').slice(0, 4))}
              placeholder="123"
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              error={errors.cvv}
              containerStyle={styles.inputContainer}
            />
          </View>
        </View>

        <Input
          label="Cardholder Name"
          value={cardholderName}
          onChangeText={setCardholderName}
          placeholder="John Doe"
          autoCapitalize="words"
          error={errors.cardholderName}
          containerStyle={styles.inputContainer}
        />

        <Input
          label="Billing Email"
          value={billingEmail}
          onChangeText={setBillingEmail}
          placeholder="billing@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.billingEmail}
          containerStyle={styles.inputContainer}
        />
      </Card>

      <View style={styles.actions}>
        <Button
          title={isFirstClass ? 'Complete Free Booking' : 'Pay & Complete Booking'}
          onPress={handlePayment}
          loading={loading}
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
    marginBottom: 16,
  },
  freeBadge: {
    backgroundColor: BrandColors.gold,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  freeBadgeText: {
    color: BrandColors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  note: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  halfWidth: {
    flex: 1,
  },
  actions: {
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    marginBottom: 12,
  },
});

