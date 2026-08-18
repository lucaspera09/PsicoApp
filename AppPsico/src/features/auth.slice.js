import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from '../api/api.js'

const tokenGuardado = localStorage.getItem('token')

const initialState = {
  user: null,
  token: tokenGuardado,
  loading: false,
  error: null,
  initialized: false
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post(
        '/auth/login',
        credentials
      )

      localStorage.setItem(
        'token',
        response.data.token
      )

      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        'No se pudo iniciar sesión'
      )
    }
  }
)

export const loadCurrentUser = createAsyncThunk(
  'auth/loadCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me')

      return response.data
    } catch (error) {
      localStorage.removeItem('token')

      return rejectWithValue(
        error.response?.data?.message ||
        'No se pudo recuperar la sesión'
      )
    }
  }
)

const authSlice = createSlice({
  name: 'auth',

  initialState,

  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.error = null

      localStorage.removeItem('token')
    },

    clearAuthError: (state) => {
      state.error = null
    }
  },

  extraReducers: (builder) => {
    builder

      // LOGIN

      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })

      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.user = action.payload.user
        state.initialized = true
      })

      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // CARGAR USUARIO ACTUAL

      .addCase(loadCurrentUser.pending, (state) => {
        state.loading = true
      })

      .addCase(
        loadCurrentUser.fulfilled,
        (state, action) => {
          state.loading = false
          state.user = action.payload
          state.initialized = true
        }
      )

      .addCase(
        loadCurrentUser.rejected,
        (state, action) => {
          state.loading = false
          state.user = null
          state.token = null
          state.initialized = true
          state.error = action.payload
        }
      )
  }
})

export const {
  logout,
  clearAuthError
} = authSlice.actions

export default authSlice.reducer