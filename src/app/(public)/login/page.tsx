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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>()

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login({
        email: data.email,
        password: data.password,
      }).unwrap()
      
//document.cookie = `auth_token=${"jr"}; path=/; SameSite=Strict`;
      // Navigate on success
      router.push("/users")
    } catch (err: any) {
   
    }
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-[#F4F2F7]">

      {/* LOGIN CARD */}
      <div className="w-full max-w-[667px] rounded-[28px] border border-[#EDEDED] bg-white px-[20px] py-[32px] sm:px-[32px] sm:py-[48px] flex flex-col gap-[32px] m-[40px]">
        {/* HEADER */}
        <div className="space-y-2">
          <h1 className="text-[48px] leading-[100%] tracking-[-0.005em] font-normal text-[#1F1F1F]">
            Welcome back
          </h1>

          <p className="text-[16px] leading-[150%] tracking-[-0.005em] text-[#6B6B6B]">
            Log in to continue
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-[20px]"
        >
          {/* EMAIL */}
          <div className="space-y-2">
            <label className="text-[14px] text-[#1F1F1F]">
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
              <p className="text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="space-y-2">
            <label className="text-[14px] text-[#1F1F1F]">
              Password
            </label>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Minimum 6 characters",
                  },
                })}
                className="pr-12"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9E9E9E]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-xs text-red-500">
                {errors.password.message}
              </p>
            )}

            <Link href="/forgot-password" className="text-[14px] text-[#7B3EBE] cursor-pointer">
              Forgot Password?
            </Link>
          </div>
          {error && "data" in error && (error as any).data?.error && (
            <p className="text-xs text-red-500">
              {(error as any).data?.error}
            </p>
          )}
          {/* LOGIN BUTTON */}
          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              className="w-[180px]"
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