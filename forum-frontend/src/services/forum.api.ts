import { api } from './api'

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

  user?: {
    id: string
    fullname?: string
    fullName?: string
    username?: string
    email?: string
  }

  author?: {
    id: string
    fullname?: string
    fullName?: string
    username?: string
    email?: string
  }

  category?: {
    id: string
    name: string
  }
}

export type CreateForumPostPayload = {
  title: string
  content: string
  city?: string
  district?: string
  categoryId: string
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
  const token = localStorage.getItem('forum_token')

  if (!token || token === 'undefined' || token === 'null') {
    throw new Error('Bạn cần đăng nhập trước khi đăng bài.')
  }

  const res = await api.post<ForumPost>('/forum/post', payload)
  return res.data
}

export async function deleteForumPost(id: string) {
  const token = localStorage.getItem('forum_token')

  if (!token || token === 'undefined' || token === 'null') {
    throw new Error('Bạn cần đăng nhập trước khi xoá bài.')
  }

  const res = await api.delete(`/forum/post/${id}`)
  return res.data
}