import React, {Component} from "react";
import * as FileSaver from "file-saver";

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      done: false,
      email: "",
      error: false,
      errorMessage: "",
      loading: false,
      name: "",
      org: "",
    }
  }

  async handleClick() {
    this.setState({
      done: false,
      loading: true,
    });

    const {name, email, org} = this.state;

    try {
      const resp = await fetch(`${this.props.gtmAPIBaseURL}/signup`, {
        body: JSON.stringify({name, org, email}),
        headers: {
          "content-type": "application/json"
        },
        method: "POST",
      });

      const body = await resp.json();
      if (resp.status === 200) {
        const downloadFileName = this.props.title.toLowerCase().replace(/[\W_]+/g,"-");
        await this.browserDownload(`${downloadFileName}.rli`, body.license);
        this.setState({
          done: true,
          loading: false,
        });
        return;
      }

      this.setState({
        error: true,
        errorMessage: body.error.message || "Something is not working right, please try again in a few minutes.",
        loading: false,
      });
      setTimeout(() => {
        this.setState({error: false, errorMessage: ""})
      }, 3000)
    } catch (err) {
      //tslint:disable-next-line
      console.log(err);
      this.setState({
        error: true,
        errorMessage: err.message,
        loading: false,
      });

      setTimeout(() => {
        this.setState({error: false, errorMessage: ""})
      }, 3000)
    }


  }

  async browserDownload(filename, text) {
    const blob = new Blob([text], {type: "text/plain;charset=utf-8"});
    FileSaver.saveAs(blob, filename);
  }

  render() {
    let buttonLabel = "Start Free Trial";
    let buttonExtra = {};

    if (this.state.loading) {
      buttonExtra = {disabled: true};
      buttonLabel = "Requesting";
    } else if (this.state.done) {
      return this.props.onSubmitFinished;
    }

    return (
      <div className="Form-wrapper">
        {this.props.sidebox}
        <div className="Form">
          {this.state.error &&
            <div className="Form-error">{this.state.errorMessage}</div>
          }
          <input
            placeholder="Your Name"
            onChange={(event) => this.setState({name: event.target.value})}
          />
          <input
            placeholder="Organization"
            onChange={(event) => this.setState({org: event.target.value})}
          />
          <input
            placeholder="Email"
            onChange={(event) => this.setState({email: event.target.value})}
          />
          <div className="button-wrapper">
            <button
              {...buttonExtra}
              onClick={(event) => this.handleClick(event)}
            >
              {buttonLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export {Form};