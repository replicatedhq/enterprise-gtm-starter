import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

function Form(introMarkdown, installMarkdown) {
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [buttonText, setButtonText] = useState("Request");
  const [submitted, setSubmitted] = useState(false);

  const handleClick = async () => {
    setButtonText("Working...");
    try {
      await fetch("/api/submit", {
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
      setButtonText("Success");
      setTimeout(() => {
        setSubmitted(true);
      }, 1000);
    } catch (e) {
      setError(e);
      setButtonText("Failed");
    }
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
