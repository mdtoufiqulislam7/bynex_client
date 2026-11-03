import { Suspense } from 'react'
import Register from '@/components/Register'

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          Loading...
        </div>
      }
    >
      <Register />
    </Suspense>
  )
}
