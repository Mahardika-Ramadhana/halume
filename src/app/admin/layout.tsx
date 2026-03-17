import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingBag } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="w-56 bg-white border-r p-4 space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Admin</p>
        <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium">
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
        <Link href="/admin/products" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium">
          <Package className="h-4 w-4" />
          Produk
        </Link>
        <Link href="/admin/orders" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium">
          <ShoppingBag className="h-4 w-4" />
          Pesanan
        </Link>
      </aside>
      <div className="flex-1 p-6 overflow-auto">
        {children}
      </div>
    </div>
  )
}
