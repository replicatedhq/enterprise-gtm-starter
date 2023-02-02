import { useEffect, useState } from "react";
import "./App.css";
import Form from "./Form";

const Loading = () => (
  <div
    className="App"
    style={{ padding: "100px", fontWeight: "lighter", fontSize: "96px" }}
  >
    Loading...
  </div>
);

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
      {!config && Loading()}
      <div>
        <div>
          <h1>{config.title}</h1>
          <section className="container">
            {Form(config.title, config.introMarkdown, config.installMarkdown)}
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
