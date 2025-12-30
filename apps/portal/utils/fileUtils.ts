
export const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type || 'image/png' });
};

export const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const getDominantColor = (imageUrl: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // We only need a tiny version to average the colors
            canvas.width = 1;
            canvas.height = 1;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve('transparent');
                return;
            }
            
            // Draw image scaled down to 1x1 pixel
            ctx.drawImage(img, 0, 0, 1, 1);
            
            // Get pixel data
            const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
            resolve(`rgb(${r}, ${g}, ${b})`);
        };

        img.onerror = () => {
            resolve('transparent');
        };
    });
};
