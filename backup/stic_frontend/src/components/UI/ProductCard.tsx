'use client'

import Image from 'next/image'
import '../../styles/productCard.css'
import { useRouter } from 'next/navigation'

interface Props {
  id: number
  image: string
  name: string
  price: number
}

export default function ProductCard({ id, image, name, price }: Props) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/productos/${id}`)
  }

  return (
    <div className="product-card" onClick={handleClick}>
      <Image 
        src={image} 
        alt={name} 
        width={200} 
        height={150} 
        className="product-image" 
      />
      <p className="product-name">{name}</p>
      <p className="product-price">Bs. {price}</p>
    </div>
  )
}
