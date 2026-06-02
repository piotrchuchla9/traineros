'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export function NavigationProgress() {
  const pathname = usePathname()
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevPathname = useRef(pathname)
  const completing = useRef(false)

  function start() {
    if (completing.current) return
    if (timer.current) clearInterval(timer.current)
    setVisible(true)
    let w = 8
    setWidth(w)
    timer.current = setInterval(() => {
      w += Math.random() * 12
      if (w >= 85) { clearInterval(timer.current!); w = 85 }
      setWidth(w)
    }, 250)
  }

  function complete() {
    if (timer.current) clearInterval(timer.current)
    completing.current = true
    setWidth(100)
    setTimeout(() => {
      setVisible(false)
      setWidth(0)
      completing.current = false
    }, 300)
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest('a')
      if (!a) return
      const href = a.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return
      if (href === pathname) return
      start()
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [pathname])

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname
      complete()
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div
      className="fixed top-0 left-0 z-50 h-0.5 bg-primary transition-[width] duration-200 ease-out"
      style={{ width: `${width}%` }}
    />
  )
}
