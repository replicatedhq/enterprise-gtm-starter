import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import FileSaver from "file-saver";

const browserDownload = (filename, fileContents) => {
  const blob = new Blob([fileContents], {type: "text/plain;charset=utf-8"});
  FileSaver.saveAs(blob, filename);

}

function Form(title, introMarkdown, installMarkdown) {
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [buttonText, setButtonText] = useState("Request");
  const [submitted, setSubmitted] = useState(false);

  const handleClick = async () => {
    setButtonText("Working...");
    let response;
    try {
      response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          org: org,
          email: email,
        }),
      });
      setButtonText("Downloading...");
    } catch (e) {
      setError(e);
      setButtonText("Failed");
      return;
    }

    // aka sleep 2s
    await new Promise((res) => setTimeout(res, 1000))

    const body = await response.json();
    const downloadFileName = title.toLowerCase().replace(/[\W_]+/g,"-");
    await browserDownload(`${downloadFileName}.yaml`, body.license);

    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return <ReactMarkdown>{installMarkdown}</ReactMarkdown>;
  }

  return (
    <div className="Form-wrapper">
      <div className="sidebox">
        <ReactMarkdown>{introMarkdown}</ReactMarkdown>
      </div>
      <div className="Form">
        {error && <div className="Form-error">{error}</div>}
        <input
          placeholder="Your Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <input
          placeholder="Organization"
          value={org}
          onChange={(event) => setOrg(event.target.value)}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <div className="button-wrapper">
          <button onClick={(event) => handleClick()}>{buttonText}</button>
        </div>
      </div>
    </div>
  );
}

export default Form;
