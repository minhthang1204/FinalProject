import { mockPosts, mockUsers, Post, User } from '@/Models'
import { getUserInfo, getUserPosts } from '@/Services/Api'
import { makeAutoObservable, toJS } from 'mobx'
import { hydrateStore, isHydrated } from 'mobx-persist-store'
import { userStore } from '.'
export default class ProfileStore {
  profileInfo: User = {} as User
  fetching = false
  posts: Post[] = []
  followers: User[] = []
  following: User[] = []
  loadingPosts = false
  loadingMorePosts = false
  postPage = 1
  constructor() {
    makeAutoObservable(this)
  }
  *fetchProfile(userId) {
    try {
      this.profileInfo.user_id = userId
      // fetch user info
      const response = yield getUserInfo(this.profileInfo.user_id)
      if (response?.status === 'OK') {
        this.profileInfo = response.data
        this.followers = response.data.followers
        this.following = response.data.following
      }
      // fetch following
    } catch (e) {
      this.profileInfo =
        mockUsers.find(u => u.user_id === userId) || mockUsers[1]
      this.following = mockUsers.slice(1, 5)
      this.followers = mockUsers.slice(1, 5)
      this.posts = mockPosts
      console.log({
        fetchProfile: e,
      })
    }
  }
  *fetchPosts(loadMore) {
    try {
      if (!loadMore) {
        this.loadingPosts = true
      } else {
        this.loadingMorePosts = true
      }
      const response = yield getUserPosts(
        this.profileInfo.user_id,
        this.postPage,
      )
      if (response?.status === 'OK') {
        if (!loadMore) {
          this.posts = response.data
        } else {
          this.posts = [...this.posts, ...response.data]
        }
        this.postPage += 1
      }
    } catch (e) {
      console.log({
        fetchPosts: e,
      })
    }
  }
  findPostById(postId) {
    return this.posts.find(post => post.post_id === postId)
  }
  addPostComment(postId, comment) {
    const post = this.findPostById(postId)
    if (post) {
      post.comments = [comment, ...post.comments]
    }
  }
  updatePostComment(postId, commentId, comment) {
    const post = this.findPostById(postId)
    if (post) {
      const index = post.comments.findIndex(
        item => item.comment_id === commentId,
      )
      if (index > -1) {
        post.comments[index] = { ...post.comments[index], ...comment }
      }
    }
  }
  deletePostComment(postId, commentId) {
    const post = this.findPostById(postId)
    if (post) {
      post.comments = post.comments.filter(
        item => item.comment_id !== commentId,
      )
    }
  }
  reactPost(postId) {
    const post = this.findPostById(postId)
    if (post) {
      const isReacted = post.reactions.some(
        r => r.reacted_by.user_id === userStore.userInfo.user_id,
      )
      if (!isReacted) {
        post.reactions = [
          {
            reacted_by: toJS(userStore.userInfo),
          },
          ...post.reactions,
        ]
      }
    }
  }
  unReactPost(postId) {
    const post = this.findPostById(postId)
    if (post) {
      post.reactions = post.reactions.filter(
        r => r.reacted_by.user_id !== userStore.userInfo.user_id,
      )
    }
  }
  isReactedPost(postId) {
    const post = this.findPostById(postId)
    if (post) {
      return post.reactions.some(
        r => r.reacted_by.user_id === userStore.userInfo.user_id,
      )
    }
    return false
  }
  get isHydrated() {
    return isHydrated(this)
  }
  // hydrate the store (required)
  async hydrateStore() {
    await hydrateStore(this)
  }
}
