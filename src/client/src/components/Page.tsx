import React from "react";

export default function Page(props: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"generic-background menhera-outline " + props.className}>
      {props.children}
    </div>
  );
}
