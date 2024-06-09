import { Method, request } from '../Axios'
import Endpoint from '../Endpoint'

export const login = data => request(Endpoint().login, Method.POST, data)

export const register = data => request(Endpoint().register, Method.POST, data)
console.log("register", Endpoint().register)

export const resetPassword = data =>
  request(Endpoint().resetPassword, Method.POST, data)

export const logout = () => request(Endpoint().logout, Method.POST)
