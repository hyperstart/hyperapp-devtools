import "./DebugPaneToolbar.scss";
import { State, Actions, Run } from "../api";
export interface DebugPaneToolbarProps {
    state: State;
    actions: Actions;
    runs: Run[];
}
export declare function DebugPaneToolbar(props: DebugPaneToolbarProps): JSX.Element;
