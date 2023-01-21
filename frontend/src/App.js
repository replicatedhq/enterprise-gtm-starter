import { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

function App() {
  const [config, setConfig] = useState("");
  useEffect(() => {
    const url = "/api/config";

    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const json = await response.json();
        setConfig(json);
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <p>{config}</p>
      </header>
    </div>
  );
}

export default App;
