"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { ArrowLeft } from "lucide-react"
import { useForgotPasswordMutation } from "@/store/services/authApi"
import { useState } from "react"

interface FormValues {
  emailOrPhone: string
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const [apiError, setApiError] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>()

  const onSubmit = async (data: FormValues) => {
    try {
      setApiError("")
      setSuccessMessage("")
      const response = await forgotPassword({
        email: data.emailOrPhone,
      }).unwrap()

      setSuccessMessage(response.message || "Reset code sent successfully. Please check your email.")
    } catch (err: any) {
      setSuccessMessage("")
      const errorMessage = err?.data?.message || err?.error || "Failed to send reset code"
      setApiError(errorMessage)
      setError("emailOrPhone", {
        type: "manual",
        message: errorMessage,
      })
    }
  }

  return (
    <div className="forgot-password-page-container">

      <div className="forgot-password-card">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="forgot-password-back-btn"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Title Section */}
        <div className="forgot-password-title-wrap">
          <h1 className="forgot-password-title">
            Reset Password
          </h1>

          <p className="forgot-password-description">
            Enter the email address associated with your account and we will email you the verification code to reset your password
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="forgot-password-form">

          <div className="forgot-password-field-wrap">
            <label className="forgot-password-label">
              Email<span className="text-red-500">*</span>
            </label>

            <Input
              type="email"
              className="forgot-password-input"
              placeholder="Enter email"
              {...register("emailOrPhone", {
                required: "This field is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />

            {errors.emailOrPhone && (
              <p className="forgot-password-error-text forgot-password-input-error-spacing">
                {errors.emailOrPhone.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="forgot-password-submit-btn"
            disabled={isLoading || isSubmitting}
          >
            {isLoading ? "Sending..." : "Continue"}
          </Button>

          {successMessage && (
            <p className="forgot-password-success-text">
              {successMessage}
            </p>
          )}

          {apiError && (
            <p className="forgot-password-error-text">
              {apiError}
            </p>
          )}

        </form>
      </div>
    </div>
  )
}
