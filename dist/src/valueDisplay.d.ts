import { AppEvent, StringMap, ValueDisplay } from "./api";
export declare const VALUE_DISPLAYS: StringMap<string[]>;
export declare function sanitizeValueDisplay(valueDisplay: ValueDisplay, event: AppEvent): ValueDisplay;
