"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCatalogStore } from '@/stores/catalog-store';
import { useDataStore } from '@/stores/data-store';
import Papa from 'papaparse';
import { Upload, Trash2, FileSpreadsheet, Loader2, Database, RefreshCw } from 'lucide-react';
import { CatalogItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";


export default function CatalogPage() {
    const { items, uploadWithBatch, clearCatalog, fetchItems, loading } = useCatalogStore();
    const { syncPricesFromCatalog } = useDataStore();
    const { toast } = useToast();
    const [isParsing, setIsParsing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handlePriceSync = async () => {
        setIsSyncing(true);
        try {
            const catalogData = items.map(item => ({
                model: item.model,
                price: item.price,
                currency: item.currency || 'GBP'
            }));
            await syncPricesFromCatalog(catalogData);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleBrigadeLoad = async () => {
        setIsParsing(true);
        try {
            const response = await fetch('/data/catalogs/brigade.csv');
            if (!response.ok) throw new Error("Dosya bulunamadı");
            const csvText = await response.text();

            Papa.parse(csvText, {
                header: true,
                delimiter: ";",
                skipEmptyLines: true,
                complete: async (results) => {
                    const newItems: CatalogItem[] = [];
                    
                    results.data.forEach((row: any) => {
                        const model = row['Model'];
                        const description = row['Ürün Açıklaması (Description)'];
                        const priceRaw = row['Liste Fiyatı (GBP)'];

                        if (model && description) {
                            const cleanPrice = typeof priceRaw === 'string' 
                                ? parseFloat(priceRaw.replace(/[^0-9.]/g, "")) 
                                : Number(priceRaw);

                            newItems.push({
                                id: model, 
                                manufacturer: "Brigade",
                                model: model,
                                description: description,
                                price: isNaN(cleanPrice) ? null : cleanPrice,
                                currency: "GBP",
                                sourceFile: "brigade.csv",
                            });
                        }
                    });

                    if (newItems.length > 0) {
                        await uploadWithBatch(newItems);
                    } else {
                        toast({ title: "Uyarı", description: "Ürün bulunamadı.", variant: "destructive" });
                    }
                    setIsParsing(false);
                },
                error: (err: Error) => {
                    throw new Error(err.message);
                }
            });

        } catch (error: any) {
            console.error("Brigade load error:", error);
            toast({ title: "Hata", description: "Brigade listesi yüklenemedi: " + error.message, variant: "destructive" });
            setIsParsing(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsParsing(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const newItems: CatalogItem[] = [];
                
                results.data.forEach((row: any) => {
                     const manufacturer = row['Manufacturer'] || row['Brand'] || row['Marka'] || "Bilinmiyor";
                     const model = row['Model'] || row['Part Number'] || row['Parça No'] || "";
                     const description = row['Description'] || row['Product Name'] || row['Açıklama'] || "";
                     const priceRaw = row['Price'] || row['List Price'] || row['Fiyat'] || row['Liste Fiyatı (GBP)'] || "0";
                     
                     const cleanPrice = typeof priceRaw === 'string' ? parseFloat(priceRaw.replace(/[^0-9.]/g, "")) : Number(priceRaw);

                     if(model && description) {
                         newItems.push({
                             id:  model,
                             manufacturer,
                             model,
                             description,
                             price: isNaN(cleanPrice) ? null : cleanPrice,
                             currency: "GBP", 
                             sourceFile: file.name
                         });
                     }
                });

                setIsParsing(false);
                if (newItems.length > 0) {
                    await uploadWithBatch(newItems);
                } else {
                     toast({
                        title: "Uyarı",
                        description: "CSV dosyasından geçerli ürün okunamadı.",
                        variant: "destructive"
                    });
                }
            },
            error: (error) => {
                toast({
                    title: "Hata",
                    description: "CSV dosyası okunamadı: " + error.message,
                    variant: "destructive"
                });
                setIsParsing(false);
            }
        });
        
        event.target.value = '';
    };

    const filteredItems = items.filter(item => 
        item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
                <h2 className="text-3xl font-bold tracking-tight">Üretici Katalogları</h2>
                <div className="flex items-center space-x-2">
                    <Button 
                        variant="secondary" 
                        onClick={handleBrigadeLoad} 
                        disabled={isParsing || loading}
                    >
                         {isParsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                         Brigade Yükle
                    </Button>
                    <Button 
                        variant="default" 
                        onClick={handlePriceSync} 
                        disabled={isSyncing || loading || items.length === 0}
                    >
                         {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                         Envantere Senkronize Et
                    </Button>
                    <Button variant="destructive" onClick={clearCatalog} disabled={items.length === 0 || loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Temizle
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Toplam Ürün
                        </CardTitle>
                        <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Loader2 className="h-6 w-6 animate-spin" /> : items.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Veritabanında kayıtlı
                        </p>
                    </CardContent>
                </Card>
            </div>

            {items.length === 0 && !loading ? (
                 <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-4">
                         <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Katalog Yükle</h3>
                    <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
                        Henüz hiç katalog yüklenmemiş. Otomatik Brigade yüklemesini kullanabilir veya kendi dosyanızı seçebilirsiniz.
                    </p>
                    <div className="flex gap-4">
                        <Button onClick={handleBrigadeLoad} disabled={isParsing || loading}>
                            <Database className="mr-2 h-4 w-4" />
                            Brigade Yükle
                        </Button>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isParsing || loading}
                            />
                            <Button variant="outline" disabled={isParsing || loading}>
                                {isParsing || loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Dosya Seç (.csv)
                            </Button>
                        </div>
                    </div>
                 </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Ürün Listesi</CardTitle>
                        <CardDescription>Yüklenen kataloglardan arama yapın. "Envantere Senkronize Et" ile eşleşen ürünlere fiyat güncellemesi yapabilirsiniz.</CardDescription>
                         <div className="flex items-center py-4">
                            <Input
                            placeholder="Model, açıklama veya üretici ara..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="max-w-sm"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                         <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Üretici</TableHead>
                                        <TableHead>Model</TableHead>
                                        <TableHead>Açıklama</TableHead>
                                        <TableHead className="text-right">Liste Fiyatı</TableHead>
                                        <TableHead>Kaynak</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Loader2 className="h-6 w-6 animate-spin" /> Yükleniyor...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredItems.slice(0, 50).map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.manufacturer}</TableCell>
                                            <TableCell>{item.model}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell className="text-right">
                                                {item.price ? new Intl.NumberFormat('en-DE', { style: 'currency', currency: item.currency || 'GBP' }).format(item.price) : '-'}
                                            </TableCell>
                                            <TableCell><Badge variant="outline">{item.sourceFile}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                    {!loading && filteredItems.length > 50 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground p-4">
                                                ... ve {filteredItems.length - 50} daha fazla sonuç
                                            </TableCell>
                                        </TableRow>
                                    )}
                                     {!loading && filteredItems.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24">
                                                Sonuç bulunamadı.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                         </div>
                         <div className="mt-4 flex justify-end gap-2">
                             <Button variant="ghost" size="sm" onClick={handleBrigadeLoad} disabled={loading || isParsing}>
                                 <Database className="mr-2 h-4 w-4" />
                                 Brigade Yenile
                             </Button>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Button variant="outline" size="sm" disabled={loading || isParsing}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Yeni Liste Yükle
                                </Button>
                            </div>
                         </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
