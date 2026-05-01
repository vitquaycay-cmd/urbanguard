import { useState } from 'react'
import { createForumPost } from '../../services/forum.api'

type CreatePostModalProps = {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export default function CreatePostModal({
  open,
  onClose,
  onCreated,
}: CreatePostModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [city, setCity] = useState('Buôn Ma Thuột')
  const [district, setDistrict] = useState('Ea Tam')
  const [categoryId, setCategoryId] = useState('cmo03qas20000lkdmoiujeh9u')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const token = localStorage.getItem('forum_token')

    if (!token) {
      setError('Bạn cần đăng nhập trước khi đăng bài.')
      return
    }

    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề bài viết.')
      return
    }

    if (!content.trim()) {
      setError('Vui lòng nhập nội dung bài viết.')
      return
    }

    try {
      setLoading(true)

      await createForumPost({
        title: title.trim(),
        content: content.trim(),
        city: city.trim(),
        district: district.trim(),
        categoryId,
      })

      setTitle('')
      setContent('')
      setCity('Buôn Ma Thuột')
      setDistrict('Ea Tam')
      setCategoryId('cmo03qas20000lkdmoiujeh9u')

      await onCreated()
      onClose()
    } catch (err: any) {
      console.error(err)
      setError(
        err?.response?.data?.message ||
          'Đăng bài thất bại. Vui lòng kiểm tra lại server hoặc đăng nhập.'
      )
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[620px] rounded-[28px] bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Tạo bài viết</h2>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl px-3 py-2 text-gray-500 hover:bg-gray-100"
          >
            Đóng
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề bài viết"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Bạn muốn chia sẻ điều gì?"
            rows={6}
            className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Thành phố"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
            />

            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="Khu vực"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
          >
            <option value="cmo03qas20000lkdmoiujeh9u">Sự cố chung</option>
          </select>

          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center text-sm text-gray-500">
            Ảnh/video sẽ làm tiếp sau.
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-green-500 py-3 font-semibold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Đang đăng bài...' : 'Đăng bài'}
          </button>
        </form>
      </div>
    </div>
  )
}