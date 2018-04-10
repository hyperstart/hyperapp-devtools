import "./RunsPane.scss";
import { State, Actions, Run } from "../api";
export interface RunsPaneProps {
    state: State;
    actions: Actions;
    runs: Run[];
}
export declare function RunsPane(props: RunsPaneProps): JSX.Element;
