
import { GoogleGenAI, Modality, Part, GenerateContentParameters } from "@google/genai";
import { StylePreset, NavigationDirection } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
};

export const renderImageWithStyle = async (
    imageFile: File, 
    prompt: string,
    styleFile: File | null = null,
    stylePreset: StylePreset | null = null,
    isVariation: boolean = false,
    isEditing: boolean = false,
    navigationDirection?: NavigationDirection,
    resolution: '1K' | '2K' | '4K' = '1K',
    isUpscale: boolean = false
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Yüklenen görselin boyutlarını ve en boy oranını hesapla
    const imageBitmap = await createImageBitmap(imageFile);
    const { width, height } = imageBitmap;
    const aspectRatio = width / height;

    // Gemini için desteklenen en yakın Aspect Ratio'yu bul
    let targetAspectRatio = "1:1";
    if (Math.abs(aspectRatio - 1) < 0.1) targetAspectRatio = "1:1";
    else if (Math.abs(aspectRatio - (4/3)) < 0.15) targetAspectRatio = "4:3";
    else if (Math.abs(aspectRatio - (3/4)) < 0.15) targetAspectRatio = "3:4";
    else if (Math.abs(aspectRatio - (16/9)) < 0.15) targetAspectRatio = "16:9";
    else if (Math.abs(aspectRatio - (9/16)) < 0.15) targetAspectRatio = "9:16";
    else if (aspectRatio > 1) targetAspectRatio = "16:9";
    else targetAspectRatio = "9:16";

    const contentImageBase64 = await fileToBase64(imageFile);

    const parts: Part[] = [
        {
            inlineData: {
                data: contentImageBase64,
                mimeType: imageFile.type,
            },
        },
    ];

    const userPrompt = prompt || '';

    // Magic Upscaler forces use of the Pro model for maximum detail
    const isHighRes = resolution !== '1K' || isUpscale;
    const modelName = isHighRes ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

    const config: GenerateContentParameters['config'] = {
        responseModalities: [Modality.IMAGE],
        imageConfig: {
            aspectRatio: targetAspectRatio as any,
        }
    };
    
    if (isHighRes && config.imageConfig) {
        config.imageConfig.imageSize = isUpscale ? '4K' : resolution;
    }

    if (isUpscale) {
        config.systemInstruction = `
            IMAGE UPSCALING & REFINEMENT EXPERT.
            Task: Upscale and refine the input image to 4K resolution.
            
            STRICT RULES:
            1. GEOMETRY LOCK: Do NOT change the composition, camera angle, object placement, or architectural geometry. The output must perfectly align with the input.
            2. DETAIL ENHANCEMENT: Sharpen blurry textures, reduce noise, and add micro-details to surfaces (wood grain, concrete pores, fabric weave).
            3. FIDELITY: Maintain the original color palette and lighting atmosphere. This is a polishing pass, not a redesign.
            4. QUALITY: The output should look like a native high-resolution render, crisp and clear.
        `.trim();
        parts.push({ text: "Upscale this image to maximum clarity. Sharpen textures and details." });
    
    } else if (navigationDirection) {
        config.systemInstruction = "You are an AI scene explorer. The user provides an image and a directional command. Your task is to generate the next frame as if moving in that direction. Maintain perfect consistency in style, lighting, and object identity. The change in perspective should be subtle and realistic.";
        let navigationPromptText = '';
        switch (navigationDirection) {
            case 'forward': navigationPromptText = 'Generate a new view from the perspective of taking a small step forward into this scene. The view should be slightly zoomed in.'; break;
            case 'backward': navigationPromptText = 'Generate a new view from the perspective of taking a small step backward from this scene. The view should be slightly zoomed out.'; break;
            case 'left': navigationPromptText = 'Generate a new view from the perspective of panning the camera slightly to the left in this scene. Reveal more of what is to the left.'; break;
            case 'right': navigationPromptText = 'Generate a new view from the perspective of panning the camera slightly to the right in this scene. Reveal more of what is to the right.'; break;
            case 'up': navigationPromptText = 'Generate a new view from the perspective of tilting the camera slightly upwards in this scene. Reveal more of what is above.'; break;
            case 'down': navigationPromptText = 'Generate a new view from the perspective of tilting the camera slightly downwards in this scene. Reveal more of what is below.'; break;
        }
        parts.push({ text: navigationPromptText });

    } else if (isEditing) {
        config.systemInstruction = "You are an AI image editing expert performing an inpainting task. The user has provided an image with a solid pink area to be modified. This pink area represents multiple conceptual surfaces which the user has defined as 'layers'. Your task is to re-render the ENTIRE pink area based on the user's composite prompt, which describes each layer and its depth order (from furthest/background to closest/foreground). You must interpret these layers and their order to create a cohesive result that blends seamlessly with the surrounding image, respecting the existing perspective, lighting, and depth. Do not alter any part of the image outside the pink mask.";
        parts.push({ text: `Composite instructions for the masked area:\n"${userPrompt}"` });
    } else {
        let systemInstruction = "You are an AI architectural visualization specialist. Your primary and most critical task is to apply a new style to the user's input image while preserving its original structure with absolute fidelity. Do NOT add, remove, move, or alter any geometric elements, lines, or objects from the source image. This is not an interpretation; it is a direct re-styling. If the input is a technical drawing, section ('kesit'), or plan, you must treat every line as a definitive, immutable boundary. Your goal is ONLY to change the materials, lighting, textures, and overall artistic style, ensuring the underlying 3D structure remains identical to the source. OUTPUT HIGH RESOLUTION IMAGE.";
        
        if (resolution === '4K') {
            systemInstruction += " EXTREME DETAIL REQUIRED. Output strictly in 4K resolution with photo-realistic textures.";
        } else if (resolution === '2K') {
            systemInstruction += " HIGH DETAIL REQUIRED. Output strictly in 2K resolution.";
        }

        let finalPrompt = userPrompt;

        if (isVariation) {
            const variationInstruction = 'Generate a new image that is a slight variation of the provided image. Maintain the same overall style, composition, and subject, but introduce small, creative differences.';
            systemInstruction += ` ${variationInstruction}`;
            finalPrompt = `${variationInstruction} ${userPrompt}`.trim();
        } else if (stylePreset) {
            let presetInstruction = '';
            switch (stylePreset) {
                case 'realistic':
                    // Enhanced prompt for preserving existing materials while making them realistic
                    presetInstruction = `
                        You are a high-end texture artist and renderer.
                        TASK: Transform the input image into a hyper-realistic, ${resolution === '4K' ? '8k' : '4k'} photograph.
                        CRITICAL - MATERIAL FIDELITY:
                        1. Analyze the input image for EXISTING colors, patterns, and material indications (e.g., existing wood grain, brick patterns, fabric colors, floor tiles).
                        2. PRESERVE INTENT: You must RETAIN the specific color palette and texture patterns found in the source. Do not arbitrarily change colors (e.g., if a couch is green, keep it green; if a floor is oak, keep it oak).
                        3. UPGRADE, DON'T REPLACE: Instead of applying generic materials, treat the input as a "low-res" base. Apply Physically Based Rendering (PBR) properties to the *existing* visual elements.
                           - Turn flat red bricks into detailed, weathered red bricks with mortar depth.
                           - Turn flat blue carpet into plush blue velvet with realistic sheen.
                           - Turn grey surfaces into realistic concrete or stone based on context.
                        4. LIGHTING: Apply realistic global illumination, shadows, and reflections that interact accurately with these enhanced materials.
                        5. RESULT: The final image must look like a photograph of the exact scene provided, respecting the original design choices but with maximum realism.
                    `.trim();
                    break;
                case 'sketch':
                    presetInstruction = 'Transform the image into a detailed, hand-drawn pencil sketch style. Emphasize outlines, cross-hatching, shading, and texture. The result should look like it was drawn on paper.';
                    break;
                case 'site_plan':
                    presetInstruction = `
                        ARCHITECTURAL SITE PLAN GENERATION.
                        Task: Transform the provided line drawing/sketch into a professional, fully rendered architectural SITE PLAN (Vaziyet Planı).
                        
                        CRITICAL RULES:
                        1. VIEWPOINT: Strictly Top-Down 2D (Orthographic Plan View). Do NOT create a perspective view. Do NOT angle the camera.
                        2. STYLE: Professional architectural presentation board style (Digital Rendering). Clean, readable, and technical yet aesthetic.
                        3. LANDSCAPING (PEYZAJ): 
                           - Add varied vegetation: Trees (in top view/plan symbol style), bushes, and manicured lawns. 
                           - Use realistic greens and varying textures for grass.
                        4. HARDSCAPE: 
                           - Define roads, pathways, and plazas with realistic textures (asphalt, concrete pavers, stone).
                           - Add road markings (white lines) where appropriate for streets.
                        5. LIFE & SCALE:
                           - Add 'entourage' appropriate for a site plan: Cars (top view) on roads/parking.
                           - Subtle suggestions of people (top view dots/abstract figures) in pedestrian areas.
                        6. LIGHTING & SHADOWS:
                           - Cast 45-degree shadows from buildings and trees to indicate height and depth. This is crucial for readability.
                        
                        The output must look like a high-end competition entry panel.
                    `.trim();
                    break;
                case 'section':
                    presetInstruction = `
                        ARCHITECTURAL SECTION (KESIT) POST-PRODUCTION.
                        Task: Colorize, populate, and texture the provided technical section drawing without changing its geometry or scale.

                        STRICT CONSTRAINTS (DO NOT VIOLATE):
                        1. NO GEOMETRY CHANGE: Do NOT alter the walls, slabs, roofs, or existing lines. The structural shape must remain identical to the input.
                        2. NO PERSPECTIVE: Keep the view strictly 2D Orthographic. Do not add depth to the cut lines.
                        3. NO RESIZING: Preserve the aspect ratio and relative scale of elements.

                        CRITICAL - BLACK POCHÉ (CUT ELEMENTS):
                        * DETECTION: Identify all SOLID BLACK (or very dark) filled areas in the input drawing.
                        * INTERPRETATION: These black areas represent the "Cut" structural elements (Walls, Slabs, Foundations, Beams).
                        * ACTION: You must TEXTURE these solid black areas. Do NOT leave them as flat black, and do NOT turn them into white space. Apply a heavy structural texture (like dark grey reinforced concrete, cross-hatched insulation, or dark stone). They must look like solid matter separating the rooms.

                        REQUIRED ADDITIONS (ONLY ADD THESE):
                        1. ENTOURAGE & LIFE: Add 2D scale figures (people) performing activities appropriate for the spaces. They must be silhouettes or 2D cutouts, looking realistic but flat.
                        2. FURNITURE (TEFRIŞ): Add furniture (tables, chairs, lamps) to populate empty rooms, strictly in 2D side view.
                        3. ATMOSPHERE & SKY: Add a realistic or artistic sky background visible through windows and above the roof.
                        4. INTERIOR TEXTURES: Apply realistic textures to the floors and back walls of the rooms (wood, plaster, tiles), but keep the lines sharp.
                        5. SOIL: Render the earth/ground below the building with a soil/earth texture.

                        STYLE: "Post-Digital Collage" or High-end Architectural Visualization.
                    `.trim();
                    break;
            }
            systemInstruction += ` ${presetInstruction}`;
            finalPrompt = `${presetInstruction} ${userPrompt}`.trim();

        } else if (styleFile) {
            const styleImageBase64 = await fileToBase64(styleFile);
            parts.push({
                inlineData: {
                    data: styleImageBase64,
                    mimeType: styleFile.type,
                },
            });
            const styleInstruction = `
                STRICT VISUAL TRANSFER TASK:
                Input 1: Content Image (Geometry/Structure).
                Input 2: Visual Reference (Lighting, Textures, Atmosphere).

                Your goal is to re-render Input 1 using the EXACT visual language of Input 2.

                CRITICAL TRANSFER REQUIREMENTS:
                1. LIGHTING & TIME OF DAY: Analyze Input 2's lighting (e.g., sunny day, overcast, night, golden hour, studio lighting). You MUST apply this exact lighting condition to the Content Image.
                2. MATERIALS & TEXTURES: Observe the material quality in Input 2 (e.g., rough concrete, glossy metal, old brick). Apply these material characteristics to corresponding surfaces in the Content Image.
                3. COLOR PALETTE: Transfer the color grading, saturation, and white balance of Input 2.
                4. ATMOSPHERE: If Input 2 is moody/dark, the result must be moody/dark. If it's bright/airy, the result must be bright/airy.

                PRESERVE the geometry of Input 1 perfectly.
                COPY the visual essence of Input 2 perfectly.
            `;
            systemInstruction += ` ${styleInstruction}`;
            finalPrompt = `${styleInstruction} ${userPrompt}`.trim();
        }
        
        parts.push({ text: finalPrompt || 'Generate the image according to the instructions and reference images.' });
        config.systemInstruction = systemInstruction;
    }

    const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config,
    });
    
    if (!response || !response.candidates || response.candidates.length === 0) {
        throw new Error('API yanıtı geçersiz veya boş.');
    }
    
    const firstCandidate = response.candidates[0];
    
    if (!firstCandidate.content || !firstCandidate.content.parts || firstCandidate.content.parts.length === 0) {
        throw new Error('API yanıtında içerik bulunamadı.');
    }

    const imagePart = firstCandidate.content.parts.find(
        (part) => 'inlineData' in part && part.inlineData?.mimeType?.startsWith('image/')
    );

    if (imagePart && 'inlineData' in imagePart && imagePart.inlineData?.data && imagePart.inlineData.mimeType) {
        const base64ImageBytes = imagePart.inlineData.data;
        const mimeType = imagePart.inlineData.mimeType;
        return `data:${mimeType};base64,${base64ImageBytes}`;
    }
    
    throw new Error('API yanıtından görsel verisi alınamadı.');
};
