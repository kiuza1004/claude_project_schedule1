import AsyncStorage from '@react-native-async-storage/async-storage';

const SCHEDULES_KEY = '@schedules';
const ANNIVERSARIES_KEY = '@anniversaries';

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Schedule CRUD
export const loadSchedules = async () => {
  try {
    const json = await AsyncStorage.getItem(SCHEDULES_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
};

export const saveSchedules = async (schedules) => {
  try {
    await AsyncStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
  } catch (e) {
    console.error('saveSchedules error', e);
  }
};

export const addSchedule = async (schedule) => {
  const schedules = await loadSchedules();
  const newSchedule = { ...schedule, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  await saveSchedules([...schedules, newSchedule]);
  return newSchedule;
};

export const updateSchedule = async (id, updates) => {
  const schedules = await loadSchedules();
  const updated = schedules.map((s) =>
    s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
  );
  await saveSchedules(updated);
  return updated;
};

export const deleteSchedule = async (id) => {
  const schedules = await loadSchedules();
  const filtered = schedules.filter((s) => s.id !== id);
  await saveSchedules(filtered);
  return filtered;
};

export const getSchedulesByDate = async (date) => {
  const schedules = await loadSchedules();
  return schedules.filter((s) => s.date === date);
};

// Anniversary CRUD
export const loadAnniversaries = async () => {
  try {
    const json = await AsyncStorage.getItem(ANNIVERSARIES_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
};

export const saveAnniversaries = async (anniversaries) => {
  try {
    await AsyncStorage.setItem(ANNIVERSARIES_KEY, JSON.stringify(anniversaries));
  } catch (e) {
    console.error('saveAnniversaries error', e);
  }
};

export const addAnniversary = async (anniversary) => {
  const anniversaries = await loadAnniversaries();
  const newAnniversary = { ...anniversary, id: generateId() };
  await saveAnniversaries([...anniversaries, newAnniversary]);
  return newAnniversary;
};

export const deleteAnniversary = async (id) => {
  const anniversaries = await loadAnniversaries();
  const filtered = anniversaries.filter((a) => a.id !== id);
  await saveAnniversaries(filtered);
  return filtered;
};
