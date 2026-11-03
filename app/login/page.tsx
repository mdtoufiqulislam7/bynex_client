import { Suspense } from 'react'
import Login from '@/components/Login'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          Loading...
        </div>
      }
    >
      <Login />
    </Suspense>
  )
}
