import React, { Component } from "react";
import Websocket from "react-websocket";

class Compra extends Component {
  constructor() {
    super();
    this.state = {
      count: 90,
      data: ""
    };
  }

  handleData(data) {
    //let result = JSON.parse(data);
    //this.setState({ count: this.state.count + result.movement });
    this.setState({ data: data });
  }

  render() {
    return (
      <div>
        Count: <strong>{this.state.count}</strong>
        <Websocket
          url="ws://localhost:5000"
          onMessage={this.handleData.bind(this)}
        />
        <p>{this.state.data}</p>
      </div>
    );
  }
}

export default Compra;
