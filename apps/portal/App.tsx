import React from 'react';
import { motion } from 'framer-motion';
import { 
    LayoutGrid, 
    Box, 
    Database, 
    ShoppingCart, 
    Users, 
    Image as ImageIcon, 
    BarChart2, 
    ExternalLink,
    Terminal,
    Search
} from 'lucide-react';

interface AppCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    url: string;
    port: number;
    color: string;
    status?: 'online' | 'offline';
}

const apps = [
    {
        title: "ENV-I",
        description: "Envanter ve ERP Yönetimi",
        icon: Box,
        url: "http://localhost:3000",
        port: 3000,
        color: "text-blue-400"
    },
    {
        title: "UPH",
        description: "Unified Project Hub",
        icon: LayoutGrid,
        url: "http://localhost:3002",
        port: 3002,
        color: "text-purple-400"
    },
     {
        title: "Weave",
        description: "Takım İletişimi ve Proje Yönetimi",
        icon: Users,
        url: "http://localhost:3004",
        port: 3004,
        color: "text-green-400"
    },
    {
        title: "T-Market",
        description: "Modül ve Eklenti Pazarı",
        icon: ShoppingCart,
        url: "http://localhost:3003",
        port: 3003,
        color: "text-orange-400"
    },
    {
        title: "Renderci",
        description: "AI Görselleştirme Stüdyosu",
        icon: ImageIcon,
        url: "http://localhost:3005",
        port: 3005,
        color: "text-pink-400"
    },
    {
        title: "T-SA",
        description: "Teknik Şartname Analizi",
        icon: BarChart2,
        url: "http://localhost:3006",
        port: 3006,
        color: "text-cyan-400"
    },
    {
        title: "Core API",
        description: "Merkezi Backend Servisi",
        icon: Database,
        url: "http://localhost:3001/api",
        port: 3001,
        color: "text-yellow-400"
    }
];

const AppCard: React.FC<AppCardProps> = ({ title, description, icon: Icon, url, port, color }) => {
    return (
        <motion.a 
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="glass-card p-6 flex flex-col h-full relative group"
        >
            <div className={`absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity ${color}`}>
                <ExternalLink size={20} />
            </div>
            
            <div className={`p-3 rounded-2xl bg-white/5 w-fit mb-4 ${color}`}>
                <Icon size={32} />
            </div>
            
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-muted-foreground text-sm mb-6 flex-grow">{description}</p>
            
            <div className="flex items-center gap-2 text-xs font-mono text-white/30 bg-black/20 p-2 rounded-lg w-fit">
                <Terminal size={12} />
                <span>:{port}</span>
            </div>
        </motion.a>
    );
};

const App: React.FC = () => {
    return (
        <div className="min-h-screen p-8 lg:p-16 flex flex-col max-w-7xl mx-auto">
            <header className="mb-16">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-5xl lg:text-7xl font-black tracking-tighter mb-4 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                        Unified Portal
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        T-Ecosystem uygulamaları için merkezi erişim noktası. Tüm servisleriniz tek bir yerde.
                    </p>
                </motion.div>
                
                <div className="mt-8 relative max-w-md">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Uygulama ara..." 
                        className="glass-panel w-full py-3 pl-10 pr-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-gray-500"
                    />
                </div>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {apps.map((app, index) => (
                    <motion.div
                        key={app.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <AppCard {...app} />
                    </motion.div>
                ))}
            </main>

            <footer className="mt-20 border-t border-white/5 pt-8 text-center text-sm text-muted-foreground">
                <p>© 2025 T-Ecosystem. Tüm hakları saklıdır.</p>
                <div className="flex justify-center gap-4 mt-4 text-xs font-mono">
                    <span>v0.9.0-beta</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        System Online
                    </span>
                </div>
            </footer>
        </div>
    );
};

export default App;
