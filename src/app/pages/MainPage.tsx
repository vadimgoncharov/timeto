import * as React from 'react';
import * as WebFont from 'webfontloader';
import * as gsap from 'gsap';
import {TweenLite} from 'gsap';
import * as onresize from 'onresize';
import {convertRange} from '../utils/math';

import sunImg from '../assets/i/sun.png';
import moonImg from '../assets/i/moon.png';
import sunGlowImg from '../assets/i/sun_glow.png';
import moonGlowImg from '../assets/i/moon_glow.png';
import deathStarImg from '../assets/i/death-star.png';

import './MainPage.scss';

const MINUTES_IN_DAY = 60 * 24;
const MINUTES_IN_DAY_TYPE = 60 * 6;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function decToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

const DAY_TYPES = [
  {
    name: 'night',
    phrases: {
      start: [
        'ночных жриц',
        'пялиться в потолок',
        'ну еще одну серию',
      ],
      end: [
        'видеть сны',
        'ворочаться',
        'ходить во сне',
      ],
    },
    gradient: [
      {offset: 0, color: '#0d1938'},
      {offset: 0.3, color: '#0d1938'},
      {offset: 0.6, color: '#17274c'},
      {offset: 1, color: '#27406d'},
    ],
  },
  {
    name: 'morning',
    phrases: {
      start: [
        'чистить зубы',
        'жарить яйца',
        'восстать из мёртвых',
      ],
      end: [
        'сделать лифтолук',
        'мечтать об обеде',
        'улыбнуться',
      ],
    },
    gradient: [
      {offset: 0, color: '#344f7e'},
      {offset: 0.3, color: '#6789ba'},
      {offset: 0.6, color: '#a5bfe0'},
      {offset: 1, color: '#dbcfca'},
    ],
  },
  {
    name: 'day',
    phrases: {
      start: [
        'заглянуть в холодильник',
        'выпить чай с конфетками',
        'гениальных идей',
        'переговоров',
      ],
      end: [
        'тупить в инете',
        'подмигнуть коллеге',
        'глазеть в окно',
      ],
    },
    gradient: [
      {offset: 0, color: '#608cce'},
      {offset: 0.3, color: '#608cce'},
      {offset: 0.6, color: '#8aabdb'},
      {offset: 1, color: '#bcd2eb'},
    ],
  },
  {
    name: 'evening',
    phrases: {
      start: [
        'трясти булками',
        'пялиться на соседа в метро',
        'набить холодильник',
      ],
      end: [
        'битвы с комарами',
        'распить вино',
        'расслабиться',
      ],
    },
    gradient: [
      {offset: 0, color: '#324c7c'},
      {offset: 0.5, color: '#6a5478'},
      {offset: 0.6, color: '#745577'},
      {offset: 1, color: '#b66f6b'},
    ],
  },
];

const getMinutesInDayFromDate = (date: Date, timezoneOffsetInMinutes: number = 0): number => {
  let mins =  (date.getUTCHours() * 60 + date.getUTCMinutes() - timezoneOffsetInMinutes);
  if (mins < 0) {
    mins = MINUTES_IN_DAY - mins;
  }
  mins = mins % MINUTES_IN_DAY;
  console.log('MINS', mins, date.getUTCHours(), date.getUTCMinutes(), timezoneOffsetInMinutes);
  return mins;
};

const NOW = new Date();

const CITY_ID_PODOLSK = 1;
const CITY_ID_NY = 2;
const CITY_ID_SYDNEY = 3;

const CITIES = {
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

class App extends React.Component {
  canvasElement: HTMLCanvasElement;
  moonImg: HTMLImageElement;
  moonGlowImg: HTMLImageElement;
  sunImg: HTMLImageElement;
  sunGlowImg: HTMLImageElement;
  deathStarImg: HTMLImageElement;
  initialDate: Date = new Date(NOW);
  state = {
    windowWidth: 0,
    windowHeight: 0,
    selectedDate: new Date(NOW),
    selectedCityId: CITY_ID_PODOLSK,
    selectedTimezoneOffsetInMinutes: CITIES[CITY_ID_PODOLSK].timezoneOffsetInMinutes,
  };

  componentDidMount() {
    WebFont.load({
      custom: {
        families: ['Neucha']
      }
    });
    onresize.on(this.onResize);
    this.loadImages().then(() => {
      this.recalculateSizes();
      this.renderCanvas();
    });
  }

  loadImages() {
    return Promise.all([
      this.loadImage(moonImg),
      this.loadImage(moonGlowImg),
      this.loadImage(sunImg),
      this.loadImage(sunGlowImg),
      this.loadImage(deathStarImg),
    ]).then((data) => {
      this.moonImg = data[0];
      this.moonGlowImg = data[1];
      this.sunImg = data[2];
      this.sunGlowImg = data[3];
      this.deathStarImg = data[4];
    });
  }

  loadImage(imgSrc) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.src = imgSrc;
    });
  }

  public componentWillUnmount() {
    onresize.off(this.onResize);
  }

  componentDidUpdate() {
    this.renderCanvas();
  }

  private recalculateSizes() {
    const {canvasElement} = this;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    canvasElement.setAttribute('width', `${windowWidth}px`);
    canvasElement.setAttribute('height', `${windowHeight}px`);

    this.setState({
      windowWidth,
      windowHeight,
    });
  }

  private onResize = () => {
    this.recalculateSizes();
  };

  onCanvasRefSet = (el: HTMLCanvasElement) => {
    this.canvasElement = el;
  };

  onSliderChange = (event: Event) => {
    const target = event.currentTarget;
    if (target instanceof HTMLInputElement) {
      const {selectedDate} = this.state;
      const newDate = new Date(selectedDate);
      newDate.setHours(0);
      newDate.setMinutes(target.value);
      this.setState({
        selectedDate: newDate,
        // currMinuteInDay: parseInt(target.value, 10),
      });
    }
  };

  getCityName() {
    return CITIES[this.state.selectedCityId].namePrepositional;
  }

  getPhrase() {
    const {selectedDate, selectedTimezoneOffsetInMinutes} = this.state;
    const currMinuteInDay = getMinutesInDayFromDate(selectedDate, selectedTimezoneOffsetInMinutes);
    const currDayTypeIndex = Math.floor(currMinuteInDay / MINUTES_IN_DAY_TYPE);
    const currMinuteInDayType = currMinuteInDay % MINUTES_IN_DAY_TYPE;
    const isStartPhrase = currMinuteInDayType < (MINUTES_IN_DAY_TYPE / 2);
    const phrases = DAY_TYPES[currDayTypeIndex].phrases[isStartPhrase ? 'start' : 'end'];
    const phraseIndex = getRandomInt(0, phrases.length - 1);
    return phrases[phraseIndex];
  }

  getTimeMessage() {
    const {selectedDate} = this.state;
    const d = new Date(selectedDate);
    d.setTime(d.getTime())
    const time = (
      <div>{selectedDate.getHours()}:{selectedDate.getMinutes()}</div>
    );
    return (
      <div>В {this.getCityName()}<br /> время {this.getPhrase()}<br /></div>
    );
  }

  getDayType() {
    const {currMinuteInDay} = this.state;
    switch (currMinuteInDay) {
      case 0:
        return 'morning';
      case 1:
        return 'day';
      case 2:
        return 'evening';
      case 3:
        return 'night';
      default:
        return 'morning';
    }
  }

  getBgStyle() {
    return {
      // background: 'yellow',
    };
  }

  renderCanvas() {
    const {windowWidth, windowHeight, selectedDate, selectedTimezoneOffsetInMinutes} = this.state;
    const currMinuteInDay = getMinutesInDayFromDate(selectedDate, selectedTimezoneOffsetInMinutes);
    const ctx = this.canvasElement.getContext('2d');
    const currDayTypeIndex = Math.floor((currMinuteInDay % MINUTES_IN_DAY) / MINUTES_IN_DAY_TYPE)

    const currMinuteInDayType = currMinuteInDay % MINUTES_IN_DAY_TYPE;
    const currMinuteInDayOffset = convertRange(currMinuteInDayType, 0, MINUTES_IN_DAY_TYPE, 0, windowHeight);

    const prevDayTypeIndex = currDayTypeIndex - 1 < 0 ? DAY_TYPES.length - 1 : currDayTypeIndex - 1;
    const nextDayTypeIndex = currDayTypeIndex + 1 > DAY_TYPES.length - 1 ? 0 : currDayTypeIndex + 1;

    console.log(currMinuteInDay, currMinuteInDayOffset, nextDayTypeIndex);
    // [
    //   DAY_TYPES[prevDayTypeIndex],
    //   DAY_TYPES[currDayTypeIndex],
    //   DAY_TYPES[nextDayTypeIndex],
    // ].forEach((dayTypeData, index: number) => {
    //   ctx.save();
    //   const gradient = ctx.createLinearGradient(
    //     0,
    //     windowHeight * (index - 1) - currMinuteInDayOffset,
    //     0,
    //     windowHeight * (index - 1) - currMinuteInDayOffset + windowHeight,
    //   );
    //   dayTypeData.gradient.forEach((gradientData) => {
    //     gradient.addColorStop(gradientData.offset, gradientData.color);
    //   });
    //   ctx.fillStyle = gradient;
    //   ctx.fillRect(0, windowHeight * (index - 1) - currMinuteInDayOffset, windowWidth, windowHeight);
    //   ctx.restore();
    // });

    const currDayTypeData = DAY_TYPES[currDayTypeIndex];
    const nextDayTypeData = DAY_TYPES[nextDayTypeIndex];

    const gradient = ctx.createLinearGradient(0, 0, 0, windowHeight);
    currDayTypeData.gradient.forEach((gradientData, gradientIndex) => {
      const nextGradientData = nextDayTypeData.gradient[gradientIndex];
      const {color: colorFrom} = gradientData;
      const {color: colorTo} = nextGradientData;
      const cFrom1 = parseInt(colorFrom.slice(1, 3), 16);
      const cFrom2 = parseInt(colorFrom.slice(3, 5), 16);
      const cFrom3 = parseInt(colorFrom.slice(5, 7), 16);
      const cTo1 = parseInt(colorTo.slice(1, 3), 16);
      const cTo2 = parseInt(colorTo.slice(3, 5), 16);
      const cTo3 = parseInt(colorTo.slice(5, 7), 16);
      const c1 = Math.floor(convertRange(currMinuteInDayType, 0, MINUTES_IN_DAY_TYPE, cFrom1, cTo1));
      const c2 = Math.floor(convertRange(currMinuteInDayType, 0, MINUTES_IN_DAY_TYPE, cFrom2, cTo2));
      const c3 = Math.floor(convertRange(currMinuteInDayType, 0, MINUTES_IN_DAY_TYPE, cFrom3, cTo3));
      const newColor = `#${decToHex(c1)}${decToHex(c2)}${decToHex(c3)}`;
      gradient.addColorStop(gradientData.offset, newColor);
    });

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, windowWidth, windowHeight);
    ctx.restore();

    const currMinuteInDayFinal = (currMinuteInDay % MINUTES_IN_DAY);
    let moonOpacity = 0;
    let moonY = 0;
    let sunOpacity = 0;
    let sunY = 0;

    const yStart = 50;
    const yEnd = windowHeight - 200;

    if (currMinuteInDayFinal <= 180) {
      moonOpacity = convertRange(currMinuteInDayFinal, 0, 180, 1, 0.01);
      moonY = convertRange(currMinuteInDayFinal, 0, 180, yStart, yEnd);
    } else if (currMinuteInDayFinal >= 1260) {
      moonOpacity = convertRange(currMinuteInDayFinal, 1260, 1440, 0.01, 1);
      moonY = convertRange(currMinuteInDayFinal, 1260, 1440, yEnd, yStart);
    }

    if (currMinuteInDayFinal >= 180 && currMinuteInDayFinal <= 600) {
      sunOpacity = convertRange(currMinuteInDayFinal, 180, 600, 0.01, 1);
      sunY = convertRange(currMinuteInDayFinal, 180, 600, yEnd, yStart);
    } else if (currMinuteInDayFinal >= 600 && currMinuteInDayFinal <= 700) {
      sunOpacity = 1
      sunY = yStart;
    } else if (currMinuteInDayFinal >= 700 && currMinuteInDayFinal <= 1260) {
      sunOpacity = convertRange(currMinuteInDayFinal, 700, 1260, 1, 0.01);
      sunY = convertRange(currMinuteInDayFinal, 700, 1260, yStart, yEnd);
    }

    ctx.save();
    ctx.globalAlpha = moonOpacity;
    ctx.drawImage(this.moonGlowImg, windowWidth / 2 - 200 / 2, moonY - 50, 200, 200);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = moonOpacity;
    ctx.drawImage(this.moonImg, windowWidth / 2 - 100 / 2, moonY, 100, 100);
    ctx.restore();


    ctx.save();
    ctx.globalAlpha = sunOpacity;
    ctx.drawImage(this.sunGlowImg, windowWidth / 2 - 200 / 2, sunY - 50, 200, 200);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = sunOpacity;
    ctx.drawImage(this.sunImg, windowWidth / 2 - 100 / 2, sunY, 100, 100);
    ctx.restore();

    const dsAlpha = convertRange(
      (selectedDate.getTime() - this.initialDate.getTime()),
      0,
      15 * 5 * 24 * 60 * 60 * 1000,
      0,
      1,
    );

    const dsSize = convertRange(
      (selectedDate.getTime() - this.initialDate.getTime()),
      0,
      15 * 8 * 24 * 60 * 60 * 1000,
      0,
      100,
    );
    console.log('DSALPHA', dsAlpha, selectedDate.getTime() - this.initialDate.getTime());
    ctx.save();
    ctx.globalAlpha = dsAlpha;
    ctx.drawImage(this.deathStarImg, windowWidth - 300, 100, dsSize, dsSize);
    ctx.restore();
  }

  onRandomCityClickold = (event: Event) => {
    const target = event.currentTarget;
    const cityId = parseInt(target.getAttribute('data-city-id'), 10);
    const duration = parseInt(target.getAttribute('data-duration'), 10);
    const {selectedDate} = this.state;
    const future = new Date(selectedDate);
    future.setHours(selectedDate.getHours() + timeOffset);
    const data = {x: selectedDate.getTime()};
    const tween = TweenLite.to(data, duration || 2, {x: future.getTime(), onUpdate: () => {
      // console.log(data.x);
      const d = new Date(data.x);
      const minutes = d.getHours() * 60 + d.getMinutes();
      this.setState({
        selectedDate: d,
      });
    }});
  };
  onRandomCityClick = (event: Event) => {
    const target = event.currentTarget;
    const cityId = parseInt(target.getAttribute('data-city-id'), 10);
    if (this.state.selectedCityId === cityId) {
      return;
    }
    this.setState({
      selectedCityId: cityId,
    }, () => {
      const data = {x: this.state.selectedTimezoneOffsetInMinutes};
      const newTimezoneInMinutes = CITIES[cityId].timezoneOffsetInMinutes;
      const tween = TweenLite.to(data, 2, {x: newTimezoneInMinutes, onUpdate: () => {
        this.setState({
          selectedTimezoneOffsetInMinutes: Math.round(data.x),
        });
      },
        ease: gsap.Quad.easeInOut});
    });
  };

  onFutureClick = () => {
    const target = event.currentTarget;
    const {selectedDate} = this.state;
    const future = new Date(selectedDate);
    future.setDate(selectedDate.getDate() + 15);
    // future.setHours(getRandomInt(0, 23));
    // future.setMinutes(getRandomInt(0, 59));
    const data = {x: selectedDate.getTime()};
    const tween = TweenLite.to(data, 5, {
      x: future.getTime(),
      onUpdate: () => {
        // console.log(data.x);
        const d = new Date(data.x);
        this.setState({
          selectedDate: d,
        });
      },
      ease: gsap.Quad.easeInOut
    });
  };

  render() {
    const className = `App App--dayType_${this.getDayType()}`;
    const bgStyle = this.getBgStyle();
    return (
      <div className={className}>
        <canvas className="App-canvas" ref={this.onCanvasRefSet} />
        <div className="App-message">{this.getTimeMessage()}</div>
        <div className="App-slider">
          <input
            type="range"
            min="0"
            max={MINUTES_IN_DAY - 1}
            value={getMinutesInDayFromDate(this.state.selectedDate, this.state.selectedTimezoneOffsetInMinutes)}
            onChange={this.onSliderChange}/>
          <br/>
          {Object.keys(CITIES).map((cityId, index) => {
            const city = CITIES[cityId];
            return (
              <button type="button" onClick={this.onRandomCityClick} data-city-id={cityId} key={cityId}>{city.name}</button>
            )
          })}
          <button type="button" onClick={this.onFutureClick} data-offset="200" data-duration="10">future</button>
        </div>
      </div>
    )
  }
}

export default App;
