import { State, Actions } from "./api";
export interface DebugPaneProps {
    state: State;
    actions: Actions;
    style?: any;
}
export declare function DebugPane(props: DebugPaneProps): JSX.Element;
