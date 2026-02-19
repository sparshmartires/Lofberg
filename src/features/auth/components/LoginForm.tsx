"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Link from "next/link"

type LoginFormValues = {
  email: string
  password: string
}

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>()
const router = useRouter()
const onSubmit = async (data: LoginFormValues) => {
  console.log("Mock login:", data)

  // Hardcoded auth token
  document.cookie = "auth_token=fake_token_123; path=/"

  // Navigate
  router.push("/users")
}


  return (
    <div className="w-full max-w-[420px] bg-white rounded-[32px] shadow-sm p-10 space-y-8">

      {/* Heading */}
      <div className="space-y-2">
        <h1 className="text-display-xl text-foreground">
          Welcome back
        </h1>
        <p className="text-body text-muted-foreground">
          Log in to continue
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* EMAIL */}
        <div className="space-y-2">
          <label className="text-body text-foreground">
            Email
          </label>

          <Input
            type="email"
            placeholder="email@lofberg.se"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Please enter a valid email",
              },
            })}
            className={errors.email ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}
          />

          {errors.email && (
            <p className="text-caption text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* PASSWORD */}
        <div className="space-y-2">
          <label className="text-body text-foreground">
            Password
          </label>

          <Input
            type="password"
            placeholder="Enter password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            className={errors.password ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}
          />

          {errors.password && (
            <p className="text-caption text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-body text-primary hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* SUBMIT */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
        >
          Log in
        </Button>

        {/* Sign Up */}
        <p className="text-center text-body text-muted-foreground">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>

      </form>
    </div>
  )
}
