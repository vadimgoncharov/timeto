import * as React from 'react';
import * as WebFont from 'webfontloader';

import './MainPage.scss';

class App extends React.Component {
  componentDidMount() {
    WebFont.load({
      custom: {
        families: ['Neucha']
      }
    });
  }

  getCityName() {
    return 'Подольске';
  }

  getPhrase() {
    return 'трясти булками';
  }

  getTimeMessage() {
    return `В ${this.getCityName()} время ${this.getPhrase()}`;
  }

  render() {
    return (
      <div className="App">
        {this.getTimeMessage()}
        <div className="moon"></div>
      </div>
    )
  }
}

export default App;
