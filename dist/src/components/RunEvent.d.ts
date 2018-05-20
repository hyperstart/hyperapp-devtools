import "./RunEvent.scss";
import { State, Actions, Run, AppEvent } from "../api";
export interface RunEventProps {
    state: State;
    actions: Actions;
    run: Run;
    event: AppEvent;
    events: string[];
    indexInList: number;
}
export declare function RunEvent(props: RunEventProps): any;
