import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kiki AI',
  description: 'Learn Kubernetes resilience through intelligent chaos engineering',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}