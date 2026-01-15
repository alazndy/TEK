"use client"

import { useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useDataStore } from '@/stores/data-store';
import { Product, Order } from '@/lib/types';

export function useFirestoreListeners() {
  const syncProducts = useDataStore((state) => state.syncProducts);
  const syncOrders = useDataStore((state) => state.syncOrders);
  
  // Real-time listener for Products
  useEffect(() => {
    // Listening to the first 500 products
    const q = query(collection(db, "products"), orderBy("name"), limit(500));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products: Product[] = [];
      snapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });
      console.log(`[RealTime] Synced ${products.length} products`);
      syncProducts(products);
    }, (error) => {
        console.error("Error listening to products:", error);
    });

    return () => unsubscribe();
  }, [syncProducts]);

  // Real-time listener for Orders
  useEffect(() => {
    // Listening to recent orders
    const q = query(collection(db, "orders"), orderBy("date", "desc"), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });
      console.log(`[RealTime] Synced ${orders.length} orders`);
      syncOrders(orders);
    }, (error) => {
        console.error("Error listening to orders:", error);
    });

    return () => unsubscribe();
  }, [syncOrders]);
}
