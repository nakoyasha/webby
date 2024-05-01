import React from "react";
import WIPFeature from "./Banners/WIPFeature";
import NavBar from "./Navbar";

export type LayoutProps = {
  isWIPFeature?: boolean;
  children: React.ReactNode;
};

export default function Layout(props: LayoutProps) {
  // import WipFeature from "./wipFeature.astro";
  // import NavBar from "./navbar.astro";
  const { isWIPFeature } = props;

  return (
    <div className="full-page gotham-font">
      <NavBar />
      {isWIPFeature && <WIPFeature />}
      {props.children}
    </div>
  );
}
