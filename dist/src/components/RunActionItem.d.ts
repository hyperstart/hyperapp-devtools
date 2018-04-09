import "./RunActionItem.scss";
import { State, Actions, AppAction, Run } from "../api";
export interface RunActionItemProps {
    state: State;
    actions: Actions;
    run: Run;
    actionList: AppAction[];
    indexInList: number;
    action: AppAction;
    path: number[];
}
export declare function RunActionItem(props: RunActionItemProps): any;
