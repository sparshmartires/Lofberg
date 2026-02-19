import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Top Brand Border */}
      <div className="h-2 bg-primary w-full" />

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center space-y-6">

          {/* Illustration */}
          <div className="flex justify-center">
            <Image
              src="/notfound.png"
              alt="404 Coffee Not Found"
              width={400}
              height={400}
              sizes="(max-width: 768px) 250px, 400px"
              className="w-[300px] h-auto"
            />
          </div>

          {/* Heading */}
          <h1 className="text-display-xl text-foreground">
            <span className="font-bold">404</span> Coffee Not Found
          </h1>

          {/* Subtext */}
          <p className="text-body text-muted-foreground">
            Looks like you've reached the bottom of the pot
          </p>

          {/* CTA */}
          <div className="pt-4">
            <Link href="/dashboard">
              <Button variant="primary">
                Let’s brew a new batch
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
