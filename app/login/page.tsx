
"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }
      setError("");
      setSuccess("Login successful! Redirecting to dashboard...");
      setLoading(false);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1200);
    } catch (err) {
        console.error("Login error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8 shadow-lg border bg-card/80">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2zm0 0V7m0 4v4m0 0c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" /></svg>
          </div>
          <h2 className="font-semibold text-xl">Sign in to EOP Assistant</h2>
          <p className="text-sm text-muted-foreground">Access your Emergency Operations Plan dashboard</p>
        </div>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              disabled={loading}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          {success && <p className="text-sm text-green-600 text-center">{success}</p>}
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <Button
            type="button"
            className="w-full mt-2"
            variant="outline"
            disabled={loading}
            onClick={() => { router.push('/signup'); }}
          >
            Sign Up
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-6 text-center">
          Need help? Contact your administrator.
        </p>
      </Card>
    </div>
  )
}
