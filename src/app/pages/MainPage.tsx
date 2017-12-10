import * as React from 'react';
import * as gsap from 'gsap';
import * as onresize from 'onresize';

import {getMinutesInDayFromDate} from '../utils/date';
import * as canvasRenderer from '../services/canvasRenderer';
import * as phraseService from '../services/phrase';

import * as c from '../constants';

import sunImg from '../assets/i/sun.png';
import moonImg from '../assets/i/moon.png';
import sunGlowImg from '../assets/i/sun_glow.png';
import moonGlowImg from '../assets/i/moon_glow.png';
import deathStarImg from '../assets/i/death-star.png';

import './MainPage.scss';

const NOW = new Date();

type TProps = {

};

type TState = {
  windowWidth: number,
  windowHeight: number,
  selectedDate: Date,
  selectedCityId: number,
  selectedTimezoneOffsetInMinutes: number,
  isFutureAnimationRunning: boolean,
  isTimezoneAnimationRunning: boolean,
};

class App extends React.Component<TProps, TState> {
  public state: TState = {
    windowWidth: 0,
    windowHeight: 0,
    selectedDate: new Date(NOW),
    selectedCityId: c.cities.CITY_ID_PODOLSK,
    selectedTimezoneOffsetInMinutes: c.cities.CITIES[c.cities.CITY_ID_PODOLSK].timezoneOffsetInMinutes,
    isFutureAnimationRunning: false,
    isTimezoneAnimationRunning: false,
  };

  private canvasElement: HTMLCanvasElement;
  private moonImg: HTMLImageElement;
  private moonGlowImg: HTMLImageElement;
  private sunImg: HTMLImageElement;
  private sunGlowImg: HTMLImageElement;
  private deathStarImg: HTMLImageElement;
  private initialDate: Date = new Date(NOW);

  public componentWillMount() {
    this.loadFonts();
  }

  public componentDidMount() {
    onresize.on(this.onResize);
    this.loadImages().then(() => {
      this.recalculateSizes();
      this.renderCanvas();
      this.runDateChecker();
    });
  }

  public componentWillUnmount() {
    onresize.off(this.onResize);
  }

  public componentDidUpdate() {
    this.renderCanvas();
  }

  public render() {
    return (
      <div className={`App is-animationRunning_${this.isAnimationRunning() ? 'yes' : 'no'}`}>
        <canvas className="App-canvas" ref={this.onCanvasRefSet} />
        <div className="App-phrase">{this.getPhraseMessage()}</div>
        <div className="App-control">
          {this.renderCities()}
          {this.renderFutureButton()}
        </div>
      </div>
    )
  }

  private loadFonts() {
    const isFontLoadingApiSupported = (
      (window as any).FontFace && (document as any).fonts
    );
    if (!isFontLoadingApiSupported) {
      return;
    }
    const font = new (window as any).FontFace(
      'Neucha', 'url(assets/Neucha.woff2)'
    );
    (document as any).fonts.add(font);
    font.load().then(() => {
      document.documentElement.classList.add('is-fontLoaded');
    }, () => {
      // console.error('err', err);
    });
  }

  private renderDebugSlider() {
    return (
      <div className="App-slider">
        <input
          type="range"
          min="0"
          max={c.values.MINUTES_IN_DAY - 1}
          value={getMinutesInDayFromDate(this.state.selectedDate, this.state.selectedTimezoneOffsetInMinutes)}
          onChange={this.onSliderChange}/>
      </div>
    );
  }

  private renderCities() {
    const {selectedCityId} = this.state;
    return (
      <div className="App-cities">
        {Object.keys(c.cities.CITIES).map((cityId) => {
          const city = c.cities.CITIES[cityId];
          const isSelected = Number(cityId) === selectedCityId;
          const classNameContainer = `App-citiesItem is-selected_${isSelected ? 'yes' : 'no'}`;
          const classNameControlButton = `App-citiesItemButton App-controlButton is-selected_${isSelected ? 'yes' : 'no'}`;
          return (
            <div className={classNameContainer} key={cityId}>
              <div
                className={classNameControlButton}
                data-city-id={cityId}
                onClick={this.onCityClick}
              >{city.name}</div>
            </div>
          );
        })}
      </div>
    )
  }

  private renderFutureButton() {
    const {isFutureAnimationRunning} = this.state;
    const className = `App-futureButton App-controlButton is-selected_${isFutureAnimationRunning ? 'yes' : 'no'}`;
    return (
      <div className="App-futureButtonContainer">
        <div
          className={className}
          onClick={this.onFutureButtonClick}>В будущее!</div>
      </div>
    );
  }

  private isAnimationRunning(): boolean {
    const {isTimezoneAnimationRunning, isFutureAnimationRunning} = this.state;
    return isTimezoneAnimationRunning || isFutureAnimationRunning;
  }

  private loadImages() {
    return Promise.all([
      this.loadImage(moonImg),
      this.loadImage(moonGlowImg),
      this.loadImage(sunImg),
      this.loadImage(sunGlowImg),
      this.loadImage(deathStarImg),
    ]).then((data: Array<HTMLImageElement>) => {
      this.moonImg = data[0];
      this.moonGlowImg = data[1];
      this.sunImg = data[2];
      this.sunGlowImg = data[3];
      this.deathStarImg = data[4];
    });
  }

  private loadImage(imgSrc): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.src = imgSrc;
    });
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

  private onCanvasRefSet = (el: HTMLCanvasElement) => {
    this.canvasElement = el;
  };

  private onSliderChange = (event: Event) => {
    const target = event.currentTarget;
    if (target instanceof HTMLInputElement) {
      const {selectedDate} = this.state;
      const newDate = new Date(selectedDate);
      newDate.setHours(0);
      newDate.setMinutes(parseInt(target.value, 10));
      this.setState({
        selectedDate: newDate,
      });
    }
  };

  private getCityName() {
    return c.cities.CITIES[this.state.selectedCityId].namePrepositional;
  }

  private getPhrase() {
    const {selectedDate, selectedTimezoneOffsetInMinutes} = this.state;
    return phraseService.getPhraseByDate(selectedDate, selectedTimezoneOffsetInMinutes);
  }

  private getPhraseMessage() {
    return (
      <div className="App-phraseMessage">В&nbsp;{this.getCityName()}<br /> время {this.getPhrase()}<br /></div>
    );
  }

  private renderCanvas() {
    canvasRenderer.render({
      ctx: this.canvasElement.getContext('2d'),
      deathStarImg: this.deathStarImg,
      sunImg: this.sunImg,
      sunGlowImg: this.sunGlowImg,
      moonImg: this.moonImg,
      moonGlowImg: this.moonGlowImg,
      windowWidth: this.state.windowWidth,
      windowHeight: this.state.windowHeight,
      selectedDate: this.state.selectedDate,
      initialDate: this.initialDate,
      selectedTimezoneOffsetInMinutes: this.state.selectedTimezoneOffsetInMinutes,
    });
  }

  private changeSelectedCityWithAnimation(newCityId: number): void {
    if (this.state.selectedCityId === newCityId) {
      return;
    }

    this.setState({
      selectedCityId: newCityId,
      isTimezoneAnimationRunning: true,
    }, () => {
      const data = {value: this.state.selectedTimezoneOffsetInMinutes};
      const newTimezoneInMinutes = c.cities.CITIES[newCityId].timezoneOffsetInMinutes;

      gsap.TweenLite.to(data, 2,{
        value: newTimezoneInMinutes,
        onUpdate: () => {
          this.setState({
            selectedTimezoneOffsetInMinutes: Math.round(data.value),
          });
        },
        onComplete: () => {
          this.setState({isTimezoneAnimationRunning: false});
        },
        ease: gsap.Quad.easeInOut,
      });
    });
  }

  private changeSelectedDateToFutureWithAnimation(): void {
    const {selectedDate} = this.state;

    const future = new Date(selectedDate);
    future.setDate(selectedDate.getDate() + 15);
    const data = {value: selectedDate.getTime()};

    this.setState({isFutureAnimationRunning: true}, () => {
      gsap.TweenLite.to(data, 5, {
        value: future.getTime(),
        onUpdate: () => {
          this.setState({
            selectedDate: new Date(data.value),
          });
        },
        onComplete: () => {
          this.setState({isFutureAnimationRunning: false});
        },
        ease: gsap.Quad.easeInOut
      });
    });
  }

  private onCityClick = (event: Event) => {
    if (this.isAnimationRunning()) {
      return;
    }

    const target = event.currentTarget;
    if (target instanceof HTMLElement) {
      const cityId = parseInt(target.getAttribute('data-city-id'), 10);
      this.changeSelectedCityWithAnimation(cityId);
    }
  };

  private onFutureButtonClick = () => {
    if (this.isAnimationRunning()) {
      return;
    }

    this.changeSelectedDateToFutureWithAnimation();
  };

  private runDateChecker(): void {
    setInterval(() => {
      if (this.isAnimationRunning()) {
        return;
      }
      const now = new Date();
      const newDate = new Date(this.state.selectedDate);
      newDate.setHours(now.getHours());
      newDate.setMinutes(now.getMinutes());
      this.setState({selectedDate: newDate});
    }, 10000);
  }
}

export default App;
