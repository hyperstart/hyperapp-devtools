import * as api from "../api";
export declare const toggleRun: (id: string) => (state: api.State) => {
    runsById: {
        [x: string]: api.Run;
    };
};
