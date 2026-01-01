
import { parseWeaveBOM } from '../lib/weave';

describe('Weave BOM Parser', () => {
    it('should parse a flat array of components', () => {
        const json = JSON.stringify([
            {
                designator: 'R1',
                component: 'Resistor 10k',
                package: '0603',
                quantity: 5,
                supplier: 'DigiKey',
                supplierPartNumber: 'R10K-0603'
            }
        ]);

        const result = parseWeaveBOM(json);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            designator: 'R1',
            component: 'Resistor 10k',
            package: '0603',
            quantity: 5,
            supplier: 'DigiKey',
            supplierPartNumber: 'R10K-0603'
        });
    });

    it('should parse a nested project BOM structure', () => {
        const json = JSON.stringify({
            projectName: 'My PCB',
            bom: [
                {
                    ref: 'U1',
                    value: 'ESP32',
                    footprint: 'QFN-48',
                    quantity: 1
                }
            ]
        });

        const result = parseWeaveBOM(json);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            designator: 'U1',
            component: 'ESP32',
            package: 'QFN-48',
            quantity: 1,
            supplier: undefined,
            supplierPartNumber: undefined
        });
    });

    it('should handle invalid JSON gracefully', () => {
        const invalidJson = "{ invalid: ";
        expect(() => parseWeaveBOM(invalidJson)).toThrow("Failed to parse file");
    });
});
