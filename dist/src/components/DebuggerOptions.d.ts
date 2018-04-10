import "./DebuggerOptions.scss";
import { State, Actions } from "../api";
export interface DebuggerOptionsProps {
    state: State;
    actions: Actions;
}
export declare function DebuggerOptions(props: DebuggerOptionsProps): JSX.Element;
