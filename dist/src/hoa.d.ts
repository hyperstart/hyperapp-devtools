export declare const guid: () => any;
export interface View {
    (state: any, actions: any): any;
}
export interface HypperApp {
    (state: any, actions: any, view: View, container: Element | null): any;
}
export declare function hoa<App extends HypperApp>(app: App): App;
export default hoa;
