const TOKEN_KEY = 'petique.token'
const ROLE_KEY = 'petique.role'

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const getRole = () => {
  return localStorage.getItem(ROLE_KEY) as 'owner' | 'vet' | null
}

export const setRole = (role: string) => {
  localStorage.setItem(ROLE_KEY, role)
}

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
}

export const isAuthenticated = () => !!getToken()
