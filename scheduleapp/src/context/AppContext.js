import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import {
  loadSchedules,
  loadAnniversaries,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  addAnniversary,
  deleteAnniversary,
} from '../utils/storage';
import { scheduleAlarm, cancelAlarm } from '../utils/notifications';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const today = dayjs().format('YYYY-MM-DD');

  const [schedules, setSchedules] = useState([]);
  const [anniversaries, setAnniversaries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [s, a] = await Promise.all([loadSchedules(), loadAnniversaries()]);
    setSchedules(s);
    setAnniversaries(a);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const createSchedule = useCallback(async (data) => {
    const newSchedule = await addSchedule(data);
    if (newSchedule.alarmEnabled) {
      const notifId = await scheduleAlarm({ ...newSchedule, alarmDate: newSchedule.date });
      if (notifId) {
        await updateSchedule(newSchedule.id, { notificationId: notifId });
        newSchedule.notificationId = notifId;
      }
    }
    await refresh();
    return newSchedule;
  }, [refresh]);

  const editSchedule = useCallback(async (id, data) => {
    const existing = schedules.find((s) => s.id === id);
    if (existing?.notificationId) await cancelAlarm(existing.notificationId);

    let notifId = null;
    if (data.alarmEnabled) {
      const updated = { ...existing, ...data };
      notifId = await scheduleAlarm({ ...updated, alarmDate: updated.date });
    }

    await updateSchedule(id, { ...data, notificationId: notifId });
    await refresh();
  }, [schedules, refresh]);

  const removeSchedule = useCallback(async (id) => {
    const existing = schedules.find((s) => s.id === id);
    if (existing?.notificationId) await cancelAlarm(existing.notificationId);
    await deleteSchedule(id);
    await refresh();
  }, [schedules, refresh]);

  const createAnniversary = useCallback(async (data) => {
    await addAnniversary(data);
    await refresh();
  }, [refresh]);

  const removeAnniversary = useCallback(async (id) => {
    await deleteAnniversary(id);
    await refresh();
  }, [refresh]);

  const getSchedulesForDate = useCallback((date) => {
    return schedules.filter((s) => s.date === date);
  }, [schedules]);

  const getAnniversariesForDate = useCallback((date) => {
    const d = dayjs(date);
    const month = d.month() + 1;
    const day = d.date();
    return anniversaries.filter((a) => a.month === month && a.day === day);
  }, [anniversaries]);

  const getDatesWithSchedule = useCallback((year, month) => {
    const set = new Set();
    schedules.forEach((s) => {
      const d = dayjs(s.date);
      if (d.year() === year && d.month() + 1 === month) {
        set.add(d.date());
      }
    });
    return set;
  }, [schedules]);

  const searchSchedules = useCallback(({ fromDate, toDate, keyword }) => {
    return schedules.filter((s) => {
      const inRange = (!fromDate || s.date >= fromDate) && (!toDate || s.date <= toDate);
      const matchKeyword = !keyword || s.memo?.toLowerCase().includes(keyword.toLowerCase());
      return inRange && matchKeyword;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [schedules]);

  return (
    <AppContext.Provider
      value={{
        schedules,
        anniversaries,
        selectedDate,
        setSelectedDate,
        currentMonth,
        setCurrentMonth,
        today,
        loading,
        createSchedule,
        editSchedule,
        removeSchedule,
        createAnniversary,
        removeAnniversary,
        getSchedulesForDate,
        getAnniversariesForDate,
        getDatesWithSchedule,
        searchSchedules,
        refresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
