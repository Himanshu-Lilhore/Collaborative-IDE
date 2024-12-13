import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as types from '../../types/index'

const initialState: types.User = {
    fname: '',
    lname: '',
    email: '',
    username: '',
    bio: '',
    githubUsername: '',
    friends: [],
    projects: [],
    session: '',
    isLoggedIn: false,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<Omit<types.User, 'isLoggedIn'>>) => {
            Object.assign(state, action.payload, { isLoggedIn: true });
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


        addFriend: (state, action: PayloadAction<string>) => {
            state.friends.push(action.payload);
        },

        addProject: (state, action: PayloadAction<string>) => {
            state.projects.push(action.payload);
        },
    },
});

export const { setUser, clearUser, updateUserField, addFriend, addProject } = userSlice.actions;
export default userSlice.reducer;
