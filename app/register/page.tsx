import { Suspense } from 'react'
import Register from '@/components/Register'

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-neutral-400">
          Loading...
        </div>
      }
    >
      <Register />
    </Suspense>
  )
}
