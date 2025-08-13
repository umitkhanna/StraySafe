import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    // TODO: Replace with your real API authentication
    if (email.trim() === "" || password.trim() === "") {
      setError("Email and password are required.")
      return
    }

    // Simulated role check
    if (email === "admin@example.com" && password === "admin123") {
      // Save to localStorage or context for real apps
      navigate("/admin/users")
    } else {
      setError("Invalid credentials. Try admin@example.com / admin123")
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-sm rounded-2xl border bg-white/5 p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  )
}
