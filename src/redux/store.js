import { configureStore } from "@reduxjs/toolkit"
import loaderSlice from "./loaderSlice"
import userSlice from "./userSlice"

export const store = configureStore({
    reducer: {
        loader: loaderSlice.reducer,
        user: userSlice.reducer
    },
})

export default store