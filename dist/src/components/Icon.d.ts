import "./Icon.scss";
export declare type IconName = "caret-right" | "caret-bottom" | "cross" | "empty";
export interface IconProps {
    name: IconName;
    class?: string;
    onclick?: any;
}
export declare function Icon(props: IconProps): JSX.Element;
