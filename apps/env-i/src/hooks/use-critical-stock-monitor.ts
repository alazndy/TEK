"use client"

import { useEffect, useRef } from 'react';
import { useDataStore } from '@/stores/data-store';
import { useNotificationStore } from '@/stores/notification-store';
import { Product } from '@/lib/types';
import { sendToSlack, formatCriticalStockMessage } from '@/lib/slack';

export function useCriticalStockMonitor() {
    const products = useDataStore((state) => state.products);
    const settings = useDataStore((state) => state.settings); // Get Settings for Slack URL
    const { addNotification, notifications } = useNotificationStore();
    
    // Use a ref to track which products have already triggered a notification in this session
    // to avoid spamming the user on every render or refresh.
    // In a real app, this might be stored in localStorage with timestamps.
    const notifiedProductsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (products.length === 0) return;

        products.forEach((product: Product) => {
            // Default minStock to 5 if not set, to ensure functionality is visible
            const threshold = product.minStock !== undefined ? product.minStock : 5;
            
            if (product.stock <= threshold) {
                
                // Check if already notified
                if (!notifiedProductsRef.current.has(product.id)) {
                    
                    // Double check against existing notifications in store to be safe (persistence)
                    const alreadyExists = notifications.some(
                        n => n.title === "Kritik Stok Uyarısı" && n.message.includes(product.name) && !n.read
                    );

                    if (!alreadyExists) {
                        addNotification({
                            title: "Kritik Stok Uyarısı",
                            message: `${product.name} stoğu kritik seviyenin altında! (${product.stock} adet)`,
                            type: "warning",
                            link: "/inventory"
                        });
                        
                        // Send to Slack if enabled
                        if (settings?.slackIntegration && settings?.slackWebhookUrl) {
                            // Using window.location.origin to get base URL for the link
                            const productUrl = `${window.location.origin}/inventory?product=${product.id}`;
                            const slackMessage = formatCriticalStockMessage(product.name, product.stock, product.minStock || 0, productUrl);
                            sendToSlack(settings.slackWebhookUrl, slackMessage);
                        }

                        // Add to ref to prevent duplicate in this session
                        notifiedProductsRef.current.add(product.id);
                    }
                }
            }
        });
    }, [products, addNotification, notifications, settings]);
}
