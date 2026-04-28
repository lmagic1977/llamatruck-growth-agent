import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LLAMATRUCK Growth Agent',
  description: 'Facebook农民流量获取系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}
