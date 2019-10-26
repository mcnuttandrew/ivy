import React from 'react';

export default class Header extends React.Component {
  render() {
    return (
      <div className="header flex full-width background-1">
        <img
          src="./logo.png"
          alt="logo showing a chart inside of a warning symbol"
        />
        <div>Untitled Data Exploration Experience</div>
      </div>
    );
  }
}
