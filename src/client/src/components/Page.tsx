import React from "react";

export default function Page(props: {
  children: React.ReactNode;
  className?: string;
  tabs?: string[];
}) {
  let { tabs } = props;

  if (tabs == undefined) {
    tabs = [];
  }

  return (
    // <div className="page-container">
    /*{ <div className="page-tabs">
        {tabs.map((tab) => {
          return <a className="page-tab">{tab}</a>;
        })}
      </div> } */
    <div className={"generic-background " + props.className}>
      {props.children}
    </div>
    // </div>
  );
}
