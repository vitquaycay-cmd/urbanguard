import { api } from './api'

export interface ForumPostFile {
  id?: string
  url: string
  type: string
  fileName?: string
  mimeType?: string
  size?: number
  createdAt?: string
}

export interface ForumComment {
  id: string
  postId: string
  userId: string
  content: string
  createdAt?: string
  updatedAt?: string
  user?: {
    id: string
    fullName?: string
    email?: string
    avatarUrl?: string
    role?: string
  }
}

export interface ForumPost {
  id: string
  userId?: string
  categoryId?: string
  title: string
  content: string
  city?: string
  district?: string
  createdAt?: string
  updatedAt?: string

  likesCount?: number
  commentsCount?: number
  sharesCount?: number
  likedByMe?: boolean

  user?: {
    id: string
    fullName?: string
    fullname?: string
    username?: string
    email?: string
    role?: string
  }

  author?: {
    id: string
    fullName?: string
    fullname?: string
    username?: string
    email?: string
    role?: string
  }

  category?: {
    id: string
    name: string
  }

  media?: ForumPostFile[]
  comments?: ForumComment[]
}

export type CreateForumPostPayload = {
  title: string
  content: string
  city?: string
  district?: string
  categoryId: string
  files?: File[]
}

function getTokenOrThrow() {
  const token = localStorage.getItem('forum_token')

  if (!token || token === 'undefined' || token === 'null') {
    throw new Error('Bạn cần đăng nhập trước khi thực hiện thao tác này.')
  }

  return token
}

export async function getForumPosts() {
  const res = await api.get<ForumPost[]>('/forum/post')
  return res.data
}

export async function getForumPostById(id: string) {
  const res = await api.get<ForumPost>(`/forum/post/${id}`)
  return res.data
}

export async function createForumPost(payload: CreateForumPostPayload) {
  getTokenOrThrow()

  const formData = new FormData()

  formData.append('title', payload.title)
  formData.append('content', payload.content)
  formData.append('categoryId', payload.categoryId)

  if (payload.city) formData.append('city', payload.city)
  if (payload.district) formData.append('district', payload.district)

  payload.files?.forEach((file) => {
    formData.append('files', file)
  })

  const res = await api.post<ForumPost>('/forum/post', formData)
  return res.data
}

export async function deleteForumPost(id: string) {
  getTokenOrThrow()

  const res = await api.delete(`/forum/post/${id}`)
  return res.data
}

export async function toggleLikePost(postId: string) {
  getTokenOrThrow()

  const res = await api.post<{
    liked: boolean
    likesCount: number
  }>(`/forum/post/${postId}/like`)

  return res.data
}

export async function addForumComment(postId: string, content: string) {
  getTokenOrThrow()

  const res = await api.post<ForumComment>(`/forum/post/${postId}/comment`, {
    content,
  })

  return res.data
}

export async function shareForumPost(postId: string) {
  const res = await api.post<{
    sharesCount: number
  }>(`/forum/post/${postId}/share`)

  return res.data
}