import { State, Actions } from "./api";
import "./TogglePaneButton.scss";
export interface TogglePaneButtonProps {
    state: State;
    actions: Actions;
}
export declare function TogglePaneButton(props: TogglePaneButtonProps): JSX.Element;
