'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'

const STATUSES = [
  { value: 'pending', label: 'Menunggu', variant: 'secondary' as const },
  { value: 'processing', label: 'Diproses', variant: 'default' as const },
  { value: 'shipped', label: 'Dikirim', variant: 'default' as const },
  { value: 'delivered', label: 'Selesai', variant: 'outline' as const },
  { value: 'cancelled', label: 'Dibatalkan', variant: 'destructive' as const },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const supabase = createClient()

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(name, price))')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  const handleStatusChange = async (orderId: string | null, status: string) => {
    if (!orderId) return
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) {
      toast.error('Gagal mengubah status')
    } else {
      toast.success('Status pesanan diperbarui')
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: status as Order['status'] } : o))
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)

  const getStatus = (value: string) => STATUSES.find((s) => s.value === value) || STATUSES[0]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manajemen Pesanan</h1>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Belum ada pesanan
                  </TableCell>
                </TableRow>
              ) : orders.map((order) => {
                const status = getStatus(order.status)
                const isExpanded = expanded === order.id

                return (
                  <>
                    <TableRow key={order.id}>
                      <TableCell>
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => setExpanded(isExpanded ? null : order.id)}
                        >
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <Select value={order.status ?? 'pending'} onValueChange={(v) => v && handleStatusChange(order.id, v)}>
                          <SelectTrigger className="h-7 w-36">
                            <SelectValue>
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                <Badge variant={s.variant}>{s.label}</Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`${order.id}-detail`}>
                        <TableCell colSpan={5} className="bg-gray-50 p-4">
                          <p className="text-xs text-muted-foreground mb-2">
                            <strong>Alamat:</strong> {order.shipping_address}
                          </p>
                          <div className="space-y-1">
                            {order.order_items?.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.product?.name} × {item.quantity}</span>
                                <span>{formatPrice(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
