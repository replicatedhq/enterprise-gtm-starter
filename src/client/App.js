import React, {Component} from "react";
import Markdown from "react-markdown";
import './App.css';
import {Form} from "./Form";

const apiBaseURL = "/api/v1";

class App extends Component {
  // login props:
  // API URL
  // Fields
  // OnSubmitFinished
  constructor(props) {
    super(props);

    this.state = {
      installMarkdown: "",
      introMarkdown: "",
      loaded: false,
      title: "",
    }
  }

  async componentWillMount() {
    try {
      await this.fetchConfig();
    } catch (err) {
      //tslint:disable-next-line
      console.log(err);
      setTimeout(() => this.fetchConfig(), 1000)
    }
  }

  async fetchConfig() {
    const resp = await fetch(`${apiBaseURL}/config`, {
      headers: {
        "content-type": "application/json"
      },
      method: "GET",
    });

    if (resp.status === 200) {
      const body = await resp.json();
      this.setState({
        installMarkdown: body.installMarkdown,
        introMarkdown: body.introMarkdown,
        loaded: true,
        title: body.title,
      });
    }
  }

  render() {
    if (!this.state.loaded) {
      return (
        <div className="App" style={{padding: "100px", fontWeight: "lighter", fontSize: "96px"}}>
          Loading...
        </div>
      )
    }

    return (
      <div className="App">
        <div>
          <div>
            <h1>{this.state.title}</h1>
            <section className={"container"}>
              <Form
                gtmAPIBaseURL={apiBaseURL}
                sidebox={(<div className="sidebox"><Markdown source={this.state.introMarkdown}/></div>)}
                onSubmit={(<div className="install"><Markdown source={this.state.installMarkdown}/></div>)}

              />
            </section>
          </div>
        </div>
      </div>
    );
  }

}

export default App;
