import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with its provider by design
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      // Check if product already exists in cart
      const existingItem = prevItems.find((item) => item.id === product.id)
      if (existingItem) {
        // If exists, don't add duplicate (or increment quantity if needed)
        return prevItems
      }
      // Add new item to cart
      return [...prevItems, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || item.original_price || item.originalPrice || 0
      return total + price * (item.quantity || 1)
    }, 0)
  }

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + (item.quantity || 1), 0)
  }

  const isInCart = (productId) => {
    return cartItems.some((item) => item.id === productId)
  }

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isInCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
