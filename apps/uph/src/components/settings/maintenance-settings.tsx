'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Database } from "lucide-react";
import { db } from "@/lib/firebase";
import { writeBatch, doc } from "firebase/firestore";
import { useTranslations } from 'next-intl';

export function MaintenanceSettings() {
    const t = useTranslations('Settings');
    const [loading, setLoading] = useState(false);

    const seedData = async () => {
        setLoading(true);
        try {
            const batch = writeBatch(db);
            const projects = [
                { id: 'p1', name: 'Robot Arm Prototype', description: '6-DOF robotic arm.', status: 'Active', priority: 'High', startDate: '2024-01-15', deadline: '2024-06-30', manager: 'Turhan', completionPercentage: 45, budget: 5000, spent: 1200, tags: ['Robotics', 'Arduino'] },
                { id: 'p2', name: 'Home Automation', description: 'IoT based home automation.', status: 'Planning', priority: 'Medium', startDate: '2024-03-01', deadline: '2024-08-15', manager: 'Turhan', completionPercentage: 10, budget: 2000, spent: 0, tags: ['IoT', 'ESP32'] }
            ];
            const products = [
                 { id: 'prod1', name: 'Arduino Uno R3', category: 'Stok Malzemesi', manufacturer: 'Arduino', stock: 12, price: 150.00, totalAllocated: 1 },
                 { id: 'prod2', name: 'ESP32 DevKit V1', category: 'Stok Malzemesi', manufacturer: 'Espressif', stock: 5, price: 180.00, totalAllocated: 0 },
                 { id: 'prod3', name: 'SG90 Micro Servo', category: 'Stok Malzemesi', manufacturer: 'Tower Pro', stock: 2, price: 50.00, totalAllocated: 0 }
            ];
            const usages = [
                 { id: 'u1', projectId: 'p1', projectName: 'Robot Arm Prototype', productId: 'prod1', productName: 'Arduino Uno R3', quantity: 1, assignedDate: new Date().toISOString(), assignedBy: 'Admin', status: 'Active' }
            ];
    
            projects.forEach(p => batch.set(doc(db, 'projects', p.id), p));
            products.forEach(p => batch.set(doc(db, 'products', p.id), p));
            usages.forEach(u => batch.set(doc(db, 'project_usages', u.id), u));
    
            await batch.commit();
            alert(t('maintenance.seedSuccess'));
        } catch (error) {
            console.error(error);
            alert(t('maintenance.seedError'));
        } finally {
            setLoading(false);
        }
      };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('maintenance.title')}</CardTitle>
                <CardDescription>{t('maintenance.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={seedData} disabled={loading} variant="destructive">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                    {t('maintenance.resetData')}
                </Button>
            </CardContent>
        </Card>
    );
}
