import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as types from '../../types';


const initialState: types.SessionState = {
    _id: '',
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
            Object.assign(state, action.payload);
        },
        setFileTree: (state, action: PayloadAction<any>) => {
            if(state.project) state.project.fileTree = action.payload;
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
            state.project = action.payload;
        },
    },
});

export const { 
    setSession, 
    setFileTree, 
    setSocketUser, 
    setTrigger, 
    setLanguage, 
    setCurrFile,
    setProject
} = sessionSlice.actions;

export default sessionSlice.reducer;
