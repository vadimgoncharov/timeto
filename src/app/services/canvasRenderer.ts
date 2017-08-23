import * as c from '../constants';
import {TIMES_OF_DAY} from '../constants/timesOfDay';

import {getMinutesInDayFromDate} from '../utils/date';
import {convertColor, convertRange} from '../utils/math';

type TData = {
  ctx: CanvasRenderingContext2D,
  deathStarImg: HTMLImageElement,
  sunImg: HTMLImageElement,
  sunGlowImg: HTMLImageElement,
  moonImg: HTMLImageElement,
  moonGlowImg: HTMLImageElement,
  windowWidth: number,
  windowHeight: number,
  selectedDate: Date,
  initialDate: Date,
  selectedTimezoneOffsetInMinutes: number,
};

function renderGradient(data: TData): void {
  const {
    ctx,
    windowWidth,
    windowHeight,
    selectedDate,
    selectedTimezoneOffsetInMinutes,
  } = data;
  const currMinuteInDay = getMinutesInDayFromDate(selectedDate, selectedTimezoneOffsetInMinutes);
  const currTimeOfDayIndex = Math.floor((currMinuteInDay % c.values.MINUTES_IN_DAY) / c.values.MINUTES_IN_DAY_TYPE)

  const currMinuteInDayType = currMinuteInDay % c.values.MINUTES_IN_DAY_TYPE;
  const currMinuteInDayOffset = convertRange(currMinuteInDayType, 0, c.values.MINUTES_IN_DAY_TYPE, 0, windowHeight);

  const nextDayTypeIndex = currTimeOfDayIndex + 1 > TIMES_OF_DAY.length - 1 ? 0 : currTimeOfDayIndex + 1;

  const currDayTypeData = TIMES_OF_DAY[currTimeOfDayIndex];
  const nextDayTypeData = TIMES_OF_DAY[nextDayTypeIndex];

  const gradient = ctx.createLinearGradient(0, 0, 0, windowHeight);
  currDayTypeData.gradient.forEach((gradientData, gradientIndex) => {
    const nextGradientData = nextDayTypeData.gradient[gradientIndex];
    const {color: colorFrom} = gradientData;
    const {color: colorTo} = nextGradientData;
    const newColor = convertColor(currMinuteInDayType, 0, c.values.MINUTES_IN_DAY_TYPE, colorFrom, colorTo);
    gradient.addColorStop(gradientData.offset, newColor);
  });

  ctx.save();
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, windowWidth, windowHeight);
  ctx.restore();
}

function renderSunAndMoon(data: TData): void {
  const {
    ctx,
    sunImg,
    sunGlowImg,
    moonImg,
    moonGlowImg,
    windowWidth,
    windowHeight,
    selectedDate,
    selectedTimezoneOffsetInMinutes,
  } = data;
  const currMinuteInDay = getMinutesInDayFromDate(selectedDate, selectedTimezoneOffsetInMinutes);
  let moonOpacity = 0;
  let moonY = 0;
  let sunOpacity = 0;
  let sunY = 0;

  const yStart = 50;
  const yEnd = windowHeight - 200;

  if (currMinuteInDay <= 180) {
    moonOpacity = convertRange(currMinuteInDay, 0, 180, 1, 0.01);
    moonY = convertRange(currMinuteInDay, 0, 180, yStart, yEnd);
  } else if (currMinuteInDay >= 1260) {
    moonOpacity = convertRange(currMinuteInDay, 1260, 1440, 0.01, 1);
    moonY = convertRange(currMinuteInDay, 1260, 1440, yEnd, yStart);
  }

  if (currMinuteInDay >= 180 && currMinuteInDay <= 600) {
    sunOpacity = convertRange(currMinuteInDay, 180, 600, 0.01, 1);
    sunY = convertRange(currMinuteInDay, 180, 600, yEnd, yStart);
  } else if (currMinuteInDay >= 600 && currMinuteInDay <= 700) {
    sunOpacity = 1;
    sunY = yStart;
  } else if (currMinuteInDay >= 700 && currMinuteInDay <= 1260) {
    sunOpacity = convertRange(currMinuteInDay, 700, 1260, 1, 0.01);
    sunY = convertRange(currMinuteInDay, 700, 1260, yStart, yEnd);
  }

  ctx.save();
  ctx.globalAlpha = moonOpacity;
  ctx.drawImage(moonGlowImg, windowWidth / 2 - 200 / 2, moonY - 50, 200, 200);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = moonOpacity;
  ctx.drawImage(moonImg, windowWidth / 2 - 100 / 2, moonY, 100, 100);
  ctx.restore();


  ctx.save();
  ctx.globalAlpha = sunOpacity;
  ctx.drawImage(sunGlowImg, windowWidth / 2 - 200 / 2, sunY - 50, 200, 200);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = sunOpacity;
  ctx.drawImage(sunImg, windowWidth / 2 - 100 / 2, sunY, 100, 100);
  ctx.restore();
}

function renderDeathStar(data: TData): void {
  const {
    ctx,
    deathStarImg,
    windowWidth,
    selectedDate,
    initialDate,
  } = data;

  const alpha = convertRange(
    (selectedDate.getTime() - initialDate.getTime()),
    0,
    15 * 5 * 24 * 60 * 60 * 1000,
    0,
    1,
  );

  const size = convertRange(
    (selectedDate.getTime() - initialDate.getTime()),
    0,
    15 * 8 * 24 * 60 * 60 * 1000,
    0,
    100,
  );

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(deathStarImg, windowWidth - 300, 100, size, size);
  ctx.restore();
}

function render(data: TData): void {
  renderGradient(data);
  renderSunAndMoon(data);
  renderDeathStar(data);
}

export {
  render,
};
