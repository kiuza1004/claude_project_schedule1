import React, { useState, useCallback, useEffect } from 'react';
import {
  View, ScrollView, SafeAreaView, StatusBar, Alert,
  StyleSheet, ActivityIndicator, Text,
} from 'react-native';
import dayjs from 'dayjs';
import { AppProvider, useApp } from './src/context/AppContext';
import CalendarSection from './src/components/CalendarSection';
import MemoSection from './src/components/MemoSection';
import AnniversarySection from './src/components/AnniversarySection';
import SearchSection from './src/components/SearchSection';
import { useResponsive } from './src/utils/responsive';
import { setupNotificationChannel, requestPermissions } from './src/utils/notifications';

function MainApp() {
  const { s, fs } = useResponsive();
  const {
    selectedDate, setSelectedDate,
    setCurrentMonth, today, loading,
  } = useApp();

  useEffect(() => {
    setupNotificationChannel();
    requestPermissions();
  }, []);

  const [memoOpen, setMemoOpen] = useState(false);
  const [annivOpen, setAnnivOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pendingMemo, setPendingMemo] = useState('');

  const navigateTo = useCallback((targetDate) => {
    setSelectedDate(targetDate);
    setCurrentMonth(dayjs(targetDate));
    if (!memoOpen) setMemoOpen(true);
  }, [setSelectedDate, setCurrentMonth, memoOpen]);

  const handleDatePress = useCallback((targetDate, isToday) => {
    if (targetDate === selectedDate && !isToday) return;

    if (pendingMemo.trim().length > 0) {
      Alert.alert(
        '입력 중인 내용이 있습니다',
        '작성 중인 내용을 삭제하고 이동하시겠습니까?',
        [
          { text: '아니오', style: 'cancel' },
          {
            text: '예',
            onPress: () => {
              setPendingMemo('');
              navigateTo(targetDate);
            },
          },
        ]
      );
    } else {
      navigateTo(targetDate);
    }
  }, [selectedDate, pendingMemo, navigateTo]);

  const styles = makeStyles(s, fs);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90D9" />
        <Text style={styles.loadingText}>불러오는 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#4A90D9" />
      <View style={styles.appHeader}>
        <Text style={styles.appTitle}>📅 일정관리</Text>
        <Text style={styles.appDate}>{dayjs(today).format('YYYY년 MM월 DD일')}</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calendarCard}>
          <CalendarSection onDatePress={handleDatePress} />
        </View>

        <MemoSection
          isOpen={memoOpen}
          onToggle={() => setMemoOpen((v) => !v)}
          pendingMemo={pendingMemo}
          onPendingMemoChange={setPendingMemo}
        />

        <AnniversarySection
          isOpen={annivOpen}
          onToggle={() => setAnnivOpen((v) => !v)}
        />

        <SearchSection
          isOpen={searchOpen}
          onToggle={() => setSearchOpen((v) => !v)}
        />

        <View style={{ height: s(40) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

const makeStyles = (s, fs) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F0F4FA' },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F0F4FA',
    },
    loadingText: { marginTop: s(12), fontSize: fs(14), color: '#888' },
    appHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#4A90D9',
      paddingHorizontal: s(16),
      paddingVertical: s(10),
    },
    appTitle: { fontSize: fs(18), fontWeight: '800', color: '#fff' },
    appDate: { fontSize: fs(13), color: 'rgba(255,255,255,0.85)' },
    scroll: { flex: 1 },
    scrollContent: { padding: s(10) },
    calendarCard: {
      backgroundColor: '#fff',
      borderRadius: s(10),
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      marginBottom: s(4),
    },
  });
