import { ActionEvent } from "./api";
export interface OnAction {
    (call: ActionEvent): void;
}
export declare function enhanceActions(onAction: OnAction, runId: string, actions: any, prefix?: string): any;
export default enhanceActions;
