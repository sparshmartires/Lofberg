"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useLoginMutation } from "@/store/services/authApi"
import { Eye, EyeOff } from "lucide-react"

interface LoginFormValues {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const [login, { isLoading, error }] = useLoginMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>()

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoginError(null)
      await login({
        email: data.email,
        password: data.password,
      }).unwrap()

      // Navigate on success
      router.push("/users")
    } catch (err: any) {
      // Check for first-login password change requirement (403 with requirePasswordChange)
      const errData = err?.data?.data || err?.data
      if (errData?.requirePasswordChange && errData?.userId) {
        sessionStorage.setItem("firstLoginUserId", errData.userId)
        sessionStorage.setItem("firstLoginPassword", data.password)
        router.push("/change-password")
        return
      }
      setLoginError(err?.data?.error || err?.data?.message || err?.message || "Login failed. Please try again.")
    }
  }

  return (
    <div className="login-page-container">

      {/* LOGIN CARD */}
      <div className="login-card">
        {/* HEADER */}
        <div className="login-header">
          <h1 className="login-title">
            Welcome back
          </h1>

          <p className="login-subtitle">
            Log in to continue
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="login-form"
        >
          {/* EMAIL */}
          <div className="login-field-group">
            <label className="login-label">
              Email
            </label>

            <Input
              type="email"
              placeholder="Enter email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              })}
            />

            {errors.email && (
              <p className="login-error-text">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="login-field-group">
            <label className="login-label">
              Password
            </label>

            <div className="login-password-wrap">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Minimum 8 characters",
                  },
                })}
                className="login-password-input"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-password-toggle"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className="login-error-text">
                {errors.password.message}
              </p>
            )}

            <Link href="/forgot-password" className="login-forgot-link">
              Forgot Password?
            </Link>
          </div>
          {loginError && (
            <p className="login-error-text">
              {loginError}
            </p>
          )}
          {/* LOGIN BUTTON */}
          <div className="login-submit-wrap">
            <Button
              type="submit"
              variant="primary"
              className="login-submit-btn"
              disabled={isLoading || isSubmitting}
            >
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}