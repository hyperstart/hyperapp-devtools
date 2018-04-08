import { ActionsType } from "hyperapp";
export declare const guid: () => any;
export interface View<AppState = any, AppActions = any> {
    (state: AppState, actions: AppActions): any;
}
export interface App<AppState = any, AppActions = any> {
    (state: AppState, actions: ActionsType<AppState, AppActions>, view: View<AppState, AppActions>, container: Element | null): AppActions;
}
export declare function hoa<AppState, AppActions>(app: App): App<AppState, AppActions>;
export default hoa;
