'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingCart, Sparkles, LayoutDashboard, Package, LogOut, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCartStore } from '@/stores/cart'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Profile } from '@/types'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const itemCount = useCartStore((s) => s.itemCount)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      } else {
        setProfile(null)
      }
    }

    fetchProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile()
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/')
    router.refresh()
  }

  const isAdmin = profile?.role === 'admin'
  const cartCount = itemCount()

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Sparkles className="h-5 w-5" />
          Halume
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/">
            <Button variant={pathname === '/' ? 'default' : 'ghost'} size="sm">
              Produk
            </Button>
          </Link>

          {isAdmin && (
            <Link href="/admin">
              <Button variant={pathname.startsWith('/admin') ? 'default' : 'ghost'} size="sm">
                <LayoutDashboard className="h-4 w-4 mr-1" />
                Admin
              </Button>
            </Link>
          )}

          <Link href="/cart" className="relative">
            <Button variant="ghost" size="sm">
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="sm">
                  {profile?.full_name || profile?.email || user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push('/orders')}>
                  <Package className="h-4 w-4 mr-2" />
                  Pesanan Saya
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button size="sm">
                <LogIn className="h-4 w-4 mr-1" />
                Masuk
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
