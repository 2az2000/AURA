import { lazy } from 'react'

/** The product film is its own chunk: the homepage never downloads it unless you go there. */
export const productImport = () => import('./ProductPage')
export const ProductPage = lazy(productImport)
/** Warm the chunk (hover/focus on a link to /product, or browser idle time). */
export const prefetchProduct = () => void productImport()
