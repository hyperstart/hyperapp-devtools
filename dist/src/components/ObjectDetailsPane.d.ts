import { State, Actions } from "../api";
import "./ObjectDetailsPane.scss";
export interface ObjectDetailsPaneProps {
    state: State;
    actions: Actions;
}
export declare function ObjectDetailsPane(props: ObjectDetailsPaneProps): JSX.Element;
