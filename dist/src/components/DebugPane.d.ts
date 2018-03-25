import { State, Actions } from "../api";
import "./DebugPane.scss";
export interface DebugPaneProps {
    state: State;
    actions: Actions;
}
export declare function DebugPane(props: DebugPaneProps): JSX.Element;
