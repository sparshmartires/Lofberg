"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function VerifyCodePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  const [code, setCode] = useState(["", "", "", "", ""])
  const [error, setError] = useState("")
  const [seconds, setSeconds] = useState(60)
  const [canResend, setCanResend] = useState(false)

  /* ================= Countdown Logic ================= */

  useEffect(() => {
    if (seconds === 0) {
      setCanResend(true)
      return
    }

    const timer = setTimeout(() => {
      setSeconds((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [seconds])

  const handleResend = () => {
    // Reset timer
    setSeconds(60)
    setCanResend(false)

    // Later call resend API here
    console.log("Resend OTP")
  }

  /* ================= OTP Handling ================= */

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // clear error once user starts typing
    setError("")

    // auto focus next
    if (value && index < 4) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleSubmit = () => {
    const fullCode = code.join("")

    if (fullCode.length < 5) {
      setError("Please enter verification code")
      return
    }

    console.log("OTP Submitted:", fullCode)

    // navigate to next step (reset password page later)
    router.push("/reset-password")
  }

  const maskedEmail = email
    ? email.replace(/(.{3}).+(@.+)/, "$1********$2")
    : ""

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F1F6] p-4">
      <div className="w-full max-w-[720px] bg-white rounded-[28px] border border-[#EDEDED] px-8 py-12">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[14px] text-[#1F1F1F] mb-8"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Title */}
        <h1 className="text-[40px] leading-[120%] tracking-[-0.04em] text-[#1F1F1F] mb-4">
          Enter Verification code
        </h1>

        <p className="text-[16px] leading-[150%] text-[#747474] mb-8">
          The verification code has been sent to your email id {maskedEmail}
        </p>

        {/* OTP INPUTS */}
        <div className="flex gap-4 mb-4">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              maxLength={1}
              className={`
                w-[60px]
                h-[60px]
                text-center
                text-[24px]
                rounded-[16px]
                border
                shadow-[0px_2px_4px_0px_#0000000A]
                focus:outline-none
                ${
                  error
                    ? "border-red-500"
                    : "border-[#EDEDED] focus:border-[#59187B]"
                }
              `}
            />
          ))}
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <p className="text-sm text-red-500 mb-4">
            {error}
          </p>
        )}

        {/* COUNTDOWN / RESEND */}
        <p className="text-[14px] text-[#747474] mb-8">
          {!canResend ? (
            <>
              Not received yet? Resend after{" "}
              <span className="font-semibold">{seconds} seconds</span>
            </>
          ) : (
            <button
              onClick={handleResend}
              className="text-[#59187B] font-semibold"
            >
              Resend Code
            </button>
          )}
        </p>

        {/* CONTINUE BUTTON */}
        <Button
          variant="primary"
          className="w-[220px]"
          onClick={handleSubmit}
        >
          Continue
        </Button>

      </div>
    </div>
  )
}
