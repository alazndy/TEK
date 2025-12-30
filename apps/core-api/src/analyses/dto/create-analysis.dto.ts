import { AnalysisResult, Product, GeneralProvisions } from '@t-ecosystem/core-types';

export class CreateAnalysisDto implements Partial<AnalysisResult> {
    id!: string;
    version!: number;
    fileName!: string;
    timestamp!: string;
    products!: Product[];
    generalProvisions?: GeneralProvisions;
    summary!: string;
}
