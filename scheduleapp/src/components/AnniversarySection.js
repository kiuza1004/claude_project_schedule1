import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useResponsive } from '../utils/responsive';
import ComboBox from './ComboBox';

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}월`,
  value: i + 1,
}));

const getDaysInMonth = (month) => {
  if (!month) return 31;
  const d = new Date(2000, month, 0).getDate();
  return d;
};

import { TextInput } from 'react-native';

export default function AnniversarySection({ isOpen, onToggle }) {
  const { s, fs } = useResponsive();
  const { anniversaries, createAnniversary, removeAnniversary } = useApp();

  const [month, setMonth] = useState(null);
  const [day, setDay] = useState(null);
  const [content, setContent] = useState('');
  const [showList, setShowList] = useState(false);

  const daysOptions = Array.from({ length: getDaysInMonth(month) }, (_, i) => ({
    label: `${i + 1}일`,
    value: i + 1,
  }));

  const handleAdd = async () => {
    if (!month || !day || !content.trim()) {
      Alert.alert('알림', '월, 일, 내용을 모두 입력해주세요.');
      return;
    }
    await createAnniversary({ month, day, content: content.trim() });
    setMonth(null);
    setDay(null);
    setContent('');
  };

  const handleDelete = (id, text) => {
    Alert.alert('삭제', `"${text}" 기념일을 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => removeAnniversary(id) },
    ]);
  };

  const styles = makeStyles(s, fs);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.titleBar} onPress={onToggle}>
        <Text style={styles.titleText}>🎉 기념일 등록</Text>
        <Text style={styles.arrow}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.body}>
          {/* Input row */}
          <View style={styles.inputRow}>
            <View style={styles.comboWrap}>
              <ComboBox
                options={MONTHS}
                value={month}
                onChange={(v) => { setMonth(v); setDay(null); }}
                placeholder="월"
              />
            </View>
            <View style={styles.comboWrap}>
              <ComboBox
                options={daysOptions}
                value={day}
                onChange={setDay}
                placeholder="일"
              />
            </View>
            <TextInput
              style={styles.contentInput}
              placeholder="내용"
              value={content}
              onChangeText={setContent}
            />
          </View>

          {/* Buttons row */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
              <Text style={styles.addBtnText}>기념일 추가</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.listBtn}
              onPress={() => setShowList((v) => !v)}
            >
              <Text style={styles.listBtnText}>
                기념일 내역 {anniversaries.length > 0 ? `(${anniversaries.length})` : ''}
              </Text>
            </TouchableOpacity>
          </View>

          {showList && (
            <View style={styles.listSection}>
              {anniversaries.length === 0 ? (
                <Text style={styles.emptyText}>등록된 기념일이 없습니다.</Text>
              ) : (
                anniversaries
                  .sort((a, b) => a.month - b.month || a.day - b.day)
                  .map((item) => (
                    <View key={item.id} style={styles.listItem}>
                      <Text style={styles.listDate} numberOfLines={1}>
                        {String(item.month).padStart(2, '0')}/{String(item.day).padStart(2, '0')}
                      </Text>
                      <Text style={styles.listContent} numberOfLines={1}>{item.content}</Text>
                      <TouchableOpacity onPress={() => handleDelete(item.id, item.content)}>
                        <Text style={styles.deleteBtn}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))
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
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      marginBottom: s(10),
    },
    comboWrap: { width: s(70) },
    contentInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#DDE3EE',
      borderRadius: s(6),
      paddingHorizontal: s(10),
      paddingVertical: s(8),
      fontSize: fs(13),
      backgroundColor: '#FAFBFD',
    },
    btnRow: {
      flexDirection: 'row',
      gap: s(8),
    },
    addBtn: {
      backgroundColor: '#7B1FA2',
      borderRadius: s(6),
      paddingHorizontal: s(14),
      paddingVertical: s(8),
    },
    addBtnText: { color: '#fff', fontSize: fs(12), fontWeight: '600' },
    listBtn: {
      borderWidth: 1,
      borderColor: '#7B1FA2',
      borderRadius: s(6),
      paddingHorizontal: s(14),
      paddingVertical: s(8),
    },
    listBtnText: { color: '#7B1FA2', fontSize: fs(12), fontWeight: '600' },
    listSection: {
      marginTop: s(12),
      borderTopWidth: 1,
      borderTopColor: '#EEE',
      paddingTop: s(8),
    },
    emptyText: { fontSize: fs(13), color: '#AAA', textAlign: 'center', paddingVertical: s(8) },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: s(8),
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    listDate: {
      fontSize: fs(13),
      color: '#7B1FA2',
      fontWeight: '700',
      width: s(44),
      flexShrink: 0,
    },
    listContent: {
      flex: 1,
      fontSize: fs(13),
      color: '#333',
      marginLeft: s(8),
    },
    deleteBtn: {
      fontSize: fs(14),
      color: '#E53935',
      paddingHorizontal: s(8),
    },
  });
