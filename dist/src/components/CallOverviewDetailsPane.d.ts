import { State, Actions, ActionEvent, FunctionEvent } from "../api";
import "./CallOverviewDetailsPane.scss";
export interface CallOverviewDetailsPaneProps {
    state: State;
    actions: Actions;
    event: ActionEvent | FunctionEvent;
}
export declare function CallOverviewDetailsPane(props: CallOverviewDetailsPaneProps): JSX.Element;
