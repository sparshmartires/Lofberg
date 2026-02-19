"use client"

import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface LoginFormValues {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>()

  const onSubmit = (data: LoginFormValues) => {
    // Hardcoded login for now
    document.cookie = "auth_token=demo; path=/"
    router.push("/users")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F2F7]">

      {/* LOGIN CARD */}
      <div
        className="
            w-full
    max-w-[667px]
    rounded-[28px]
    border
    border-[#EDEDED]
    bg-white
    px-[20px]
    py-[32px]
    sm:px-[32px]
    sm:py-[48px]
    flex
    flex-col
    gap-[32px]
    m-[40px]
        "
      >
        {/* HEADER */}
        <div className="space-y-2">
          <h1
            className="
              text-[48px]
              leading-[100%]
              tracking-[-0.005em]
              font-normal
              text-[#1F1F1F]
            "
          >
            Welcome back
          </h1>

          <p
            className="
              text-[16px]
              leading-[150%]
              tracking-[-0.005em]
              text-[#6B6B6B]
            "
          >
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

            <Input
              type="password"
              placeholder="Enter password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Minimum 6 characters",
                },
              })}
            />

            {errors.password && (
              <p className="text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
            <Link href="/forgot-password" className="text-[14px] text-[#7B3EBE] cursor-pointer">
            Forgot Password?
          </Link>
          </div>

          {/* FORGOT PASSWORD */}
         

          {/* LOGIN BUTTON */}
          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              className="w-[180px]"
            >
              Log in
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}