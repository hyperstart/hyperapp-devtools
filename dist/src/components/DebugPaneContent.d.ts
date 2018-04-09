import "./DebugPaneContent.scss";
import { State, Actions, Run } from "../api";
export interface DebugPaneContentProps {
    state: State;
    actions: Actions;
    runs: Run[];
}
export declare function DebugPaneContent(props: DebugPaneContentProps): JSX.Element;
