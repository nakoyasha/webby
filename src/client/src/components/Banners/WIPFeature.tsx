import { useState } from "react";

export default function WIPFeature() {
  const [visible, setVisible] = useState(true);

  if (visible) {
    return (
      <div id="wip-feature" className="wip-feature menhera-outline">
        ⚠️ This is a work in progress feature and it may break at any point.
        <a
          className="wip-feature-close-button"
          onClick={() => {
            setVisible(false);
          }}
        ></a>
      </div>
    );
  }
}
