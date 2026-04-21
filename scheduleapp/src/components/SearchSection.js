import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, FlatList,
} from 'react-native';
import dayjs from 'dayjs';
import { useApp } from '../context/AppContext';
import { useResponsive } from '../utils/responsive';
import DatePickerField from './DatePickerField';

const PAGE_SIZE = 10;

export default function SearchSection({ isOpen, onToggle }) {
  const { s, fs } = useResponsive();
  const { today, searchSchedules } = useApp();

  const defaultFrom = dayjs(today).subtract(7, 'day').format('YYYY-MM-DD');
  const defaultTo = today;

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState(null);
  const [page, setPage] = useState(1);

  const handleSearch = () => {
    const found = searchSchedules({ fromDate, toDate, keyword });
    setResults(found);
    setPage(1);
  };

  const totalPages = results ? Math.ceil(results.length / PAGE_SIZE) : 0;
  const pageData = results
    ? results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : [];

  const styles = makeStyles(s, fs);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.titleBar} onPress={onToggle}>
        <Text style={styles.titleText}>🔍 전체 일정 검색</Text>
        <Text style={styles.arrow}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.body}>
          {/* Row 1: date range */}
          <View style={styles.dateRow}>
            <Text style={styles.rangeLabel}>기간</Text>
            <DatePickerField value={fromDate} onChange={setFromDate} />
            <Text style={styles.tilde}>~</Text>
            <DatePickerField value={toDate} onChange={setToDate} />
          </View>

          {/* Row 2: keyword + search button */}
          <View style={styles.keywordRow}>
            <TextInput
              style={styles.keywordInput}
              placeholder="키워드 입력 (선택)"
              value={keyword}
              onChangeText={setKeyword}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <Text style={styles.searchBtnText}>검색</Text>
            </TouchableOpacity>
          </View>

          {/* Results */}
          {results !== null && (
            <View style={styles.resultsSection}>
              {results.length === 0 ? (
                <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
              ) : (
                <>
                  <Text style={styles.resultCount}>
                    총 {results.length}건 ({page}/{totalPages} 페이지)
                  </Text>
                  {pageData.map((item) => (
                    <View key={item.id} style={styles.resultItem}>
                      <Text style={styles.resultDate}>
                        {dayjs(item.date).format('YYYY년 MM월 DD일')}
                      </Text>
                      <Text style={styles.resultMemo} numberOfLines={2}>
                        {item.memo}
                      </Text>
                      {item.alarmEnabled && (
                        <Text style={styles.alarmBadge}>🔔 {item.alarmTime}</Text>
                      )}
                    </View>
                  ))}

                  {totalPages > 1 && (
                    <View style={styles.pagination}>
                      <TouchableOpacity
                        style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                        onPress={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                      >
                        <Text style={styles.pageBtnText}>이전</Text>
                      </TouchableOpacity>
                      <Text style={styles.pageInfo}>{page} / {totalPages}</Text>
                      <TouchableOpacity
                        style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
                        onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                      >
                        <Text style={styles.pageBtnText}>다음</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
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
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: s(10),
      gap: s(4),
    },
    rangeLabel: {
      fontSize: fs(13),
      color: '#555',
      fontWeight: '600',
      marginRight: s(4),
    },
    tilde: {
      fontSize: fs(14),
      color: '#555',
      marginHorizontal: s(2),
    },
    keywordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
    },
    keywordInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#DDE3EE',
      borderRadius: s(6),
      paddingHorizontal: s(10),
      paddingVertical: s(8),
      fontSize: fs(14),
      backgroundColor: '#FAFBFD',
    },
    searchBtn: {
      backgroundColor: '#4A90D9',
      borderRadius: s(6),
      paddingHorizontal: s(16),
      paddingVertical: s(10),
    },
    searchBtnText: { color: '#fff', fontSize: fs(13), fontWeight: '700' },
    resultsSection: {
      marginTop: s(16),
      borderTopWidth: 1,
      borderTopColor: '#EEE',
      paddingTop: s(10),
    },
    emptyText: {
      fontSize: fs(13),
      color: '#AAA',
      textAlign: 'center',
      paddingVertical: s(16),
    },
    resultCount: {
      fontSize: fs(12),
      color: '#888',
      marginBottom: s(8),
    },
    resultItem: {
      backgroundColor: '#F8F9FF',
      borderRadius: s(6),
      padding: s(10),
      marginBottom: s(6),
    },
    resultDate: {
      fontSize: fs(13),
      fontWeight: '700',
      color: '#4A90D9',
      marginBottom: s(4),
    },
    resultMemo: {
      fontSize: fs(14),
      color: '#333',
    },
    alarmBadge: {
      fontSize: fs(11),
      color: '#E65100',
      marginTop: s(4),
    },
    pagination: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: s(12),
      gap: s(16),
    },
    pageBtn: {
      backgroundColor: '#4A90D9',
      borderRadius: s(6),
      paddingHorizontal: s(16),
      paddingVertical: s(8),
    },
    pageBtnDisabled: { backgroundColor: '#CCC' },
    pageBtnText: { color: '#fff', fontSize: fs(13), fontWeight: '600' },
    pageInfo: { fontSize: fs(13), color: '#555' },
  });
