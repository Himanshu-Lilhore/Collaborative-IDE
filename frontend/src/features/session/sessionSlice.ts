import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as types from '../../types';

const initialState: types.SessionState = {
    _id: '',
    sessionFileTree: { name: 'root', id: 'root', children: [] },
    participants: [],
    project: null,
    socketUser: 'default',
    trigger: (new Date()).toISOString(),
    language: 'html',
    currFile: { name: 'root', id: 'root', children: null },
};

export const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        setSession: (state, action: PayloadAction<Partial<types.SessionState>>) => {
            Object.assign(state, {
                ...action.payload,
                project: action.payload.project ? structuredClone(action.payload.project) : null,
                sessionFileTree: action.payload.sessionFileTree ? structuredClone(action.payload.sessionFileTree) : null,
            });
        },
        setSessionFileTree: (state, action: PayloadAction<any>) => {
            state.sessionFileTree = structuredClone(action.payload);
        },
        setSocketUser: (state, action: PayloadAction<string>) => {
            state.socketUser = action.payload;
        },
        setTrigger: (state) => {
            state.trigger = (new Date()).toISOString();
        },
        setLanguage: (state, action: PayloadAction<string>) => {
            state.language = action.payload;
        },
        setCurrFile: (state, action: PayloadAction<types.FileTreeNode>) => {
            state.currFile = action.payload;
        },
        setProject: (state, action: PayloadAction<types.Project>) => {
            state.project = structuredClone(action.payload);
        },
    },
});

export const {
    setSession,
    setSessionFileTree,
    setSocketUser,
    setTrigger,
    setLanguage,
    setCurrFile,
    setProject
} = sessionSlice.actions;

export default sessionSlice.reducer;
