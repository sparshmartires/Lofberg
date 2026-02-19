"use client";

import { useGetPostsQuery } from "@/store/services/exampleApi";
import { Button } from "@/components/ui/button";
import { useState } from "react"
import { FeedbackDialog } from "@/components/ui/feedback-dialog"
import { Input } from "@/components/ui/input"
import { FileText, Plus, Trash2, X } from "lucide-react";

export default function HomePage() {
  const { data, isLoading, error } = useGetPostsQuery();
  const [successOpen, setSuccessOpen] = useState(false)
const [errorOpen, setErrorOpen] = useState(false)


  if (isLoading) return <p className="p-6 text-body">Loading...</p>;
  if (error) return <p className="p-6 text-body">Error loading posts</p>;

  return (
    <main className="p-10 space-y-16">

      {/* ================= TYPOGRAPHY SECTION ================= */}
      <section className="space-y-8">
        <h1 className="text-display-xl text-foreground">
          Typography System
        </h1>

        <div className="space-y-6">

          <div>
            <p className="text-caption text-muted-foreground mb-2">
              Display XL – 40px / 48px / -1.6px
            </p>
            <h2 className="text-display-xl text-foreground">
              BrownStd Display XL
            </h2>
          </div>

          <div>
            <p className="text-caption text-muted-foreground mb-2">
              Display LG – 28px / 34px
            </p>
            <h2 className="text-display-lg text-primary">
              BrownStd Display LG
            </h2>
          </div>

          <div>
            <p className="text-caption text-muted-foreground mb-2">
              Heading MD – 24px / 24px
            </p>
            <h3 className="text-heading-md text-muted-foreground">
              BrownStd Heading Medium
            </h3>
          </div>

          <div>
            <p className="text-caption text-muted-foreground mb-2">
              Body – 14px / 17px
            </p>
            <p className="text-body text-foreground">
              This is standard body text using BrownStd Regular.
            </p>
          </div>

          <div>
            <p className="text-caption text-muted-foreground mb-2">
              Body Muted – 14px
            </p>
            <p className="text-body text-muted-foreground">
              This is muted body text used for descriptions.
            </p>
          </div>

          <div>
            <p className="text-caption text-muted-foreground mb-2">
              Caption – 12px / 17px
            </p>
            <p className="text-caption text-primary">
              Caption label text
            </p>
          </div>

        </div>
      </section>

      {/* ================= BUTTON SECTION ================= */}
      <section className="space-y-8">
        <h2 className="text-display-lg text-foreground">
          Button Variants
        </h2>

        {/* PRIMARY */}
        <div className="space-y-4">
          <h3 className="text-heading-md text-foreground">
            Primary
          </h3>

          <div className="flex flex-wrap gap-4">
            <Button variant="primary">
              Lets Brew a new batch
            </Button>

            <Button variant="primary" size="sm">
              Compact
            </Button>

            <Button variant="primary" size="icon">
              <Plus className="h-4 w-4" />
            </Button>

            <Button variant="primary">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* ACCENT */}
        <div className="space-y-4">
          <h3 className="text-heading-md text-foreground">
            Accent
          </h3>

          <div className="flex flex-wrap gap-4">
            <Button variant="accent">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>

            <Button variant="accent" size="sm">
              Small Accent
            </Button>
          </div>
        </div>

        {/* OUTLINE */}
        <div className="space-y-4">
          <h3 className="text-heading-md text-foreground">
            Outline Brand
          </h3>

          <Button variant="outlineBrand">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>

        {/* GHOST */}
        <div className="space-y-4">
          <h3 className="text-heading-md text-foreground">
            Ghost Brand
          </h3>

          <Button variant="ghostBrand">
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </section>
      {/* ================= Dialog SECTION ================= */}
<Button onClick={() => setSuccessOpen(true)}>
  Open Success
</Button>

<Button variant="outlineBrand" onClick={() => setErrorOpen(true)}>
  Open Error
</Button>
<FeedbackDialog
  open={successOpen}
  onOpenChange={setSuccessOpen}
  type="success"
  title="Password Updated Successfully"
  primaryActionLabel="Back to profile"
  onPrimaryAction={() => setSuccessOpen(false)}
/>

<FeedbackDialog
  open={errorOpen}
  onOpenChange={setErrorOpen}
  type="error"
  title="Unable to change password"
  description="There seems to be an error, please try again or contact our support team for assistance. We're here to help!"
  primaryActionLabel="Retry"
  onPrimaryAction={() => setErrorOpen(false)}
  secondaryActionLabel="Contact Support"
  onSecondaryAction={() => setErrorOpen(false)}
/>


<Input
  type="email"
  placeholder="email@lofberg.se"
  className="
    w-[302px] h-[44px]
    rounded-[99px]
    border-[#F0F0F0]
    px-[20px] pr-[8px] py-[12px]
    shadow-[0px_2px_4px_0px_#0000000A]
    text-body
  "
/>

<Input
  type="tel"
  placeholder="+46 70 123 4567"
  className="
    w-[302px] h-[44px]
    rounded-[99px]
    border-[#F0F0F0]
    px-[20px] pr-[8px] py-[12px]
    shadow-[0px_2px_4px_0px_#0000000A]
    text-body
  "
/>

      {/* ================= API SECTION ================= */}
      <section className="space-y-4">
        <h2 className="text-heading-md text-foreground">
          Posts (RTK Query)
        </h2>

        <ul className="space-y-2">
          {data?.slice(0, 5).map((post) => (
            <li
              key={post.id}
              className="rounded-md border border-border p-3 text-body text-muted-foreground"
            >
              {post.title}
            </li>
          ))}
        </ul>
      </section>

    </main>
  );
}
