import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import dayjs from 'dayjs';
import { useApp } from '../context/AppContext';
import { useResponsive } from '../utils/responsive';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarSection({ onDatePress }) {
  const { s, fs, width } = useResponsive();
  const {
    currentMonth, setCurrentMonth,
    selectedDate, today,
    getDatesWithSchedule, getAnniversariesForDate,
  } = useApp();

  const year = currentMonth.year();
  const month = currentMonth.month() + 1;

  const datesWithSchedule = useMemo(
    () => getDatesWithSchedule(year, month),
    [getDatesWithSchedule, year, month]
  );

  const calendarDays = useMemo(() => {
    const firstDay = currentMonth.startOf('month').day();
    const daysInMonth = currentMonth.daysInMonth();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [currentMonth]);

  const cellSize = useMemo(() => {
    // 7 columns + small gaps
    return Math.floor((width - s(16) * 2 - s(4) * 6) / 7);
  }, [width, s]);

  const handlePrevMonth = () => setCurrentMonth((m) => m.subtract(1, 'month'));
  const handleNextMonth = () => setCurrentMonth((m) => m.add(1, 'month'));

  const getAnnivLabel = (day) => {
    if (!day) return null;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const annivs = getAnniversariesForDate(dateStr);
    return annivs.length > 0 ? annivs[0].content : null;
  };

  const styles = makeStyles(s, fs, cellSize);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
          <Text style={styles.navText}>{'◀'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {year}년 {String(month).padStart(2, '0')}월
        </Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
          <Text style={styles.navText}>{'▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDatePress(today, true)}
          style={styles.todayBtn}
        >
          <Text style={styles.todayBtnText}>당일</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday labels */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map((w, i) => (
          <View key={w} style={[styles.weekCell, { width: cellSize }]}>
            <Text style={[styles.weekText, i === 0 && styles.sun, i === 6 && styles.sat]}>
              {w}
            </Text>
          </View>
        ))}
      </View>

      {/* Days grid */}
      <View style={styles.grid}>
        {calendarDays.map((day, idx) => {
          if (!day) return <View key={`empty-${idx}`} style={{ width: cellSize, height: cellSize + s(14) }} />;

          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const hasSchedule = datesWithSchedule.has(day);
          const annivLabel = getAnnivLabel(day);
          const isSun = idx % 7 === 0;
          const isSat = idx % 7 === 6;

          return (
            <TouchableOpacity
              key={dateStr}
              onPress={() => onDatePress(dateStr, false)}
              style={[
                styles.dayCell,
                { width: cellSize, minHeight: cellSize + s(14) },
                isSelected && styles.selectedCell,
              ]}
            >
              <View style={[styles.dayNumWrap, isToday && styles.todayCircle]}>
                <Text style={[
                  styles.dayNum,
                  isSun && styles.sun,
                  isSat && styles.sat,
                  isToday && styles.todayText,
                  isSelected && !isToday && styles.selectedText,
                ]}>
                  {day}
                </Text>
              </View>
              {hasSchedule && <View style={styles.dot} />}
              {annivLabel && (
                <Text style={styles.annivLabel} numberOfLines={1} ellipsizeMode="tail">
                  {annivLabel}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (s, fs, cellSize) =>
  StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      paddingHorizontal: s(16),
      paddingBottom: s(8),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: s(10),
    },
    navBtn: {
      padding: s(8),
    },
    navText: {
      fontSize: fs(16),
      color: '#555',
    },
    headerTitle: {
      fontSize: fs(18),
      fontWeight: '700',
      color: '#222',
      marginHorizontal: s(12),
      minWidth: s(100),
      textAlign: 'center',
    },
    todayBtn: {
      marginLeft: s(8),
      backgroundColor: '#4A90D9',
      paddingHorizontal: s(10),
      paddingVertical: s(4),
      borderRadius: s(12),
    },
    todayBtnText: {
      color: '#fff',
      fontSize: fs(12),
      fontWeight: '600',
    },
    weekRow: {
      flexDirection: 'row',
      marginBottom: s(2),
    },
    weekCell: {
      alignItems: 'center',
      paddingVertical: s(4),
    },
    weekText: {
      fontSize: fs(12),
      color: '#555',
      fontWeight: '600',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      alignItems: 'center',
      paddingVertical: s(2),
      borderRadius: s(4),
    },
    selectedCell: {
      backgroundColor: '#EAF2FF',
    },
    dayNumWrap: {
      width: s(28),
      height: s(28),
      borderRadius: s(14),
      alignItems: 'center',
      justifyContent: 'center',
    },
    todayCircle: {
      backgroundColor: '#4A90D9',
    },
    dayNum: {
      fontSize: fs(14),
      color: '#333',
    },
    todayText: {
      color: '#fff',
      fontWeight: '700',
    },
    selectedText: {
      color: '#4A90D9',
      fontWeight: '700',
    },
    sun: { color: '#E53935' },
    sat: { color: '#1565C0' },
    dot: {
      width: s(5),
      height: s(5),
      borderRadius: s(3),
      backgroundColor: '#FF7043',
      marginTop: s(1),
    },
    annivLabel: {
      fontSize: fs(9),
      color: '#7B1FA2',
      textAlign: 'center',
      width: cellSize - s(2),
      marginTop: s(1),
    },
  });
