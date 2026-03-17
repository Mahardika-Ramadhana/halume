'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Menunggu', variant: 'secondary' },
  processing: { label: 'Diproses', variant: 'default' },
  shipped: { label: 'Dikirim', variant: 'default' },
  delivered: { label: 'Selesai', variant: 'outline' },
  cancelled: { label: 'Dibatalkan', variant: 'destructive' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, product:products(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setOrders(data || [])
      setLoading(false)
    }
    fetchOrders()
  }, [])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-24 rounded-lg bg-gray-200 animate-pulse" />
      ))}
    </div>
  )

  if (orders.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
      <h2 className="text-xl font-semibold mb-2">Belum Ada Pesanan</h2>
      <p className="text-muted-foreground">Kamu belum pernah melakukan pemesanan</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pesanan Saya</h1>
      <div className="space-y-3">
        {orders.map((order) => {
          const status = STATUS_MAP[order.status] || { label: order.status, variant: 'secondary' as const }
          const isExpanded = expanded === order.id

          return (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-mono text-muted-foreground">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => setExpanded(isExpanded ? null : order.id)}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {order.order_items?.length || 0} item
                  </p>
                  <p className="font-bold text-primary">{formatPrice(order.total)}</p>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 space-y-2">
                  <div className="text-xs text-muted-foreground bg-gray-50 rounded p-2">
                    <p className="font-medium mb-1">Alamat Pengiriman:</p>
                    <p>{order.shipping_address}</p>
                  </div>
                  <div className="space-y-1">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.product?.name} x{item.quantity}</span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
