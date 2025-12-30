import { describe, it, expect, vi } from 'vitest'
import { cn, createStore } from '../utils'

describe('cn (className utility)', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const isDisabled = false
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active')
  })

  it('should merge Tailwind classes correctly', () => {
    // tailwind-merge should deduplicate conflicting classes
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('should handle undefined and null values', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end')
  })

  it('should handle empty string', () => {
    expect(cn('')).toBe('')
  })

  it('should handle object syntax from clsx', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })

  it('should handle array syntax', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })
})

describe('createStore', () => {
  it('should initialize with the provided state', () => {
    const store = createStore({ count: 0, name: 'test' })
    expect(store.getState()).toEqual({ count: 0, name: 'test' })
  })

  it('should update state with setState', () => {
    const store = createStore({ count: 0 })
    store.setState({ count: 5 })
    expect(store.getState().count).toBe(5)
  })

  it('should merge state partially', () => {
    const store = createStore({ count: 0, name: 'test' })
    store.setState({ count: 10 })
    expect(store.getState()).toEqual({ count: 10, name: 'test' })
  })

  it('should notify subscribers on state change', () => {
    const store = createStore({ count: 0 })
    const listener = vi.fn()
    
    store.subscribe(listener)
    store.setState({ count: 1 })
    
    expect(listener).toHaveBeenCalledWith({ count: 1 })
  })

  it('should allow unsubscribing', () => {
    const store = createStore({ count: 0 })
    const listener = vi.fn()
    
    const unsubscribe = store.subscribe(listener)
    unsubscribe()
    store.setState({ count: 1 })
    
    expect(listener).not.toHaveBeenCalled()
  })

  it('should notify multiple subscribers', () => {
    const store = createStore({ value: 'initial' })
    const listener1 = vi.fn()
    const listener2 = vi.fn()
    
    store.subscribe(listener1)
    store.subscribe(listener2)
    store.setState({ value: 'updated' })
    
    expect(listener1).toHaveBeenCalledWith({ value: 'updated' })
    expect(listener2).toHaveBeenCalledWith({ value: 'updated' })
  })
})
