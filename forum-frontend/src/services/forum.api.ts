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
  category?: {
    id: string
    name: string
  }
}

export async function getForumPosts() {
  const res = await api.get<ForumPost[]>('/forum/post')
  return res.data
}

export async function getForumPostById(id: string) {
  const res = await api.get<ForumPost>(`/forum/post/${id}`)
  return res.data
}

export async function createForumPost(payload: {
  title: string
  content: string
  city?: string
  district?: string
  categoryId: string
}) {
  const res = await api.post('/forum/post', payload)
  return res.data
}

export async function deleteForumPost(id: string) {
  const res = await api.delete(`/forum/post/${id}`)
  return res.data
}