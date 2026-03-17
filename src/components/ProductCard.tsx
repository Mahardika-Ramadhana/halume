'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useCartStore } from '@/stores/cart'
import { Product } from '@/types'
import { toast } from 'sonner'

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product)
    toast.success(`${product.name} ditambahkan ke keranjang`)
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Sparkles className="h-12 w-12" />
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Badge variant="destructive">Habis</Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {product.category && (
            <Badge variant="secondary" className="mb-2 text-xs">{product.category}</Badge>
          )}
          <h3 className="font-semibold text-sm line-clamp-2 mb-1">{product.name}</h3>
          <p className="text-lg font-bold text-primary">{formatPrice(product.price)}</p>
          <p className="text-xs text-muted-foreground mt-1">Stok: {product.stock}</p>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full"
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Tambah ke Keranjang
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
