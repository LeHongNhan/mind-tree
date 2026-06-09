import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mind Tree — Visual Thought Organizer',
  description: 'Organize your thoughts as interactive inverted trees. Track progress, add notes, and connect ideas across topics.',
  keywords: ['mind map', 'thought organizer', 'tree structure', 'knowledge management'],
  openGraph: {
    title: 'Mind Tree',
    description: 'Organize your thoughts as interactive inverted trees.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
