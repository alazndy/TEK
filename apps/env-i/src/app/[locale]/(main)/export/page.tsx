"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useDataStore } from '@/stores/data-store';
import { useCatalogStore } from '@/stores/catalog-store';
import { Download, Loader2, RefreshCw } from 'lucide-react';

export default function ExportPage() {
    const { products, fetchAllProductsForSearch, allProductsLoaded, loadingProducts } = useDataStore();
    const { items: catalogItems, fetchItems } = useCatalogStore();
    const [exporting, setExporting] = useState(false);

    const loadAllData = async () => {
        await fetchAllProductsForSearch();
        await fetchItems(true);
    };

    const exportProducts = () => {
        setExporting(true);
        
        // Create simplified export data
        const exportData = products.map(p => ({
            id: p.id,
            name: p.name,
            manufacturer: p.manufacturer,
            modelNumber: p.modelNumber || '',
            partNumber: p.partNumber || '',
            price: p.price || 0,
            stock: p.stock,
            barcode: p.barcode
        }));

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'envanter_products.json';
        a.click();
        URL.revokeObjectURL(url);
        setExporting(false);
    };

    const exportCatalog = () => {
        const exportData = catalogItems.map(c => ({
            model: c.model,
            manufacturer: c.manufacturer,
            description: c.description,
            price: c.price
        }));

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'catalog_items.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Find potential matches
    const findMatches = () => {
        const results: { productName: string; productModel: string; catalogModel: string; matched: boolean }[] = [];

        products.forEach(product => {
            const productModel = (product.modelNumber || '').toLowerCase().trim();
            const productName = (product.name || '').toLowerCase();
            
            let matched = false;
            let matchedCatalogModel = '';

            catalogItems.forEach(catalog => {
                const catalogModel = catalog.model.toLowerCase().trim();
                
                // Try different matching strategies
                if (productModel && productModel === catalogModel) {
                    matched = true;
                    matchedCatalogModel = catalog.model;
                } else if (productName.includes(catalogModel) || catalogModel.includes(productName.split(' ')[0])) {
                    matched = true;
                    matchedCatalogModel = catalog.model + ' (name match)';
                }
            });

            if (product.modelNumber || product.partNumber) {
                results.push({
                    productName: product.name,
                    productModel: product.modelNumber || product.partNumber || '-',
                    catalogModel: matchedCatalogModel || 'NO MATCH',
                    matched
                });
            }
        });

        return results;
    };

    const matches = allProductsLoaded && catalogItems.length > 0 ? findMatches() : [];
    const matchedCount = matches.filter(m => m.matched).length;

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Veri Analizi & Dışa Aktarım</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Envanter Verileri</CardTitle>
                        <CardDescription>Firebase'den yüklenen ürünler</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-2xl font-bold">{products.length} ürün</p>
                        <div className="flex gap-2">
                            <Button onClick={loadAllData} disabled={loadingProducts}>
                                {loadingProducts ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                Tüm Verileri Yükle
                            </Button>
                            <Button variant="outline" onClick={exportProducts} disabled={products.length === 0 || exporting}>
                                <Download className="mr-2 h-4 w-4" />
                                JSON İndir
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Katalog Verileri</CardTitle>
                        <CardDescription>Yüklenen katalog ürünleri</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-2xl font-bold">{catalogItems.length} ürün</p>
                        <Button variant="outline" onClick={exportCatalog} disabled={catalogItems.length === 0}>
                            <Download className="mr-2 h-4 w-4" />
                            JSON İndir
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {matches.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Eşleşme Analizi</CardTitle>
                        <CardDescription>
                            {matchedCount} / {matches.length} ürün eşleşti
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-96 overflow-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted sticky top-0">
                                    <tr>
                                        <th className="text-left p-2">Ürün Adı</th>
                                        <th className="text-left p-2">Model No</th>
                                        <th className="text-left p-2">Katalog Eşleşme</th>
                                        <th className="text-left p-2">Durum</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matches.slice(0, 50).map((m, i) => (
                                        <tr key={i} className={m.matched ? 'bg-green-500/10' : 'bg-red-500/10'}>
                                            <td className="p-2">{m.productName}</td>
                                            <td className="p-2 font-mono text-xs">{m.productModel}</td>
                                            <td className="p-2 font-mono text-xs">{m.catalogModel}</td>
                                            <td className="p-2">{m.matched ? '✅' : '❌'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
