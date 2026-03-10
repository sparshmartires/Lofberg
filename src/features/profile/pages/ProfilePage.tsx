"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Badge } from "@/components/ui/badge"
import { Save } from "lucide-react"
import { PageHeaderWithAction } from "@/components/layout/PageHeaderWithAction"

export default function MyProfilePage() {
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
              <Image
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="avatar"
                width={44}
                height={44}
                className="rounded-full"
              />

              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[16px] text-[#1F1F1F]">
                    Karin Bergstrom
                  </p>

                  <Badge className="bg-[#7DB356] text-white rounded-full px-3">
                    Active
                  </Badge>
                </div>

                <p className="text-[14px] text-[#6B6B6B]">
                  Administrator
                </p>
              </div>
            </div>

            <div className="text-right text-[12px] text-[#6B6B6B]">
              <p>Last login</p>
              <p>03/02/2026, 12:59:51</p>
            </div>

          </div>

          <div className="border-b border-[#EDEDED] my-6" />

          {/* FORM */}
          <div className="space-y-[38px]">

            <div className="grid grid-cols-2 gap-x-[20px] gap-y-[24px]">

              {/* FIRST NAME */}
              <div className="space-y-2">
                <p className="text-[14px]">First name</p>
                <Input
                  placeholder="Enter first name"
                  className="rounded-full"
                />
              </div>

              {/* LAST NAME */}
              <div className="space-y-2">
                <p className="text-[14px]">Last name</p>
                <Input
                  placeholder="Enter last name"
                  className="rounded-full"
                />
              </div>

              {/* EMAIL */}
              <div className="col-span-2 space-y-2">
                <p className="text-[14px]">Email</p>

                <Input
                  disabled
                  value="admin@lofberg.se"
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
                  placeholder="+XX XXXXX XXXXX"
                  className="rounded-full"
                />
              </div>

            </div>

            {/* SAVE BUTTON */}
            <Button
              className="bg-[#5B2D91] hover:bg-[#4a2374] text-white rounded-full flex items-center gap-2 px-[12px] py-[7.5px]"
            >
              <Save size={16} />
              Save changes
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

          <Button variant="outlineBrand">
            Change password
          </Button>

        </div>

      </div>

    </div>
  )
}