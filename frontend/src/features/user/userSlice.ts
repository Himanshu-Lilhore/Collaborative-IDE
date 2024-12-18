import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as types from '../../types/index'

const initialState: types.User = {
    _id: '',
    fname: '',
    lname: '',
    email: '',
    username: '',
    bio: '',
    githubUsername: '',
    friends: [],
    projects: [],
    session: '',
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<types.User>) => {
            Object.assign(state, action.payload);
        },

        clearUser: (state) => {
            Object.assign(state, initialState);
        },

        updateUserField: <T extends keyof types.User>(
            state: types.User,
            action: PayloadAction<{ field: T; value: types.User[T] }>
        ) => {
            const { field, value } = action.payload;
            state[field] = value;
        },

        updateProject: (state,action: PayloadAction<types.Project>) => {
            state.projects = state.projects.filter(proj => (typeof proj !== 'string' && proj._id !== action.payload._id))
            state.projects.push(action.payload)
        }
    },
});

export const { setUser, clearUser, updateUserField, updateProject } = userSlice.actions;
export default userSlice.reducer;
