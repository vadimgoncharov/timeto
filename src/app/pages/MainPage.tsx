import * as React from 'react';
import * as WebFont from 'webfontloader';
import {TweenMax} from 'gsap';
import * as onresize from 'onresize';
import {convertRange} from '../utils/math';

import sunImg from '../assets/i/sun.png';
import moonImg from '../assets/i/moon.png';

import './MainPage.scss';

const MINUTES_IN_DAY = 60 * 24;
const MINUTES_IN_DAY_TYPE = 60 * 6;

const DAY_TYPES = [
  {
    name: 'night',
    gradient: [
      {offset: 0.5, color: '#091534'},
      {offset: 1, color: '#445d87'},
    ],
  },
  {
    name: 'morning',
    gradient: [
      {offset: 0, color: '#445d87'},
      {offset: 0.3, color: '#cdd2db'},
      {offset: 0.4, color: '#d8c4bd'},
      {offset: 0.5, color: '#c3adaf'},
      {offset: 0.7, color: '#9b8da2'},
      {offset: 0.8, color: '#6e7a9c'},
      {offset: 0.9, color: '#608cce'},
    ],
  },
  {
    name: 'day',
    gradient: [
      {offset: 0, color: '#608cce'},
      {offset: 1, color: '#c1d7ee'},
    ],
  },
  {
    name: 'evening',
    gradient: [
      {offset: 0, color: '#c1d7ee'},
      {offset: 0.2, color: '#314d80'},
      {offset: 0.3, color: '#59547d'},
      {offset: 0.4, color: '#7e5872'},
      {offset: 0.5, color: '#d57a67'},
      {offset: 0.7, color: '#9b7b8c'},
      {offset: 1, color: '#091534'},
    ],
  },
];

class App extends React.Component {
  canvasElement: HTMLCanvasElement;
  moonImg: HTMLImageElement;
  sunImg: HTMLImageElement;
  state = {
    windowWidth: 0,
    windowHeight: 0,
    currMinuteInDay: 0,
  };

  componentDidMount() {
    WebFont.load({
      custom: {
        families: ['Neucha']
      }
    });
    // TweenMax.to(this.refs.bg, 1, {
    //   autoCSS: true,
    //   css: {
    //     background: 'red'
    //   }
    // })
    onresize.on(this.onResize);
    this.loadImages().then(() => {
      this.recalculateSizes();
      this.renderCanvas();
    });
  }

  loadImages() {
    return Promise.all([
      this.loadImage(moonImg),
      this.loadImage(sunImg),
    ]).then((data) => {
      this.moonImg = data[0];
      this.sunImg = data[1];
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
      this.setState({
        currMinuteInDay: parseInt(target.value, 10),
      });
    }
  };

  getCityName() {
    return 'Подольске';
  }

  getPhrase() {
    return 'трясти булками';
  }

  getTimeMessage() {
    return (
      <div>В {this.getCityName()}<br /> время {this.getPhrase()}</div>
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
    const {windowWidth, windowHeight, currMinuteInDay} = this.state;
    const ctx = this.canvasElement.getContext('2d');
    const currDayTypeIndex = Math.floor((currMinuteInDay % MINUTES_IN_DAY) / MINUTES_IN_DAY_TYPE)

    const currMinuteInDayType = currMinuteInDay % MINUTES_IN_DAY_TYPE;
    const currMinuteInDayOffset = convertRange(currMinuteInDayType, 0, MINUTES_IN_DAY_TYPE, 0, windowHeight);

    const prevDayTypeIndex = currDayTypeIndex - 1 < 0 ? DAY_TYPES.length - 1 : currDayTypeIndex - 1;
    const nextDayTypeIndex = currDayTypeIndex + 1 > DAY_TYPES.length - 1 ? 0 : currDayTypeIndex + 1;

    // console.log(currMinuteInDayOffset, currMinuteInDay, currDayTypeIndex, prevDayTypeIndex, nextDayTypeIndex);
    [
      DAY_TYPES[prevDayTypeIndex],
      DAY_TYPES[currDayTypeIndex],
      DAY_TYPES[nextDayTypeIndex],
    ].forEach((dayTypeData, index: number) => {
      ctx.save();
      const gradient = ctx.createLinearGradient(
        0,
        windowHeight * (index - 1) - currMinuteInDayOffset,
        0,
        windowHeight * (index - 1) - currMinuteInDayOffset + windowHeight,
      );
      dayTypeData.gradient.forEach((gradientData) => {
        gradient.addColorStop(gradientData.offset, gradientData.color);
      });
      ctx.fillStyle = gradient;
      ctx.fillRect(0, windowHeight * (index - 1) - currMinuteInDayOffset, windowWidth, windowHeight);
      ctx.restore();
    });

    const currMinuteInDayFinal = (currMinuteInDay % MINUTES_IN_DAY);
    let moonOpacity = 0;
    let moonY = 0;
    let sunOpacity = 0;
    let sunY = 0;

    if (currMinuteInDayFinal <= 180) {
      moonOpacity = convertRange(currMinuteInDayFinal, 0, 180, 1, 0);
      moonY = convertRange(currMinuteInDayFinal, 0, 180, 100, windowHeight);
    } else if (currMinuteInDayFinal >= 1260) {
      moonOpacity = convertRange(currMinuteInDayFinal, 1260, 1440, 0, 1);
      moonY = convertRange(currMinuteInDayFinal, 1260, 1440, windowHeight, 100);
    }

    if (currMinuteInDayFinal >= 180 && currMinuteInDayFinal <= 600) {
      sunOpacity = convertRange(currMinuteInDayFinal, 0, 600, 0, 1);
      sunY = convertRange(currMinuteInDayFinal, 0, 600, windowHeight, 100);
    } else if (currMinuteInDayFinal >= 600 && currMinuteInDayFinal <= 1080) {
      sunOpacity = 1
      sunY = 100;
    } else if (currMinuteInDayFinal >= 1080 && currMinuteInDayFinal <= 1260) {
      sunOpacity = convertRange(currMinuteInDayFinal, 1080, 1260, 1, 0);
      sunY = convertRange(currMinuteInDayFinal, 1080, 1260, 100, windowHeight);
    }


    const circleY = [0, 2].indexOf(currDayTypeIndex) !== -1 ? currMinuteInDayOffset : windowHeight - currMinuteInDayOffset

    ctx.save();
    ctx.globalAlpha = moonOpacity;
    ctx.drawImage(this.moonImg, windowWidth / 2 - 100 / 2, moonY, 100, 100);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = sunOpacity;
    ctx.drawImage(this.sunImg, windowWidth / 2 - 100 / 2, sunY, 100, 100);
    ctx.restore();
  }

  render() {
    const className = `App App--dayType_${this.getDayType()}`;
    const bgStyle = this.getBgStyle();
    return (
      <div className={className}>
        <canvas className="App-canvas" ref={this.onCanvasRefSet} />
        <div className="App-message">{this.getTimeMessage()}</div>
        <div className="App-slider">
          <input type="range" min="0" max={MINUTES_IN_DAY} value={this.state.currMinuteInDay} onChange={this.onSliderChange}/>
        </div>
      </div>
    )
  }
}

export default App;
