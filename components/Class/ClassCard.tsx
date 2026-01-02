import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Colors, { BrandColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { formatClassDate, getNextClassDate } from '@/constants/Classes';
import type { Class } from '@/types/class';

interface ClassCardProps {
  classData: Class;
  isEnrolled: boolean;
  isFirstClass: boolean;
  onBookPress?: () => void;
  onViewPress?: () => void;
}

export default function ClassCard({
  classData,
  isEnrolled,
  isFirstClass,
  onBookPress,
  onViewPress,
}: ClassCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const nextDate = getNextClassDate();

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{classData.name}</Text>
        {isFirstClass && !isEnrolled && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>FREE FIRST CLASS</Text>
          </View>
        )}
      </View>

      <View style={styles.infoRow}>
        <Text style={[styles.label, { color: colors.text }]}>Next Class:</Text>
        <Text style={[styles.value, { color: colors.primary }]}>
          {formatClassDate(nextDate)}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={[styles.label, { color: colors.text }]}>Location:</Text>
        <Text style={[styles.value, { color: colors.text }]}>{classData.location}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={[styles.label, { color: colors.text }]}>Price:</Text>
        <Text style={[styles.price, { color: colors.secondary }]}>
          {isFirstClass && !isEnrolled ? 'FREE' : `$${classData.price.toFixed(2)}`}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={[styles.label, { color: colors.text }]}>Availability:</Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {classData.capacity} spots available
        </Text>
      </View>

      <View style={styles.actions}>
        {isEnrolled ? (
          <Link href={`/class/${classData.id}`} asChild>
            <Button title="View Class" variant="primary" onPress={onViewPress} />
          </Link>
        ) : (
          <Link href={`/class/${classData.id}`} asChild>
            <Button title="Book Class" variant="primary" onPress={onBookPress} />
          </Link>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  badge: {
    backgroundColor: BrandColors.gold,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  badgeText: {
    color: BrandColors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actions: {
    marginTop: 16,
  },
});

