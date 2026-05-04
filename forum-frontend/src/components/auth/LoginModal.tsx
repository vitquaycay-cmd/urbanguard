import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type User = {
  id?: string
  fullName?: string
  fullname?: string
  name?: string
  email?: string
  role?: string
}

type LoginSuccessPayload = {
  user: User
  token: string
}

type Props = {
  open: boolean
  onClose: () => void
  onLoginSuccess: (payload: LoginSuccessPayload) => void
}

export default function LoginModal({ open, onClose, onLoginSuccess }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url =
        mode === 'login'
          ? 'http://localhost:4000/api/forum/auth/login'
          : 'http://localhost:4000/api/forum/auth/register'

      const body =
        mode === 'login'
          ? { email: email.trim(), password }
          : { fullName: name.trim(), email: email.trim(), password }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || data?.error || 'Có lỗi xảy ra')
      }

      if (mode === 'register') {
        alert('Đăng ký thành công, hãy đăng nhập!')
        setMode('login')
        setName('')
        setPassword('')
        setShowPassword(false)
        return
      }

      const token =
        data?.accessToken ||
        data?.access_token ||
        data?.token ||
        data?.jwt ||
        data?.data?.accessToken ||
        data?.data?.access_token ||
        data?.data?.token ||
        data?.data?.jwt

      const user =
        data?.user ||
        data?.data?.user ||
        data?.account ||
        data?.data?.account

      if (!token || !user) {
        console.log('LOGIN RESPONSE:', data)
        throw new Error('Server không trả về token hoặc user')
      }

      localStorage.setItem('forum_token', String(token))
      localStorage.setItem('forum_user', JSON.stringify(user))

      onLoginSuccess({
        user,
        token: String(token),
      })

      setEmail('')
      setPassword('')
      setShowPassword(false)
      onClose()
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Không kết nối được server')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setError('')
    setMode('login')
    setShowPassword(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[400px] rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold">
          {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Họ và tên"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu"
              className="w-full rounded-xl border px-4 py-3 pr-12 outline-none focus:border-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-green-500 py-3 font-semibold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading
              ? mode === 'login'
                ? 'Đang đăng nhập...'
                : 'Đang đăng ký...'
              : mode === 'login'
              ? 'Đăng nhập'
              : 'Đăng ký'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          {mode === 'login' ? (
            <>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setError('')
                  setMode('register')
                }}
                className="font-semibold text-green-600"
              >
                Đăng ký
              </button>
            </>
          ) : (
            <>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setError('')
                  setMode('login')
                }}
                className="font-semibold text-green-600"
              >
                Đăng nhập
              </button>
            </>
          )}
        </p>

        <button
          type="button"
          onClick={handleClose}
          className="mt-4 w-full text-gray-500 hover:text-gray-700"
        >
          Đóng
        </button>
      </div>
    </div>
  )
}