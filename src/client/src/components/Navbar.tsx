import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="navbar menhera-outline">
      <NavLink className={"navbar-button"} to={"/"}>
        home
      </NavLink>
      <NavLink className={"navbar-button"} to={"/projects"}>
        projects
      </NavLink>
      <NavLink className={"navbar-button"} to={"/blog"}>
        blog
      </NavLink>
      <NavLink className={"navbar-button"} to={"/trackers"}>
        trackers
      </NavLink>
    </div>
  );
}
