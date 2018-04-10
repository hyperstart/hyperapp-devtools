import "./RunsPaneItem.scss";
import { State, Actions, Run } from "../api";
export interface RunsPaneItemProps {
    state: State;
    actions: Actions;
    run: Run;
    current: boolean;
}
export declare function RunsPaneItem(props: RunsPaneItemProps): JSX.Element;
