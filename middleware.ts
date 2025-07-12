import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Supabaseが設定されていない場合は認証チェックをスキップ
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Supabase未設定時は保護者ページへのアクセスを制限
    if (req.nextUrl.pathname.startsWith("/parent")) {
      return NextResponse.redirect(new URL("/auth", req.url))
    }
    return res
  }

  // Supabase設定済みの場合の認証チェック
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // リクエストヘッダーからトークンを取得
    const token = req.cookies.get("sb-access-token")?.value

    if (token) {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token)

      // 保護者ページへのアクセス時の認証チェック
      if (req.nextUrl.pathname.startsWith("/parent")) {
        if (!user || error) {
          return NextResponse.redirect(new URL("/auth", req.url))
        }
      }

      // 認証ページへのアクセス時、既にログイン済みの場合はリダイレクト
      if (req.nextUrl.pathname === "/auth") {
        if (user && !error) {
          return NextResponse.redirect(new URL("/parent", req.url))
        }
      }
    } else {
      // トークンがない場合
      if (req.nextUrl.pathname.startsWith("/parent")) {
        return NextResponse.redirect(new URL("/auth", req.url))
      }
    }
  } catch (error) {
    console.warn("Middleware auth check failed:", error)

    // エラーが発生した場合は保護者ページへのアクセスを制限
    if (req.nextUrl.pathname.startsWith("/parent")) {
      return NextResponse.redirect(new URL("/auth", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/parent/:path*", "/auth"],
}
