
import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker source using the same version as the library
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

export const convertPdfToImage = async (pdfFile: File): Promise<File> => {
    try {
        const arrayBuffer = await pdfFile.arrayBuffer();
        
        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        if (pdf.numPages === 0) {
            throw new Error("PDF dosyası boş.");
        }

        // Get the first page
        const page = await pdf.getPage(1);
        
        // --- SMART SCALING LOGIC ---
        // Get the unscaled (original) viewport first
        const unscaledViewport = page.getViewport({ scale: 1.0 });

        // Define a safe maximum dimension for standard browser canvases and AI input.
        // 3072px (3K) is high quality for architectural details but safe from "clipping".
        // Typical browsers choke or clip silently above 4096px or 8192px depending on GPU.
        const MAX_DIMENSION = 3072; 
        
        // Start with a high quality target scale
        let scale = 3.0; 

        // Calculate dimensions at target scale
        const targetWidth = unscaledViewport.width * scale;
        const targetHeight = unscaledViewport.height * scale;

        // If the resulting image would be larger than our safe max dimension, downscale the multiplier
        if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
            const scaleW = MAX_DIMENSION / unscaledViewport.width;
            const scaleH = MAX_DIMENSION / unscaledViewport.height;
            // Use the smaller scale factor to ensure BOTH dimensions fit
            scale = Math.min(scaleW, scaleH);
        }

        // Apply the calculated safe scale
        const viewport = page.getViewport({ scale });

        // Prepare canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (!context) {
            throw new Error("Canvas context oluşturulamadı.");
        }

        // Render PDF page into canvas context
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        await page.render(renderContext as any).promise;

        // Convert canvas to File object (PNG)
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    const fileName = pdfFile.name.replace(/\.pdf$/i, '.png');
                    const imageFile = new File([blob], fileName, { type: 'image/png' });
                    resolve(imageFile);
                } else {
                    reject(new Error("PDF görselleştirilemedi (Blob hatası)."));
                }
            }, 'image/png');
        });

    } catch (error: any) {
        console.error("PDF Convert Error:", error);
        throw new Error(`PDF işlenirken hata oluştu: ${error.message}`);
    }
};
