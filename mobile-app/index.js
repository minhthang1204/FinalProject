/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native'
import App from './src/App'
import { name as appName } from './app.json'
import './src/Translations/i18n'
import 'react-native-gesture-handler'
import { configure } from 'mobx'
import { startNetworkLogging } from 'react-native-network-logger'

LogBox.ignoreLogs(['Require cycle:'])
if (__DEV__) {
  startNetworkLogging({ forceEnable: true, ignoredHosts: ['localhost'] })
}
AppRegistry.registerComponent(appName, () => App)
configure({
  useProxies: 'always',
  enforceActions: 'never',
})
