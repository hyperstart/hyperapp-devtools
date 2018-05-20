import { State, Actions, Run } from "../api";
import "./RunEventList.scss";
export interface RunEventListProps {
    state: State;
    actions: Actions;
    run: Run;
    events: string[];
}
export declare function RunEventList(props: RunEventListProps): any;
