'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/stores/cart'
import { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((s) => s.addItem)
  const supabase = createClient()

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single()
      setProduct(data)
      setLoading(false)
    }
    fetchProduct()
  }, [params.id])

  const handleAddToCart = () => {
    if (!product) return
    addItem(product, quantity)
    toast.success(`${product.name} ditambahkan ke keranjang`)
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
    <div className="h-8 w-32 bg-gray-200 rounded mb-4" />
    <div className="grid md:grid-cols-2 gap-8">
      <div className="aspect-square bg-gray-200 rounded-lg" />
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded" />
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        <div className="h-24 bg-gray-200 rounded" />
      </div>
    </div>
  </div>

  if (!product) return <div className="max-w-4xl mx-auto px-4 py-8 text-center">
    <p className="text-lg text-muted-foreground">Produk tidak ditemukan</p>
    <Button onClick={() => router.push('/')} className="mt-4">Kembali ke Beranda</Button>
  </div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingCart className="h-16 w-16" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {product.category && <Badge variant="secondary" className="w-fit">{product.category}</Badge>}
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Stok:</span>
            <Badge variant={product.stock > 0 ? 'secondary' : 'destructive'}>
              {product.stock > 0 ? `${product.stock} tersedia` : 'Habis'}
            </Badge>
          </div>

          {product.stock > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-medium">Jumlah:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline" size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline" size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="h-8 w-8"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Total: <span className="font-bold text-primary">{formatPrice(product.price * quantity)}</span>
              </p>
              <Button className="w-full" onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Tambah ke Keranjang
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
