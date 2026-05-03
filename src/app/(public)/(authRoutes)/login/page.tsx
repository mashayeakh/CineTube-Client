export const maxDuration = 60;
import { AuthFlipShell } from "@/components/auth-flip-shell"

interface LoginParams {
  searchParams: Promise<{ redirect?: string }>
}

export default async function LoginPage({ searchParams }: LoginParams) {

  const params = await searchParams;
  const redirectPath = params.redirect;

  return (
    <AuthFlipShell initialMode="login" LoginFormProps={{ redirectPath }} />
  )
}
