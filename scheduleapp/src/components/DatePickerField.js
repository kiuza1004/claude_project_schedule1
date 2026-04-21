import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  Platform,
} from 'react-native';
import dayjs from 'dayjs';
import { useResponsive } from '../utils/responsive';
import ComboBox from './ComboBox';

const YEARS = Array.from({ length: 10 }, (_, i) => {
  const y = dayjs().year() - 5 + i;
  return { label: `${y}년`, value: y };
});

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}월`,
  value: i + 1,
}));

export default function DatePickerField({ value, onChange }) {
  const { s, fs } = useResponsive();
  const [visible, setVisible] = useState(false);
  const d = dayjs(value);
  const [year, setYear] = useState(d.year());
  const [month, setMonth] = useState(d.month() + 1);
  const [day, setDay] = useState(d.date());

  const daysInMonth = new Date(year, month, 0).getDate();
  const DAYS = Array.from({ length: daysInMonth }, (_, i) => ({
    label: `${i + 1}일`,
    value: i + 1,
  }));

  const handleConfirm = () => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateStr);
    setVisible(false);
  };

  const styles = makeStyles(s, fs);

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setVisible(true)}>
        <Text style={styles.triggerText}>{value}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.picker}>
            <Text style={styles.pickerTitle}>날짜 선택</Text>
            <View style={styles.row}>
              <View style={styles.yearWrap}>
                <ComboBox options={YEARS} value={year} onChange={setYear} placeholder="년" />
              </View>
              <View style={styles.monthWrap}>
                <ComboBox options={MONTHS} value={month} onChange={(v) => { setMonth(v); if (day > new Date(year, v, 0).getDate()) setDay(1); }} placeholder="월" />
              </View>
              <View style={styles.dayWrap}>
                <ComboBox options={DAYS} value={day} onChange={setDay} placeholder="일" />
              </View>
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setVisible(false)}>
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                <Text style={styles.confirmText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const makeStyles = (s, fs) =>
  StyleSheet.create({
    trigger: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#DDE3EE',
      borderRadius: s(6),
      paddingHorizontal: s(8),
      paddingVertical: s(8),
      backgroundColor: '#FAFBFD',
      minWidth: s(100),
    },
    triggerText: {
      fontSize: fs(13),
      color: '#333',
      textAlign: 'center',
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    picker: {
      backgroundColor: '#fff',
      borderRadius: s(12),
      padding: s(20),
      width: '85%',
      elevation: 10,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 10,
    },
    pickerTitle: {
      fontSize: fs(16),
      fontWeight: '700',
      color: '#333',
      textAlign: 'center',
      marginBottom: s(16),
    },
    row: {
      flexDirection: 'row',
      gap: s(8),
      marginBottom: s(16),
    },
    yearWrap: { flex: 2 },
    monthWrap: { flex: 1.5 },
    dayWrap: { flex: 1.5 },
    btnRow: {
      flexDirection: 'row',
      gap: s(10),
    },
    cancelBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#CCC',
      borderRadius: s(8),
      paddingVertical: s(10),
      alignItems: 'center',
    },
    cancelText: { fontSize: fs(14), color: '#666' },
    confirmBtn: {
      flex: 1,
      backgroundColor: '#4A90D9',
      borderRadius: s(8),
      paddingVertical: s(10),
      alignItems: 'center',
    },
    confirmText: { fontSize: fs(14), color: '#fff', fontWeight: '700' },
  });
