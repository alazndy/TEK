import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'

// We need to mock zustand's create function before importing the store
vi.mock('zustand', async () => {
  const actual = await vi.importActual('zustand')
  return {
    ...actual,
    create: (fn: Function) => {
      const state = {}
      const setState = (newState: object) => Object.assign(state, newState)
      const getState = () => state
      const api = { setState, getState, subscribe: vi.fn() }
      
      // Initialize the store
      const initializer = fn(setState, getState, api)
      Object.assign(state, initializer)
      
      // Return a hook that gives access to the state
      const hook = (selector?: Function) => {
        if (selector) return selector(state)
        return state
      }
      hook.getState = getState
      hook.setState = setState
      return hook
    },
  }
})

// Mock Fuse.js
vi.mock('fuse.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    search: vi.fn().mockReturnValue([]),
  })),
}))

// Import after mocks
import { useDataStore } from '../data-store'
import type { Product, Equipment, Consumable } from '@/lib/types'

describe('useDataStore', () => {
  describe('Initial State', () => {
    it('should have empty arrays for all collections', () => {
      const state = useDataStore.getState()
      
      expect(state.products).toEqual([])
      expect(state.equipment).toEqual([])
      expect(state.consumables).toEqual([])
      expect(state.orders).toEqual([])
      expect(state.proposals).toEqual([])
      expect(state.logs).toEqual([])
      expect(state.warehouses).toEqual([])
    })

    it('should have loading states set to true initially', () => {
      const state = useDataStore.getState()
      
      expect(state.loadingProducts).toBe(true)
      expect(state.loadingEquipment).toBe(true)
      expect(state.loadingConsumables).toBe(true)
      expect(state.loadingOrders).toBe(true)
      expect(state.loadingProposals).toBe(true)
      expect(state.loadingLogs).toBe(true)
    })

    it('should have hasMore flags set to true initially', () => {
      const state = useDataStore.getState()
      
      expect(state.hasMoreProducts).toBe(true)
      expect(state.hasMoreEquipment).toBe(true)
      expect(state.hasMoreConsumables).toBe(true)
      expect(state.hasMoreOrders).toBe(true)
      expect(state.hasMoreProposals).toBe(true)
      expect(state.hasMoreLogs).toBe(true)
    })

    it('should have search state initialized correctly', () => {
      const state = useDataStore.getState()
      
      expect(state.allProductsLoaded).toBe(false)
      expect(state.searchResults).toEqual([])
      expect(state.isSearching).toBe(false)
    })

    it('should have isSeeding set to false', () => {
      const state = useDataStore.getState()
      
      expect(state.isSeeding).toBe(false)
    })
  })

  describe('Store Functions Existence', () => {
    it('should have all CRUD functions defined', () => {
      const state = useDataStore.getState()
      
      // Products
      expect(typeof state.fetchProducts).toBe('function')
      expect(typeof state.addProduct).toBe('function')
      expect(typeof state.updateProduct).toBe('function')
      expect(typeof state.deleteProduct).toBe('function')
      
      // Equipment
      expect(typeof state.fetchEquipment).toBe('function')
      expect(typeof state.addEquipment).toBe('function')
      expect(typeof state.updateEquipment).toBe('function')
      expect(typeof state.deleteEquipment).toBe('function')
      
      // Consumables
      expect(typeof state.fetchConsumables).toBe('function')
      expect(typeof state.addConsumable).toBe('function')
      expect(typeof state.updateConsumable).toBe('function')
      expect(typeof state.deleteConsumable).toBe('function')
    })

    it('should have order and proposal functions defined', () => {
      const state = useDataStore.getState()
      
      expect(typeof state.fetchOrders).toBe('function')
      expect(typeof state.addOrder).toBe('function')
      expect(typeof state.fetchProposals).toBe('function')
      expect(typeof state.addProposal).toBe('function')
    })

    it('should have warehouse functions defined', () => {
      const state = useDataStore.getState()
      
      expect(typeof state.fetchWarehouses).toBe('function')
      expect(typeof state.addWarehouse).toBe('function')
      expect(typeof state.deleteWarehouse).toBe('function')
    })

    it('should have search functions defined', () => {
      const state = useDataStore.getState()
      
      expect(typeof state.fetchAllProductsForSearch).toBe('function')
      expect(typeof state.searchProducts).toBe('function')
      expect(typeof state.clearSearch).toBe('function')
    })

    it('should have utility functions defined', () => {
      const state = useDataStore.getState()
      
      expect(typeof state.fetchAllData).toBe('function')
      expect(typeof state.fetchLogs).toBe('function')
      expect(typeof state.seedDatabase).toBe('function')
      expect(typeof state.finishPhysicalCount).toBe('function')
      expect(typeof state.migrateToDefaultWarehouse).toBe('function')
    })
  })

  describe('clearSearch', () => {
    it('should reset search state', () => {
      const state = useDataStore.getState()
      
      // First set some search state
      useDataStore.setState({
        searchResults: [{ id: '1', name: 'Test' }] as Product[],
        isSearching: true,
      })
      
      // Clear search
      state.clearSearch()
      
      const newState = useDataStore.getState()
      expect(newState.searchResults).toEqual([])
      expect(newState.isSearching).toBe(false)
    })
  })
})

describe('Store State Shape', () => {
  it('should match expected Product type structure', () => {
    const mockProduct: Product = {
      id: 'prod-1',
      name: 'Test Product',
      manufacturer: 'Test Manufacturer',
      stock: 10,
      room: 'A1',
      shelf: 'S1',
      barcode: '1234567890',
      category: 'Stok Malzemesi',
    }

    expect(mockProduct).toHaveProperty('id')
    expect(mockProduct).toHaveProperty('name')
    expect(mockProduct).toHaveProperty('manufacturer')
    expect(mockProduct).toHaveProperty('stock')
    expect(mockProduct).toHaveProperty('category')
  })

  it('should match expected Equipment type structure', () => {
    const mockEquipment: Equipment = {
      id: 'equip-1',
      name: 'Test Equipment',
      manufacturer: 'Test Manufacturer',
      stock: 1,
      room: 'B1',
      shelf: 'S2',
      barcode: '0987654321',
      category: 'Demirbaş',
    }

    expect(mockEquipment).toHaveProperty('id')
    expect(mockEquipment).toHaveProperty('category')
    expect(mockEquipment.category).toBe('Demirbaş')
  })

  it('should match expected Consumable type structure', () => {
    const mockConsumable: Consumable = {
      id: 'cons-1',
      name: 'Test Consumable',
      manufacturer: 'Test Manufacturer',
      stock: 100,
      room: 'C1',
      shelf: 'S3',
      barcode: '5555555555',
      category: 'Sarf Malzeme',
    }

    expect(mockConsumable).toHaveProperty('id')
    expect(mockConsumable).toHaveProperty('category')
    expect(mockConsumable.category).toBe('Sarf Malzeme')
  })
})
