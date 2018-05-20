import "./DebugPaneToolbar.scss";
import { State, Actions } from "../api";
export interface DebugPaneToolbarProps {
    state: State;
    actions: Actions;
}
export declare function DebugPaneToolbar(props: DebugPaneToolbarProps): JSX.Element;
