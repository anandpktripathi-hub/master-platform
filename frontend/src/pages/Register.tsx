import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authApi } from "../lib/api"

function Register() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [tenantName, setTenantName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await authApi.register({
        firstName,
        lastName,
        email,
        password,
        tenantName,
      })
      if (!data || !data.accessToken) {
        throw new Error("No access token returned from server")
      }

      localStorage.setItem("accessToken", data.accessToken)
      localStorage.setItem("currentUser", JSON.stringify(data.user || {}))

      setSuccess(true)
      setTimeout(() => {
        navigate("/dashboard")
      }, 800)
    } catch (err: any) {
      console.error("REGISTER ERROR", err)
      setError(err.message || "Registration failed. Please check your details.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-slate-900/60 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold mb-2 text-center">Create your SMETASC account</h1>
        <p className="text-sm text-slate-300 mb-6 text-center">
          One workspace for you and your clients.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-emerald-500 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            Account created. Redirecting to dashboard…
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="firstName">
                First name
              </label>
              <input
                id="firstName"
                type="text"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Anand"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="lastName">
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Tripathi"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="tenantName">
              Company / Tenant name
            </label>
            <input
              id="tenantName"
              type="text"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="SMETASC Global"
              value={tenantName}
              onChange={e => setTenantName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-400 hover:text-indigo-300">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}

export default Register
