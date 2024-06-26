import { LinkSvg, SendSvg, ShareSvg, SmsSvg, WeChatSvg } from '@/Assets/Svg'
import { MessageType, mockUsers, Post, ShareType, Story, User } from '@/Models'
import { AppFonts, Colors, Layout, screenHeight, XStyleSheet } from '@/Theme'
import { getMediaUri, isAndroid, isIOS } from '@/Utils'
import { BottomSheetFlatList, TouchableOpacity } from '@gorhom/bottom-sheet'
import { useLocalObservable } from 'mobx-react-lite'
import React, { forwardRef, memo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, Share, View } from 'react-native'
import { AppInput, KeyboardSpacer, LoadingIndicator, Obx, Padding } from '.'
import AppBottomSheet from './AppBottomSheet'
import AppImage from './AppImage'
import AppText from './AppText'
import Box from './Box'
import Clipboard from '@react-native-clipboard/clipboard'
import { autorun, toJS } from 'mobx'
import { chatStore, userStore } from '@/Stores'
interface ShareBottomSheetProps {
  data: Post & Story
  type: ShareType
  onClose: () => void
}
const ShareBottomSheet = forwardRef(
  ({ data, onClose, type = ShareType.Post }: ShareBottomSheetProps, ref) => {
    const isPost: boolean = type === ShareType.Post
    const { t } = useTranslation()
    const state = useLocalObservable(() => ({
      users: [],
      message: '',
      loading: true,
      setLoading: (loading: boolean) => (state.loading = loading),
      setMessage: (message: string) => (state.message = message),
      setUsers: (users: User[]) => (state.users = users),
      setSent: (user_id: string) => {
        const u: any = state.users.find(u => u.user_id === user_id)
        if (u) {
          u.sent = true
        }
      },
    }))

    useEffect(() => {
      const dispose = autorun(() => {
        const users = toJS(chatStore.conversations)
          .map(c => c.user)
          .concat(toJS(userStore.following || []))
          .concat(toJS(userStore.followers || []))
        const obj = {}
        const recommendedUsers = []
        users.map(u => {
          if (!obj[u.user_id]) {
            obj[u.user_id] = true
            recommendedUsers.push(u)
          }
        })
        state.setUsers(recommendedUsers)
      })
      const to = setTimeout(() => {
        state.setLoading(false)
      }, 1000)
      return () => {
        clearTimeout(to)
        dispose()
      }
    }, [])

    const renderUserItem = useCallback(({ item, index }) => {
      const onSendPress = () => {
        state.setSent(item.user_id)
        const msg = {
          message: toJS(state.message),
          type: type === ShareType.Post ? MessageType.Post : MessageType.Story,
          ref_id: type === ShareType.Post ? data.post_id : data.story_id,
        }
        chatStore.sendNewMessage(item.user_id, msg)
      }
      return (
        <Box paddingVertical={8} paddingHorizontal={16} row align="center">
          <AppImage
            source={{
              uri: getMediaUri(item.avatar_url),
            }}
            containerStyle={styles.avatarImg}
          />
          <Padding style={Layout.fill} left={12}>
            <AppText fontWeight={700}>{item.full_name}</AppText>
            <Padding top={2} />
            <AppText color={Colors.black50}>{item.user_name}</AppText>
          </Padding>
          <Obx>
            {() => (
              <TouchableOpacity
                disabled={item.sent}
                style={[
                  styles.sendBtn,
                  item.sent && { backgroundColor: Colors.disabled },
                ]}
                onPress={onSendPress}
              >
                <AppText color={Colors.white}>
                  {item.sent ? t('sent') : t('send')}
                </AppText>
                <Padding left={6} />
                <SendSvg color={Colors.white} size={12} />
              </TouchableOpacity>
            )}
          </Obx>
        </Box>
      )
    }, [])

    const _onClose = useCallback(() => {
      Keyboard.dismiss()
      onClose && onClose()
    }, [])

    return (
      <AppBottomSheet
        onClose={_onClose}
        index={0}
        snapPoints={[screenHeight - 100]}
        backgroundStyle={{ opacity: 0 }}
        handleIndicatorStyle={{ backgroundColor: Colors.white50 }}
        ref={ref}
      >
        <Box
          topLeftRadius={16}
          topRightRadius={16}
          fill
          backgroundColor={Colors.white}
        >
          <View style={styles.messageView}>
            <AppImage
              source={{ uri: getMediaUri(data.medias[0].url) }}
              containerStyle={styles.referralImage}
            />
            <Obx>
              {() => (
                <AppInput
                  placeholder={t('message_placeholder')}
                  style={styles.textInput}
                  value={state.message}
                  onChangeText={txt => state.setMessage(txt)}
                  multiline
                  lineHeight={16}
                  autoCorrect={false}
                />
              )}
            </Obx>
          </View>
          <Obx>
            {() =>
              state.loading ? (
                <Box center fill>
                  <LoadingIndicator />
                </Box>
              ) : (
                <BottomSheetFlatList
                  data={state.users.slice()}
                  keyExtractor={item => item.user_id}
                  renderItem={renderUserItem}
                />
              )
            }
          </Obx>
          <View style={styles.otherOptionsView}>
            <TouchableOpacity
              onPress={() => {
                Share.share({
                  title: 'Share via',
                  message: isPost
                    ? 'https://xgram.app/post/' + data.post_id
                    : 'https://xgram.app/story/' + data.story_id,
                })
              }}
              style={styles.shareBtn}
            >
              <Box
                marginBottom={10}
                size={60}
                radius={99}
                backgroundColor={Colors.border}
                center
              >
                <ShareSvg />
              </Box>
              <AppText align="center" color={Colors.black75} fontWeight={700}>
                {t('home.share_to')}
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Clipboard.setString(
                  isPost
                    ? 'https://xgram.app/post/' + data.post_id
                    : 'https://xgram.app/story/' + data.story_id,
                )
              }}
              style={styles.shareBtn}
            >
              <Box
                marginBottom={10}
                size={60}
                radius={99}
                backgroundColor={Colors.border}
                center
              >
                <LinkSvg />
              </Box>
              <AppText align="center" color={Colors.black75} fontWeight={700}>
                {t('home.copy_link')}
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn}>
              <Box
                marginBottom={10}
                size={60}
                radius={99}
                backgroundColor={Colors.border}
                center
              >
                <WeChatSvg size={34} />
              </Box>
              <AppText align="center" color={Colors.black75} fontWeight={700}>
                {t('home.we_chat')}
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn}>
              <Box
                marginBottom={10}
                size={60}
                radius={99}
                backgroundColor={Colors.border}
                center
              >
                <SmsSvg />
              </Box>
              <AppText align="center" color={Colors.black75} fontWeight={700}>
                {t('home.sms')}
              </AppText>
            </TouchableOpacity>
          </View>
        </Box>
        {isIOS && <KeyboardSpacer />}
      </AppBottomSheet>
    )
  },
)

export default memo(ShareBottomSheet)

const styles = XStyleSheet.create({
  headerView: {
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  photoBtn: {
    height: 36,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 99,
  },
  textInput: {
    fontFamily: AppFonts['400'],
    color: Colors.black,
    flex: 1,
    paddingHorizontal: 10,
    ...(isAndroid && {
      marginVertical: -15,
    }),
    maxHeight: 70,
  },
  messageView: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomColor: Colors.border,
    borderBottomWidth: 0.5,
    paddingHorizontal: 16,
  },
  referralImage: {
    height: 50,
    width: 50,
    borderRadius: 5,
    overflow: 'hidden',
  },
  otherOptionsView: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: 16,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shareBtn: {
    marginHorizontal: 10,
  },
  avatarImg: {
    height: 50,
    width: 50,
    borderRadius: 99,
    overflow: 'hidden',
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
})
