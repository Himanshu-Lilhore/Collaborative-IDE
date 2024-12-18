import {configureStore} from '@reduxjs/toolkit'
import userReducer from '../features/user/userSlice'
import sessionReducer from '../features/session/sessionSlice'

export const store = configureStore({
    reducer: {userStore: userReducer, sessionStore: sessionReducer}
})