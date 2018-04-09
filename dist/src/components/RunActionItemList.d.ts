import "./RunActionItemList.scss";
import { State, Actions, AppAction, Run } from "../api";
export interface RunActionItemListProps {
    state: State;
    actions: Actions;
    run: Run;
    actionList: AppAction[];
    collapsed: boolean;
    path: number[];
}
export declare function RunActionItemList(props: RunActionItemListProps): any;
