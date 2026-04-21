import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Switch, ScrollView, Alert,
} from 'react-native';
import dayjs from 'dayjs';
import { useApp } from '../context/AppContext';
import { useResponsive } from '../utils/responsive';
import { ALARM_BEFORE_OPTIONS } from '../utils/notifications';
import ComboBox from './ComboBox';

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  label: `${String(i).padStart(2, '0')}시`,
  value: String(i).padStart(2, '0'),
}));

export default function MemoSection({ isOpen, onToggle, pendingMemo, onPendingMemoChange }) {
  const { s, fs } = useResponsive();
  const {
    selectedDate,
    createSchedule, editSchedule, removeSchedule,
    getSchedulesForDate, getAnniversariesForDate,
  } = useApp();

  // Use lifted memo state if provided (for cross-component dirty-check)
  const memo = pendingMemo !== undefined ? pendingMemo : '';
  const setMemo = onPendingMemoChange || (() => {});

  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [alarmHour, setAlarmHour] = useState('09');
  const [alarmBefore, setAlarmBefore] = useState('none');
  const [editingId, setEditingId] = useState(null);
  const [daySchedules, setDaySchedules] = useState([]);
  const [dayAnnivs, setDayAnnivs] = useState([]);

  const refreshDayData = useCallback(() => {
    setDaySchedules(getSchedulesForDate(selectedDate));
    setDayAnnivs(getAnniversariesForDate(selectedDate));
  }, [selectedDate, getSchedulesForDate, getAnniversariesForDate]);

  useEffect(() => {
    refreshDayData();
  }, [refreshDayData]);

  const clearForm = useCallback(() => {
    setMemo('');
    setAlarmEnabled(false);
    setAlarmHour('09');
    setAlarmBefore('none');
    setEditingId(null);
  }, [setMemo]);

  const handleSave = async () => {
    if (!memo.trim()) {
      Alert.alert('알림', '메모를 입력해주세요.');
      return;
    }
    const data = {
      date: selectedDate,
      memo: memo.trim(),
      alarmEnabled,
      alarmTime: alarmEnabled ? `${alarmHour}:00` : null,
      alarmBefore: alarmEnabled ? alarmBefore : 'none',
    };

    if (editingId) {
      await editSchedule(editingId, data);
    } else {
      await createSchedule(data);
    }
    clearForm();
    refreshDayData();
  };

  const handleItemPress = (item) => {
    setMemo(item.memo);
    setAlarmEnabled(item.alarmEnabled || false);
    setAlarmHour(item.alarmTime ? item.alarmTime.split(':')[0] : '09');
    setAlarmBefore(item.alarmBefore || 'none');
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    Alert.alert('삭제', '이 일정을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제', style: 'destructive',
        onPress: async () => {
          await removeSchedule(id);
          if (editingId === id) clearForm();
          refreshDayData();
        },
      },
    ]);
  };

  const styles = makeStyles(s, fs);
  const dateLabel = dayjs(selectedDate).format('YYYY년 MM월 DD일');

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.titleBar} onPress={onToggle}>
        <Text style={styles.titleText}>📝 일정 메모 입력</Text>
        <Text style={styles.arrow}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.body}>
          <Text style={styles.dateLabel}>{dateLabel}</Text>

          <TextInput
            style={styles.input}
            placeholder="메모를 입력하세요"
            value={memo}
            onChangeText={setMemo}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Alarm toggle */}
          <View style={styles.row}>
            <Text style={styles.label}>알람 설정</Text>
            <Switch
              value={alarmEnabled}
              onValueChange={setAlarmEnabled}
              trackColor={{ false: '#ccc', true: '#4A90D9' }}
            />
          </View>

          {alarmEnabled && (
            <View style={styles.alarmRow}>
              <View style={styles.comboWrap}>
                <Text style={styles.subLabel}>알람 시간</Text>
                <ComboBox
                  options={HOURS}
                  value={alarmHour}
                  onChange={setAlarmHour}
                  placeholder="시간"
                />
              </View>
              <View style={styles.comboWrap}>
                <Text style={styles.subLabel}>사전 알림</Text>
                <ComboBox
                  options={ALARM_BEFORE_OPTIONS}
                  value={alarmBefore}
                  onChange={setAlarmBefore}
                  placeholder="없음"
                />
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>{editingId ? '일정 수정' : '일정 저장'}</Text>
          </TouchableOpacity>

          {editingId && (
            <TouchableOpacity style={styles.cancelBtn} onPress={clearForm}>
              <Text style={styles.cancelBtnText}>취소</Text>
            </TouchableOpacity>
          )}

          {/* Registered items */}
          {(daySchedules.length > 0 || dayAnnivs.length > 0) && (
            <View style={styles.listSection}>
              <Text style={styles.listTitle}>등록된 일정 내역</Text>
              {dayAnnivs.map((a) => (
                <View key={a.id} style={styles.annivItem}>
                  <Text style={styles.annivItemText}>🎉 기념일: {a.content}</Text>
                </View>
              ))}
              {daySchedules.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.scheduleItem, editingId === item.id && styles.editingItem]}
                  onPress={() => handleItemPress(item)}
                  onLongPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.scheduleText} numberOfLines={2}>{item.memo}</Text>
                  {item.alarmEnabled && (
                    <Text style={styles.alarmBadge}>
                      🔔 {item.alarmTime}{item.alarmBefore !== 'none' ? ` (${ALARM_BEFORE_OPTIONS.find(o => o.value === item.alarmBefore)?.label})` : ''}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
              {daySchedules.length > 0 && (
                <Text style={styles.hint}>항목을 탭하면 수정, 길게 누르면 삭제</Text>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const makeStyles = (s, fs) =>
  StyleSheet.create({
    wrapper: {
      backgroundColor: '#fff',
      marginTop: s(6),
      borderRadius: s(8),
      overflow: 'hidden',
      elevation: 1,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 2,
    },
    titleBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: s(16),
      paddingVertical: s(12),
      backgroundColor: '#F5F7FA',
    },
    titleText: { fontSize: fs(15), fontWeight: '700', color: '#333' },
    arrow: { fontSize: fs(12), color: '#888' },
    body: { padding: s(16) },
    dateLabel: {
      fontSize: fs(14),
      fontWeight: '700',
      color: '#4A90D9',
      marginBottom: s(8),
    },
    input: {
      borderWidth: 1,
      borderColor: '#DDE3EE',
      borderRadius: s(8),
      padding: s(10),
      fontSize: fs(14),
      minHeight: s(72),
      backgroundColor: '#FAFBFD',
      marginBottom: s(10),
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: s(8),
    },
    label: { fontSize: fs(14), color: '#444' },
    alarmRow: {
      flexDirection: 'row',
      gap: s(8),
      marginBottom: s(10),
    },
    comboWrap: { flex: 1 },
    subLabel: {
      fontSize: fs(12),
      color: '#666',
      marginBottom: s(4),
    },
    saveBtn: {
      backgroundColor: '#4A90D9',
      borderRadius: s(8),
      paddingVertical: s(12),
      alignItems: 'center',
      marginTop: s(4),
    },
    saveBtnText: { color: '#fff', fontSize: fs(15), fontWeight: '700' },
    cancelBtn: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: s(8),
      paddingVertical: s(10),
      alignItems: 'center',
      marginTop: s(6),
    },
    cancelBtnText: { color: '#666', fontSize: fs(14) },
    listSection: {
      marginTop: s(16),
      borderTopWidth: 1,
      borderTopColor: '#EEE',
      paddingTop: s(10),
    },
    listTitle: {
      fontSize: fs(13),
      fontWeight: '700',
      color: '#555',
      marginBottom: s(8),
    },
    annivItem: {
      backgroundColor: '#F3E5F5',
      borderRadius: s(6),
      padding: s(8),
      marginBottom: s(4),
    },
    annivItemText: { fontSize: fs(13), color: '#6A1B9A' },
    scheduleItem: {
      backgroundColor: '#F0F4FF',
      borderRadius: s(6),
      padding: s(10),
      marginBottom: s(6),
    },
    editingItem: {
      borderWidth: 1.5,
      borderColor: '#4A90D9',
    },
    scheduleText: { fontSize: fs(14), color: '#333' },
    alarmBadge: { fontSize: fs(11), color: '#E65100', marginTop: s(4) },
    hint: {
      fontSize: fs(11),
      color: '#AAA',
      textAlign: 'center',
      marginTop: s(4),
    },
  });
