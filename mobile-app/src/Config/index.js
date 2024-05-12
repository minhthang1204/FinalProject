export { PageName } from './PageName'
export const EnvType = {
  STG: 0,
  DEV: 1,
  PROD: 2,
  GIT: 3,
}
export const APP_ENV = EnvType.DEV

export const CommonConfig = {
  ...ProdConfig,
}

export const StgConfig = {
  API_URL: '',
  BASE_URL: '',
  BASE_API: '',
  SOCKET_URL: '',
}
export const DevConfig = {
  API_URL: 'localhost:8080',
  BASE_URL: 'localhost:8080',
  BASE_API: 'localhost:8080',
  SOCKET_URL: 'localhost:8080',
}
export const ProdConfig = {
  API_URL: '',
  BASE_URL: '',
  BASE_API: '',
  SOCKET_URL: '',
}
//Mixed Config
export const Config = {
  ...CommonConfig,
  ...(APP_ENV === EnvType.DEV && DevConfig),
  ...(APP_ENV === EnvType.STG && StgConfig),
  ...(APP_ENV === EnvType.PROD && ProdConfig),
}
