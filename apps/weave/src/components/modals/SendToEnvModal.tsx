import React, { useState, useEffect } from 'react';
import { X, Package, Search, Link as LinkIcon, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import { useInventorySync, InventoryProduct } from '../../hooks/useInventorySync';
import { ProductTemplate } from '../../types';

interface SendToEnvModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: ProductTemplate | null;
  templates: ProductTemplate[];
  setTemplates: (templates: ProductTemplate[]) => void;
  onLinkComplete: (template: ProductTemplate, targetProduct: InventoryProduct) => void;
}

export const SendToEnvModal: React.FC<SendToEnvModalProps> = ({
  isOpen,
  onClose,
  template,
  templates,
  setTemplates,
  onLinkComplete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const {
    products,
    isLoading,
    error,
    lastSyncTime,
    fetchProducts,
  } = useInventorySync({ templates, setTemplates });

  // Fetch products when modal opens
  useEffect(() => {
    if (isOpen && products.length === 0) {
      fetchProducts();
    }
  }, [isOpen, products.length, fetchProducts]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedProductId(null);
    }
  }, [isOpen]);

  if (!isOpen || !template) return null;

  const filteredProducts = products.filter(product => {
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      product.modelNumber?.toLowerCase().includes(term) ||
      product.manufacturer?.toLowerCase().includes(term) ||
      product.barcode?.toLowerCase().includes(term)
    );
  });

  const handleLink = () => {
    if (!selectedProductId) return;
    
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    if (confirm(`"${template.name}" şablonunu "${product.name}" ürünüyle eşleştirmek ve ENV-I'a göndermek üzeresiniz.\n\nEmin misiniz?`)) {
      onLinkComplete(template, product);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <LinkIcon className="text-primary" size={24} />
            <div>
              <h2 className="text-lg font-bold text-foreground">ENV-I ile Eşleştir ve Gönder</h2>
              <p className="text-xs text-muted-foreground">
                "{template.name}" şablonunu hangi ENV-I ürününe göndermek istersiniz?
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-lg transition"
            title="Kapat"
            aria-label="Kapat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Actions */}
        <div className="p-4 border-b border-border flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ürün adı, model veya barkod ile ara..."
              className="w-full bg-muted/50 border border-input rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:border-primary/50 outline-none"
            />
          </div>
          <button
            onClick={fetchProducts}
            disabled={isLoading}
            className="px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-lg flex items-center gap-2 text-sm font-medium transition disabled:opacity-50"
            title="Yenile"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive mb-4">
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <RefreshCw size={32} className="animate-spin mb-3" />
              <span className="text-sm">Envanter yükleniyor...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package size={32} className="mb-3 opacity-50" />
              <span className="text-sm font-medium">
                {searchTerm ? 'Arama sonucu bulunamadı' : 'Envanterde ürün bulunamadı'}
              </span>
            </div>
          ) : (
            <div className="grid gap-2">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProductId(product.id)}
                  className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${
                    selectedProductId === product.id
                      ? 'bg-primary/10 border-primary/50'
                      : 'bg-card border-border hover:bg-muted/50'
                  } border`}
                >
                  {/* Radio-like indicator */}
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                    selectedProductId === product.id
                      ? 'border-primary'
                      : 'border-muted-foreground'
                  }`}>
                    {selectedProductId === product.id && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>

                  {/* Product Image or Placeholder */}
                  <div className="w-10 h-10 rounded-lg bg-muted/50 border border-border flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                    ) : (
                      <Package size={16} className="text-muted-foreground" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {product.modelNumber && <span>{product.modelNumber}</span>}
                      {product.manufacturer && (
                        <>
                          <span className="text-muted-foreground/50">•</span>
                          <span>{product.manufacturer}</span>
                        </>
                      )}
                    </div>
                  </div>

                   {/* Already Linked Warning */}
                   {product.weaveTemplateId && product.weaveTemplateId !== template.id && (
                    <div className="text-[10px] text-yellow-600 dark:text-yellow-400 flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded">
                      <span>Başka şablona bağlı</span>
                    </div>
                  )}

                  {/* Stock Badge */}
                  <div className={`px-2 py-1 rounded-md text-xs font-bold ${
                    product.stock > 0 ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  }`}>
                    {product.stock}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/10 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {lastSyncTime && (
              <span>Son güncelleme: {lastSyncTime.toLocaleTimeString()}</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-muted-foreground hover:text-foreground text-sm font-medium transition"
            >
              İptal
            </button>
            <button
              onClick={handleLink}
              disabled={!selectedProductId}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Eşleştir ve Gönder
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
