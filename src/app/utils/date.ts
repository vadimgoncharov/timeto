import * as c from '../constants';

function getMinutesInDayFromDate(date: Date, timezoneOffsetInMinutes: number = 0): number {
  let mins =  (date.getUTCHours() * 60 + date.getUTCMinutes() - timezoneOffsetInMinutes);
  if (mins < 0) {
    mins = c.values.MINUTES_IN_DAY - mins;
  }
  mins = mins % c.values.MINUTES_IN_DAY;
  return mins;
};

export {
  getMinutesInDayFromDate,
};
