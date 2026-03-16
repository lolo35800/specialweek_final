import type { ReactNode } from 'react'
import './MasonryGrid.css'

interface Props {
  children: ReactNode
  columns?: number
}

export function MasonryGrid({ children, columns = 3 }: Props) {
  return (
    <div
      className="masonry-grid"
      style={{ '--columns': columns } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
