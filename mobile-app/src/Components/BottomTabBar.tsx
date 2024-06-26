import { HeartSvg, HomeSvg, PlusCircleSvg, SearchSvg } from '@/Assets/Svg'
import { PageName } from '@/Config'
import { navigate } from '@/Navigators'
import { userStore } from '@/Stores'
import { Colors, Layout, XStyleSheet } from '@/Theme'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import React, { useCallback, useMemo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { getMediaUri } from '@/Utils'
import { AppImage, CreateButton, Obx, Padding } from '.'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const BottomTabBar = ({ state }: BottomTabBarProps) => {
  const tabBars = useMemo(
    () => [
      {
        name: 'Home',
        icon: HomeSvg,
        routeName: PageName.HomeStack,
        index: 0,
      },
      {
        name: 'Search',
        icon: SearchSvg,
        routeName: PageName.SearchScreen,
        index: 1,
      },
      {
        name: 'Create',
        icon: PlusCircleSvg,
      },
      {
        name: 'Notification',
        icon: HeartSvg,
        routeName: PageName.NotificationScreen,
        index: 2,
      },
      {
        name: 'Profile',
        icon: ({ color, ...restProps }) => (
          <Obx>
            {() => (
              <AppImage
                {...restProps}
                containerStyle={[styles.avatar, { borderColor: color }]}
                source={{
                  uri: getMediaUri(userStore?.userInfo?.avatar_url),
                }}
              />
            )}
          </Obx>
        ),
        routeName: PageName.ProfileScreen,
        index: 3,
      },
    ],
    [],
  )
  const renderTabItem = useCallback(
    tab => {
      return (
        <React.Fragment key={tab.name}>
          {tab.name !== 'Create' ? (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[Layout.fill, Layout.center]}
              onPress={() => navigate(tab.routeName)}
            >
              <tab.icon
                onPress={() => navigate(tab.routeName)}
                size={24}
                color={
                  tab.index === state.index ? Colors.primary : Colors.white
                }
              />
            </TouchableOpacity>
          ) : (
            <Padding horizontal={16}>
              <CreateButton />
            </Padding>
          )}
        </React.Fragment>
      )
    },
    [state.index],
  )
  const { bottom } = useSafeAreaInsets()
  return (
    <View style={styles.rootView}>
      <View
        style={[
          styles.tabBarView,
          {
            height: 80 + (bottom > 0 ? 10 : 0),
          },
        ]}
      >
        {tabBars.map(renderTabItem)}
      </View>
    </View>
  )
}

export default BottomTabBar

const styles = XStyleSheet.create({
  rootView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.kFF7A51,
    zIndex: 99,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  tabBarView: {
    flexDirection: 'row',
    height: 80,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  createBtn: {
    marginBottom: 50,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 99,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
})
