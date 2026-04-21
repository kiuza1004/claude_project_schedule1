import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList, StyleSheet,
} from 'react-native';
import { useResponsive } from '../utils/responsive';

export default function ComboBox({ options = [], value, onChange, placeholder = '선택' }) {
  const { s, fs } = useResponsive();
  const [visible, setVisible] = useState(false);
  const selected = options.find((o) => o.value === value);
  const styles = makeStyles(s, fs);

  return (
    <View>
      <TouchableOpacity style={styles.trigger} onPress={() => setVisible(true)}>
        <Text style={[styles.triggerText, !selected && styles.placeholder]}>
          {selected ? selected.label : placeholder}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.dropdown}>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item.value === value && styles.selectedOption]}
                  onPress={() => {
                    onChange(item.value);
                    setVisible(false);
                  }}
                >
                  <Text style={[styles.optionText, item.value === value && styles.selectedOptionText]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const makeStyles = (s, fs) =>
  StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: '#DDE3EE',
      borderRadius: s(6),
      paddingHorizontal: s(10),
      paddingVertical: s(8),
      backgroundColor: '#FAFBFD',
    },
    triggerText: {
      fontSize: fs(13),
      color: '#333',
      flex: 1,
    },
    placeholder: { color: '#AAA' },
    chevron: { fontSize: fs(10), color: '#888', marginLeft: s(4) },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dropdown: {
      backgroundColor: '#fff',
      borderRadius: s(10),
      width: '70%',
      maxHeight: 300,
      elevation: 8,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      overflow: 'hidden',
    },
    option: {
      paddingHorizontal: s(16),
      paddingVertical: s(12),
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    selectedOption: { backgroundColor: '#EAF2FF' },
    optionText: { fontSize: fs(14), color: '#333' },
    selectedOptionText: { color: '#4A90D9', fontWeight: '700' },
  });
