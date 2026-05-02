import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { APP_NAME, APP_TAGLINE } from '@/lib/branding'
import { Mail } from 'lucide-react'
import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{APP_NAME}</h1>
            <p className="text-sm text-muted-foreground">{APP_TAGLINE}</p>
          </div>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Check your email</CardTitle>
              <CardDescription>
                We&apos;ve sent you a confirmation link. Please check your email to verify your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link
                href="/auth/login"
                className="text-sm underline underline-offset-4 hover:text-primary"
              >
                Back to sign in
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
