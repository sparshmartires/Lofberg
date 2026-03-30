"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Badge } from "@/components/ui/badge"
import { formatPhoneDisplay } from "@/lib/phone"
import { Loader2, Pencil, Save } from "lucide-react"
import { PageHeaderWithAction } from "@/components/layout/PageHeaderWithAction"
import { useGetMeQuery, useUpdateMeMutation } from "@/store/services/authApi"
import { ChangePasswordDialog } from "@/features/profile/components/ChangePasswordDialog"

const formatDateTime = (value: string) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const formatRole = (role: string | undefined) => {
  if (!role) return "User"
  return role
    .replace(/[_-]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/men/32.jpg"

const getSafeAvatarSrc = (value: string | undefined) => {
  const source = (value || "").trim()
  if (!source) return DEFAULT_AVATAR
  if (source.startsWith("http://") || source.startsWith("https://") || source.startsWith("/")) {
    return source
  }
  return DEFAULT_AVATAR
}

export default function MyProfilePage() {
  const { data: profile, isLoading, isFetching, isError, refetch } = useGetMeQuery()
  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation()
  const [draft, setDraft] = useState({ firstName: "", lastName: "", phoneNumber: "" })
  const [touched, setTouched] = useState({ firstName: false, lastName: false, phoneNumber: false })
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState("")
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false)

  const firstName = touched.firstName ? draft.firstName : profile?.firstName || ""
  const lastName = touched.lastName ? draft.lastName : profile?.lastName || ""
  const phoneNumber = touched.phoneNumber ? draft.phoneNumber : profile?.phoneNumber || ""

  const fullName = useMemo(() => {
    const localFullName = `${firstName} ${lastName}`.trim()
    if (localFullName) return localFullName
    if (profile?.fullName) return profile.fullName
    return profile?.email || "-"
  }, [firstName, lastName, profile])

  const isSaveDisabled = isLoading || isFetching || isError || isUpdating

  const handleSave = async () => {
    if (!profile) return

    setSaveError("")
    setSaveSuccess("")

    try {
      await updateMe({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        profileImageUrl: profile.avatarUrl || null,
      }).unwrap()

      setSaveSuccess("Profile updated successfully.")
    } catch {
      setSaveError("Failed to update profile. Please try again.")
    }
  }

  const primaryRole = formatRole(profile?.roles?.[0])

  return (
    <div className="space-y-8">

      {/* PAGE HEADER */}
      <PageHeaderWithAction
        title="My profile"
        description="Manage your personal information and preferences"
      />

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">

        {/* PERSONAL INFO CARD */}
        <div className="rounded-[28px] border border-[#EDEDED] bg-white p-[32px_21px]">

          {/* TITLE */}
          <p className="text-[16px] text-[#1F1F1F] mb-6">
            Personal information
          </p>

          {/* USER HEADER */}
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src={getSafeAvatarSrc(profile?.avatarUrl)}
                  alt="avatar"
                  width={44}
                  height={44}
                  className="rounded-full"
                />
                <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#5B2D91] rounded-full flex items-center justify-center">
                  <Pencil className="w-2.5 h-2.5 text-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[16px] text-[#1F1F1F]">
                    {fullName}
                  </p>

                  <Badge className="bg-[#7DB356] text-white rounded-full px-3">
                    {profile?.isActive === false ? "Inactive" : "Active"}
                  </Badge>
                </div>

                <p className="text-[14px] text-[#6B6B6B]">
                  {primaryRole}
                </p>
              </div>
            </div>

          </div>

          <div className="border-b border-[#EDEDED] my-6" />

          {/* FORM */}
          <div className="space-y-[38px]">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading profile data...
              </div>
            ) : null}

            {isError ? (
              <div className="flex items-center justify-between gap-4 rounded-[16px] border border-[#EDEDED] bg-[#FAFAFA] px-4 py-3">
                <p className="text-sm text-[#6B6B6B]">Failed to load profile information.</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            ) : null}

            {saveError ? (
              <p className="text-sm text-destructive">{saveError}</p>
            ) : null}

            {saveSuccess ? (
              <p className="text-sm text-[#5B2D91]">{saveSuccess}</p>
            ) : null}

            <div className="grid grid-cols-2 gap-x-[20px] gap-y-[24px]">

              {/* FIRST NAME */}
              <div className="space-y-2">
                <p className="text-[14px]">First name</p>
                <Input
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(event) => {
                    setTouched((previous) => ({ ...previous, firstName: true }))
                    setDraft((previous) => ({ ...previous, firstName: event.target.value }))
                  }}
                  className="rounded-full"
                />
              </div>

              {/* LAST NAME */}
              <div className="space-y-2">
                <p className="text-[14px]">Last name</p>
                <Input
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(event) => {
                    setTouched((previous) => ({ ...previous, lastName: true }))
                    setDraft((previous) => ({ ...previous, lastName: event.target.value }))
                  }}
                  className="rounded-full"
                />
              </div>

              {/* EMAIL */}
              <div className="col-span-2 space-y-2">
                <p className="text-[14px]">Email</p>

                <Input
                  disabled
                  value={profile?.email || ""}
                  className="rounded-full bg-[#F5F5F5]"
                />

                <p className="text-[12px] text-[#8A8A8A]">
                  Email cannot be changed. Contact an administrator if you need to update this.
                </p>
              </div>

              {/* CONTACT NUMBER */}
              <div className="col-span-2 space-y-2">
                <p className="text-[14px]">Contact number</p>

                <Input
                  type="tel"
                  placeholder="+XX XXXXX XXXXX"
                  value={formatPhoneDisplay(phoneNumber)}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, "").slice(0, 12)
                    setTouched((previous) => ({ ...previous, phoneNumber: true }))
                    setDraft((previous) => ({ ...previous, phoneNumber: digits }))
                  }}
                  className="rounded-full"
                />
              </div>

            </div>

            {/* SAVE BUTTON */}
            <Button
              disabled={isSaveDisabled}
              onClick={handleSave}
              className="bg-[#5B2D91] hover:bg-[#4a2374] text-white rounded-full flex items-center gap-2 px-[12px] py-[7.5px]"
            >
              <Save size={16} />
              {isUpdating ? "Saving..." : "Save changes"}
            </Button>

          </div>

        </div>

        {/* PASSWORD MANAGEMENT */}
        <div className="rounded-[28px] border border-[#EDEDED] bg-white p-[16px_20px] h-fit">

          <p className="text-[16px] text-[#1F1F1F] mb-2">
            Password management
          </p>

          <p className="text-[14px] text-[#6B6B6B] mb-4">
            Update your password to keep your account secure
          </p>

          <Button 
            variant="outlineBrand"
            onClick={() => setChangePasswordDialogOpen(true)}
          >
            Change password
          </Button>

        </div>

      </div>

      {/* CHANGE PASSWORD DIALOG */}
      <ChangePasswordDialog
        open={changePasswordDialogOpen}
        onOpenChange={setChangePasswordDialogOpen}
      />

    </div>
  )
}