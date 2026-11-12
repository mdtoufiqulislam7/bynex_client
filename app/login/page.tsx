import { Suspense } from 'react'
import Login from '@/components/Login'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-neutral-400">
          Loading...
        </div>
      }
    >
      <Login />
    </Suspense>
  )
}
