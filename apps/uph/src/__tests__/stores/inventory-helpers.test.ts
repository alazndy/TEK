
// Helper logic to be tested (mocking store state)
const calculateAvailableStock = (product: any, usages: any[]) => {
    const allocated = usages
        .filter(u => u.productId === product.id && u.status === 'Active')
        .reduce((sum, u) => sum + u.quantity, 0);
    return product.stock - allocated;
};

describe('Inventory Logic Helpers', () => {
    it('should calculate available stock correctly', () => {
        const product = { id: 'p1', stock: 100 };
        const usages = [
            { productId: 'p1', quantity: 10, status: 'Active' },
            { productId: 'p1', quantity: 5, status: 'Active' },
            { productId: 'p1', quantity: 20, status: 'Returned' }, // Should be ignored
            { productId: 'p2', quantity: 50, status: 'Active' }   // Should be ignored
        ];

        const available = calculateAvailableStock(product, usages);
        // 100 - (10 + 5) = 85
        expect(available).toBe(85);
    });

    it('should handle zero stock', () => {
        const product = { id: 'p1', stock: 0 };
        const usages: any[] = [];
        expect(calculateAvailableStock(product, usages)).toBe(0);
    });
});
