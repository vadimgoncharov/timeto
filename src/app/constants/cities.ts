export const CITY_ID_PODOLSK = 1;
export const CITY_ID_NY = 2;
export const CITY_ID_SYDNEY = 3;

export const CITIES = {
  [CITY_ID_PODOLSK]: {
    id: CITY_ID_PODOLSK,
    name: 'Подольск',
    namePrepositional: 'Подольске',
    timezoneOffsetInMinutes: -3 * 60,
  },
  [CITY_ID_NY]: {
    id: CITY_ID_NY,
    name: 'Нью-Йорк',
    namePrepositional: 'Нью-Йорке',
    timezoneOffsetInMinutes: 5 * 60,
  },
  [CITY_ID_SYDNEY]: {
    id: CITY_ID_SYDNEY,
    name: 'Сидней',
    namePrepositional: 'Сиднее',
    timezoneOffsetInMinutes: -10 * 60,
  },
};
