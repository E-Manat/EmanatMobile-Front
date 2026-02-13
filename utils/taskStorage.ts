import AsyncStorage from '@react-native-async-storage/async-storage';

const TASK_START_TIMES_KEY = 'taskStartTimes';

export const getTaskStartTimes = async (): Promise<Record<string, number>> => {
  try {
    const raw = await AsyncStorage.getItem(TASK_START_TIMES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const setTaskStartTime = async (
  taskId: string,
  timestamp: number,
): Promise<void> => {
  const times = await getTaskStartTimes();
  times[taskId] = timestamp;
  await AsyncStorage.setItem(TASK_START_TIMES_KEY, JSON.stringify(times));
};

export const getTaskStartTime = async (
  taskId: string,
): Promise<number | null> => {
  const times = await getTaskStartTimes();
  return times[taskId] ?? null;
};

export const removeTaskStartTime = async (taskId: string): Promise<void> => {
  const times = await getTaskStartTimes();
  delete times[taskId];
  if (Object.keys(times).length === 0) {
    await AsyncStorage.removeItem(TASK_START_TIMES_KEY);
  } else {
    await AsyncStorage.setItem(TASK_START_TIMES_KEY, JSON.stringify(times));
  }
};
