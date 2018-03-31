import "./RunActionItem.scss";
import { State, Actions, AppAction } from "../api";
export interface RunActionItemProps {
    state: State;
    actions: Actions;
    array: AppAction[];
    index: number;
    action: AppAction;
}
export declare function RunActionItem(props: RunActionItemProps): any;
