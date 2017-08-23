import {MINUTES_IN_DAY_TYPE} from '../constants/values';
import {TIMES_OF_DAY} from '../constants/timesOfDay';

import {getMinutesInDayFromDate} from '../utils/date';
import {getRandomInt} from '../utils/math';

function getPhraseByDate(date: Date, timezoneOffsetInMinutes: number): string {
  const currMinuteInDay = getMinutesInDayFromDate(date, timezoneOffsetInMinutes);
  const currDayTypeIndex = Math.floor(currMinuteInDay / MINUTES_IN_DAY_TYPE);
  const currMinuteInDayType = currMinuteInDay % MINUTES_IN_DAY_TYPE;
  const isStartPhrase = currMinuteInDayType < (MINUTES_IN_DAY_TYPE / 2);
  const phrases = TIMES_OF_DAY[currDayTypeIndex].phrases[isStartPhrase ? 'start' : 'end'];
  const phraseIndex = getRandomInt(0, phrases.length - 1);
  return phrases[phraseIndex];
}

export {
  getPhraseByDate,
};
