function convertRange(
  oldValue: number,
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number,
  isRoundByInterval: boolean = true): number {
  if (isRoundByInterval) {
    oldValue = Math.max(oldValue, oldMin);
    oldValue = Math.min(oldValue, oldMax);
  }
  const oldRange = (oldMax - oldMin);
  let newValue;
  let newRange;
  if (oldRange === 0) {
    newValue = newMin;
  } else {
    newRange = (newMax - newMin);
    newValue = (((oldValue - oldMin) * newRange) / oldRange) + newMin
  }
  return newValue;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function decToHex(c: number): string {
  const hex = c.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

function convertColor(
  convertValueFrom: number,
  convertValueFromMin: number,
  convertValueFromMax: number,
  colorStart: string,
  colorEnd: string,
): string {
  const rFrom = parseInt(colorStart.slice(1, 3), 16);
  const gFrom = parseInt(colorStart.slice(3, 5), 16);
  const bFrom = parseInt(colorStart.slice(5, 7), 16);
  const rTo = parseInt(colorEnd.slice(1, 3), 16);
  const gTo = parseInt(colorEnd.slice(3, 5), 16);
  const bTo = parseInt(colorEnd.slice(5, 7), 16);
  const newR = Math.floor(convertRange(convertValueFrom, convertValueFromMin, convertValueFromMax, rFrom, rTo));
  const newG = Math.floor(convertRange(convertValueFrom, convertValueFromMin, convertValueFromMax, gFrom, gTo));
  const newB = Math.floor(convertRange(convertValueFrom, convertValueFromMin, convertValueFromMax, bFrom, bTo));

  const newColor = `#${decToHex(newR)}${decToHex(newG)}${decToHex(newB)}`;

  return newColor;
}

export {
  convertRange,
  convertColor,
  getRandomInt,
};
