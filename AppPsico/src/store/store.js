import { configureStore } from '@reduxjs/toolkit'

import authReducer from '../features/auth.slice.js'

export const store = configureStore({
  reducer: {
    auth: authReducer
  }
})