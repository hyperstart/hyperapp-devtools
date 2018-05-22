import "./ObjectView.scss";
export interface ObjectViewProps {
    value: any;
    expanded(path: string, expanded?: boolean): boolean;
}
export declare function ObjectView(props: ObjectViewProps): JSX.Element;
