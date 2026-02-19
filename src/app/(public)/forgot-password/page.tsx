"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { ArrowLeft } from "lucide-react"

interface FormValues {
  emailOrPhone: string
}

export default function ForgotPasswordPage() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  const onSubmit = (data: FormValues) => {
    console.log("Reset request:", data)

    // Later: call API
   router.push(`/verify-code?email=${encodeURIComponent(data.emailOrPhone)}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F2F7] px-4">

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
        "
      >
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[14px] text-[#1F1F1F]"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Title Section */}
        <div className="space-y-3">
          <h1 className="text-[32px] sm:text-[40px] leading-[100%] tracking-[-0.5%] text-[#1F1F1F]">
            Reset Password
          </h1>

          <p className="text-[16px] leading-[150%] tracking-[-0.5%] text-[#747474] max-w-[520px]">
            Enter the email address associated with your account and we will email you the verification code to reset your password
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <div className="mb-[16px]">
            <label className="text-[14px] text-[#1F1F1F] mb-[6px]">
              Email / Phone number <span className="text-red-500">*</span>
            </label>

            <Input
              className="mt-[6px]"
              placeholder="Enter Email / Phone number"
              {...register("emailOrPhone", {
                required: "This field is required",
              })}
            />

            {errors.emailOrPhone && (
              <p className="text-xs text-red-500">
                {errors.emailOrPhone.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-[220px]"
          >
            Continue
          </Button>

        </form>
      </div>
    </div>
  )
}
