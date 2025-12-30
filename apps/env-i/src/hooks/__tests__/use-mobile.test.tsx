import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '../use-mobile'

describe('useIsMobile', () => {
  const originalInnerWidth = window.innerWidth

  beforeEach(() => {
    // Reset to desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
  })

  it('should return false for desktop width (>= 768px)', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)
  })

  it('should return true for mobile width (< 768px)', () => {
    Object.defineProperty(window, 'innerWidth', { value: 600, configurable: true })
    
    const { result } = renderHook(() => useIsMobile())
    
    // Trigger the effect
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    
    expect(result.current).toBe(true)
  })

  it('should return false for exactly 768px (breakpoint)', () => {
    Object.defineProperty(window, 'innerWidth', { value: 768, configurable: true })
    
    const { result } = renderHook(() => useIsMobile())
    
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    
    expect(result.current).toBe(false)
  })

  it('should update when window is resized', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)
    
    // Simulate resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true })
      window.dispatchEvent(new Event('resize'))
    })
    
    expect(result.current).toBe(true)
    
    // Simulate resize back to desktop
    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true })
      window.dispatchEvent(new Event('resize'))
    })
    
    expect(result.current).toBe(false)
  })

  it('should cleanup resize listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    
    const { unmount } = renderHook(() => useIsMobile())
    
    unmount()
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    
    removeEventListenerSpy.mockRestore()
  })
})
