import "./ObjectDetailsPane.scss";
import { State, Actions } from "../api";
export interface ObjectDetailsPaneProps {
    state: State;
    actions: Actions;
}
export declare function ObjectDetailsPane(props: ObjectDetailsPaneProps): JSX.Element;
