import "./DebugPaneContent.scss";
import { State, Actions } from "../api";
export interface DebugPaneContentProps {
    state: State;
    actions: Actions;
}
export declare function DebugPaneContent(props: DebugPaneContentProps): JSX.Element;
