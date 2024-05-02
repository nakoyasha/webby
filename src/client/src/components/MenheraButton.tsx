import { NavLink } from "react-router-dom";

export type MenheraButtonProps = {
  text: string;
  href?: string;
  smol?: boolean;
};

export default function MenheraButton(props: MenheraButtonProps) {
  const isSmol = props.smol ? "make-button-smol" : "";
  return (
    <div className={"menhera-button " + isSmol}>
      <NavLink to={props.href || "/"}>{props.text} </NavLink>
    </div>
  );
}
