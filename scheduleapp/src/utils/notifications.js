import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Android requires a notification channel
export const setupNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('schedule-alarm', {
      name: '일정 알림',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4A90D9',
      sound: 'default',
    });
  }
};

export const requestPermissions = async () => {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const scheduleAlarm = async (schedule) => {
  if (!schedule.alarmEnabled || !schedule.alarmTime || !schedule.alarmDate) return null;

  const granted = await requestPermissions();
  if (!granted) return null;

  try {
    await setupNotificationChannel();

    const [hour, minute] = schedule.alarmTime.split(':').map(Number);
    const alarmDate = new Date(schedule.alarmDate);
    alarmDate.setHours(hour, minute || 0, 0, 0);

    const beforeMinutes = getBeforeMinutes(schedule.alarmBefore);
    alarmDate.setMinutes(alarmDate.getMinutes() - beforeMinutes);

    if (alarmDate <= new Date()) return null;

    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '일정 알림',
        body: schedule.memo,
        sound: 'default',
        data: { scheduleId: schedule.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: alarmDate,
        channelId: 'schedule-alarm',
      },
    });
    return notifId;
  } catch (e) {
    console.error('scheduleAlarm error', e);
    return null;
  }
};

export const cancelAlarm = async (notificationId) => {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    console.error('cancelAlarm error', e);
  }
};

const getBeforeMinutes = (alarmBefore) => {
  switch (alarmBefore) {
    case '10min': return 10;
    case '30min': return 30;
    case '1hour': return 60;
    case '2hour': return 120;
    case '1day': return 1440;
    default: return 0;
  }
};

export const ALARM_BEFORE_OPTIONS = [
  { label: '없음', value: 'none' },
  { label: '10분 전', value: '10min' },
  { label: '30분 전', value: '30min' },
  { label: '1시간 전', value: '1hour' },
  { label: '2시간 전', value: '2hour' },
  { label: '하루 전', value: '1day' },
];
