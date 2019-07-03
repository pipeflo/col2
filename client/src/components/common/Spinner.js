import React from "react";
import spinner from "./spinner.gif";

export default function Spinner() {
  return (
    <div>
      <img
        src={spinner}
        alt="Cargando..."
        style={{
          width: "300px",
          height: "300px",
          position: "absolute",
          left: "35%",
          top: "50%",
          margin: "auto",
          display: "block"
        }}
      />
    </div>
  );
}
