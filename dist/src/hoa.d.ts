import { ActionsType, View } from "hyperapp";
export declare const guid: () => any;
export interface App<State = any, Actions = any> {
    (state: State, actions: ActionsType<State, Actions>, view: View<State, Actions>, container: Element | null): Actions;
}
export declare function hoa<State, Actions>(app: App): App<State, Actions>;
export default hoa;
