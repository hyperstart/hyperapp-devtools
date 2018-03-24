import { State, Actions } from "./api";
export interface DebugPaneProps {
    state: State;
    actions: Actions;
}
export declare function DebugPane(props: DebugPaneProps): JSX.Element;
