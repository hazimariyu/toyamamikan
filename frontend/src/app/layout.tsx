import './globals.css'

export const metadata = {
  title: '分身の返信 - 農家向け顧客管理システム',
  description: '高品質な農産物でファンを魅了する小規模農家のためのAIアシスタント',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
