import { useState } from "react";

export type BuildFeatureProps = {
  title: string;
  children: React.ReactNode;
};

export default function BuildFeature(props: BuildFeatureProps) {
  const [visible, setVisible] = useState(true);

  return (
    <div className="build-feature">
      <div className="build-feature-top">
        <h2>
          <b>{props.title}</b>
        </h2>
        <button
          className="menhera-button"
          id="strings-button"
          onClick={() => setVisible(!visible)}
        >
          {visible == false ? "Show" : "Hide"}
        </button>
      </div>

      {visible ? props.children : null}
    </div>
  );
}
