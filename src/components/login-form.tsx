/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"

import { ILoginPayload, loginZodSchema } from "@/zod/auth.validation"
import { loginAction } from "@/app/(public)/(authRoutes)/login/_action/loginAction"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: ILoginPayload) => loginAction(payload),
  })

  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },

    onSubmit: async ({ value }) => {
      setServerError(null)

      const parsedPayload = loginZodSchema.safeParse(value)
      if (!parsedPayload.success) {
        setServerError(parsedPayload.error.issues[0]?.message || "Please provide valid credentials")
        return
      }

      try {
        const result = (await mutateAsync(parsedPayload.data)) as any
        if (!result.success) {
          setServerError(result.message || "Login failed")
          return
        }
        queryClient.invalidateQueries({ queryKey: ["user"] })
      } catch (error: any) {
        console.error("Login failed:", error)
        setServerError("An unexpected error occurred. Please try again. " + (error.message || ""))
      }
    },
  })

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <FieldGroup>
              {serverError && (
                <FieldDescription className="text-destructive">
                  {serverError}
                </FieldDescription>
              )}

              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) => {
                    const result = loginZodSchema.shape.email.safeParse(value)
                    return result.success ? undefined : result.error.issues[0]?.message
                  },
                }}
              >
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="m@example.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      required
                    />
                    {field.state.meta.errors.length > 0 && (
                      <FieldDescription className="text-destructive">
                        {String(field.state.meta.errors[0])}
                      </FieldDescription>
                    )}
                  </Field>
                )}
              </form.Field>

              <form.Field
                name="password"
                validators={{
                  onChange: ({ value }) => {
                    const result = loginZodSchema.shape.password.safeParse(value)
                    return result.success ? undefined : result.error.issues[0]?.message
                  },
                }}
              >
                {(field) => (
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Link
                        href="/login"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      required
                    />
                    {field.state.meta.errors.length > 0 && (
                      <FieldDescription className="text-destructive">
                        {String(field.state.meta.errors[0])}
                      </FieldDescription>
                    )}
                  </Field>
                )}
              </form.Field>

              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Logging in..." : "Login"}
                </Button>
                <Button variant="outline" type="button" disabled={isPending}>
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <Link href="/signup">Signsdfsdfds up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
