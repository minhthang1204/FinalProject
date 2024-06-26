import {
  CommentSvg,
  DotsSvg,
  FullScreenSvg,
  GlobalSvg,
  HeartSvg,
  LockSvg,
  PeopleSvg,
  SendSvg,
  StoryGradientBorderSvg,
} from '@/Assets/Svg'
import { Post, PrivacyType } from '@/Models'
import { navigateToProfile } from '@/Navigators'
import { isReactedPost, reactRequest, userStore } from '@/Stores'
import {
  Colors,
  Layout,
  ResponsiveHeight,
  ResponsiveWidth,
  XStyleSheet,
  moderateScale,
  screenWidth,
} from '@/Theme'
import { formatAmount, getMediaUri } from '@/Utils'
import { autorun } from 'mobx'
import { useLocalObservable } from 'mobx-react-lite'
import moment from 'moment'
import React, { memo, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import Animated, {
  BounceIn,
  SharedValue,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import Video from 'react-native-video'
import { Expanded, Obx, Row } from '.'
import AppImage from './AppImage'
import AppText from './AppText'
import Box from './Box'
import Padding from './Padding'
interface PostItemProps {
  onCommentPress?: () => void
  onSharePress?: () => void
  onOptionPress?: () => void
  onPress?: () => void
  post: Post
  showDetail?: boolean
  preview?: boolean
}
const PostItem = ({
  post,
  onCommentPress,
  onSharePress,
  onOptionPress,
  onPress,
  showDetail = false,
  preview = false,
}: PostItemProps) => {
  const reactAnim = useSharedValue(0)
  const pageAnim = useSharedValue(0)
  const { t } = useTranslation()
  const state = useLocalObservable(() => ({
    imageIndex: 0,
    setImageIndex: (index: number) => (state.imageIndex = index),
    fullscreen: false,
    setFullscreen: (value: boolean) => (state.fullscreen = value),
  }))
  useEffect(() => {
    if (post.medias.length > 1) {
      FastImage.preload(
        post.medias
          .slice(1, 999)
          .filter(m => !m.is_video)
          .map((item: any) => ({ uri: item.url, priority: 'low' })),
      )
    }
    const disposeReaction = autorun(() => {
      const isReacted = isReactedPost(post.post_id)
      if (isReacted) {
        reactAnim.value = withTiming(1)
      } else {
        reactAnim.value = withTiming(0)
      }
    })
    return () => {
      disposeReaction()
    }
  }, [])

  const onImagePress = useCallback(() => {
    if (state.imageIndex < post.medias.length - 1) {
      state.setImageIndex(state.imageIndex + 1)
      pageAnim.value = withTiming(state.imageIndex)
    } else {
      state.setImageIndex(0)
      pageAnim.value = withTiming(0)
    }
  }, [post.medias.length])

  const renderIndicatorItem = useCallback((_, index) => {
    return <IndicatorItem pageAnim={pageAnim} key={index} index={index} />
  }, [])
  const onMentionPress = useCallback(userId => {
    navigateToProfile(userId)
  }, [])
  const reactButtonStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      reactAnim.value,
      [0, 1],
      [Colors.white50, Colors.kFB2576],
    ),
  }))
  return (
    <Box marginHorizontal={16} marginTop={16}>
      <View style={styles.rootView}>
        <Obx>
          {() =>
            post?.medias?.[state.imageIndex]?.is_video ? (
              <Obx>
                {() => (
                  <Video
                    source={{
                      uri: preview
                        ? post.medias[state.imageIndex].url
                        : getMediaUri(post.medias[state.imageIndex].url),
                    }}
                    style={styles.imageContainer}
                    resizeMode="cover"
                    fullscreenOrientation="portrait"
                    fullscreen={state.fullscreen}
                    onVideoFullscreenPlayerDidDismiss={() =>
                      state.setFullscreen(false)
                    }
                    muted
                  />
                )}
              </Obx>
            ) : (
              <AppImage
                enablePinchZoom
                onPress={onImagePress}
                onLongPress={onOptionPress}
                source={{
                  uri: preview
                    ? post.medias[state.imageIndex].url
                    : getMediaUri(post.medias[state.imageIndex].url),
                }}
                containerStyle={styles.imageContainer}
              />
            )
          }
        </Obx>
        {post.medias.length > 1 && (
          <View style={styles.indicatorView}>
            {post.medias.map(renderIndicatorItem)}
          </View>
        )}
        <Obx>
          {() =>
            post.medias[state.imageIndex].is_video && (
              <TouchableOpacity
                onPress={() => state.setFullscreen(true)}
                style={styles.fullscreenBtn}
              >
                <FullScreenSvg color={Colors.primary50} size={18} />
              </TouchableOpacity>
            )
          }
        </Obx>
        <Box padding={16} row align="center" justify="space-between">
          <Box row align="center">
            <View style={styles.avatarView}>
              <StoryGradientBorderSvg size={66} />
              <AppImage
                containerStyle={styles.avatarImg}
                source={{
                  uri: getMediaUri(post.posted_by.avatar_url),
                }}
              />
            </View>
            <Padding left={16} />
            <View>
              <AppText
                color={Colors.white}
                fontSize={16}
                lineHeight={23}
                fontWeight={400}
              >
                {post.posted_by.full_name}
              </AppText>

              <Row>
                {!preview && (
                  <>
                    <Obx>
                      {() =>
                        post.privacy === PrivacyType.Public ? (
                          <GlobalSvg size={12} color={Colors.white50} />
                        ) : post.privacy === PrivacyType.Followers ? (
                          <PeopleSvg size={12} color={Colors.white50} />
                        ) : (
                          <LockSvg size={12} color={Colors.white50} />
                        )
                      }
                    </Obx>
                    <AppText fontSize={6} color={Colors.white50}>
                      {'   '}•{'   '}
                    </AppText>
                  </>
                )}
                <AppText fontSize={12} color={Colors.white50}>
                  {moment(post.created_at).fromNow()}
                </AppText>
              </Row>
            </View>
          </Box>
          {!preview && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onOptionPress}
              style={styles.optionBtn}
            >
              <DotsSvg color={Colors.white} />
            </TouchableOpacity>
          )}
        </Box>
        {!preview && (
          <View style={styles.sideBarView}>
            <TouchableOpacity onPress={onSharePress} style={styles.sideBarBtn}>
              <SendSvg color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onCommentPress}
              style={styles.sideBarBtn}
            >
              <CommentSvg color={Colors.white} />
              <Padding top={4} />
              <Obx>
                {() => (
                  <AppText fontWeight={700} color={Colors.white}>
                    {formatAmount(post.comments.length)}
                  </AppText>
                )}
              </Obx>
            </TouchableOpacity>
            <Obx>
              {() => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    reactRequest(post.post_id, isReactedPost(post.post_id))
                  }
                  style={[styles.reactBtn]}
                >
                  <Animated.View
                    style={[Layout.fill, Layout.center, reactButtonStyle]}
                  >
                    <Obx>
                      {() => (
                        <Animated.View
                          key={`${isReactedPost(post.post_id)}`}
                          entering={BounceIn}
                        >
                          <HeartSvg color={Colors.white} />
                        </Animated.View>
                      )}
                    </Obx>
                    <Padding top={4} />
                    <AppText fontWeight={700} color={Colors.white}>
                      <Obx>
                        {() => formatAmount(post.reactions.length) as any}
                      </Obx>
                    </AppText>
                  </Animated.View>
                </TouchableOpacity>
              )}
            </Obx>
          </View>
        )}
      </View>
      <Pressable onLongPress={onOptionPress} onPress={onPress}>
        <Box marginTop={14}>
          <AppText regexMetion onMentionPress={onMentionPress} lineHeight={18}>
            <AppText lineHeight={18} fontWeight={700}>
              {post.posted_by.user_name}
            </AppText>{' '}
            {post.message}
          </AppText>
          {!showDetail && !preview && post.comments.length > 0 && (
            <Padding top={8}>
              {post.comments.slice(-2).map(comment => (
                <AppText
                  key={comment.comment_id}
                  regexMetion
                  onMentionPress={onMentionPress}
                  numberOfLines={1}
                  lineHeight={18}
                >
                  <AppText numberOfLines={1} lineHeight={18} fontWeight={700}>
                    {comment.commented_by.user_name}
                  </AppText>{' '}
                  {comment.is_image ? t('home.sent_an_image') : comment.comment}
                </AppText>
              ))}
            </Padding>
          )}
        </Box>
      </Pressable>
      {!preview && !showDetail && (
        <TouchableOpacity onPress={onCommentPress} style={styles.commentBar}>
          <AppImage
            source={{
              uri: getMediaUri(userStore.userInfo.avatar_url),
            }}
            containerStyle={styles.profileImg}
          />
          <AppText>{t('home.comment_placeholder')}</AppText>
          <Expanded />
          <Obx>
            {() => (
              <AppText fontWeight={700}>
                ({formatAmount(post.comments.length)} Comments)
              </AppText>
            )}
          </Obx>
        </TouchableOpacity>
      )}
    </Box>
  )
}

export default PostItem
interface IndicatorItemProps {
  index: number
  pageAnim: SharedValue<number>
}
const IndicatorItem = memo(({ index, pageAnim }: IndicatorItemProps) => {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(
      pageAnim.value,
      [index - 1, index, index + 1],
      [0.5, 1, 0.5],
      Animated.Extrapolate.CLAMP,
    ),
    width: interpolate(
      pageAnim.value,
      [index - 1, index, index + 1],
      [8, 24, 8],
      Animated.Extrapolate.CLAMP,
    ),
  }))
  return <Animated.View style={[styles.indicator, style]} />
})
const styles = XStyleSheet.create({
  rootView: {
    width: screenWidth - ResponsiveWidth(32),
    minHeight: screenWidth - ResponsiveWidth(32),
    skipResponsive: true,
  },
  imageContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    aspectRatio: 1,
    height: undefined,
    zIndex: -1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  avatarView: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    height: 54,
    width: 54,
    borderRadius: 24,
    position: 'absolute',
    zIndex: 10,
    overflow: 'hidden',
  },
  optionBtn: {
    height: 57,
    width: 57,
    borderRadius: 99,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideBarView: {
    position: 'absolute',
    zIndex: 10,
    right: 16,
    bottom: 16,
    width: 57,
    alignItems: 'center',
  },
  sideBarBtn: {
    height: 57,
    width: 57,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  reactBtn: {
    height: 80,
    width: 57,
    borderRadius: 99,
    overflow: 'hidden',
  },
  indicatorView: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    backgroundColor: Colors.white,
    height: 6,
    marginHorizontal: 4,
    borderRadius: 10,
  },
  profileImg: {
    height: 27,
    width: 27,
    borderRadius: 11,
    overflow: 'hidden',
    marginRight: 16,
  },
  commentBar: {
    height: ResponsiveHeight(50),
    width: screenWidth - ResponsiveWidth(32),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ResponsiveWidth(16),
    backgroundColor: Colors.kF8F8F8,
    marginTop: ResponsiveHeight(14),
    borderRadius: moderateScale(16),
    skipResponsive: true,
  },
  fullscreenBtn: {
    height: 36,
    width: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white50,
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
})
