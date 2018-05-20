import { Actions } from "./api";
export interface View {
    (state: any, actions: any): any;
}
export interface HypperApp {
    (state: any, actions: any, view: View, container: Element | null): any;
}
export declare function getDevtoolsApp(): Actions;
export declare function devtools<App extends HypperApp>(app: App): App;
export default devtools;
