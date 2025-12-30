
export function categorizeProduct(name: string, description: string = ''): string {
    const text = (name + ' ' + description).toLowerCase();
    
    // 1. TOP PRIORITY: SISTEMLER (Kits, Systems, Bundles)
    const systemPrefixes = ['se-', 'bn360', 'mdr-', 'dc-', 'qvs-', 'sa-', 'bc-', 'ba-', 'se7', 'ses-', 'bss-', 'zs-', 'fr-'];
    const systemKeywords = ['kit', 'system', 'sistem', 'bundle', 'pack', 'complete', 'indicator', 'alarm', 'intercom', 'recorder', 'recording', 'dvs', 'pss'];
    
    if (systemPrefixes.some(p => text.includes(p)) || systemKeywords.some(k => text.includes(k))) {
        if (text.includes('cable') || text.includes('kablo') || text.includes('harness') || text.includes('lead') || text.includes('sk-')) return 'Kablo';
        if (text.includes('bracket') || text.includes('mount') || text.includes('bkt') || text.includes('housing') || text.includes('stand')) return 'Aksesuar';
        return 'Sistem';
    }

    // 2. SECOND PRIORITY: KABLO VE BAĞLANTI
    const cablePrefixes = ['be-l', 'vbv-l', 'sk-', 'sc-', 'vsp-', 'pic-', 'dcx', 'ca-', 'ac-', 'sk-', 'vbv-h'];
    const cableKeywords = ['cable', 'kablo', 'harness', 'coiled', 'lead', 'wire', 'cord', 'kablaj', 'ext', 'extension', 'tail', 'pigtail'];

    if (cablePrefixes.some(p => text.includes(p)) || cableKeywords.some(k => text.includes(k))) {
        return 'Kablo';
    }

    // 3. THIRD PRIORITY: AKSESUARLAR
    const accessoryPrefixes = ['bmm-', 'bkt-', 'sm-', 'ram-', 'uds-', 'ac-', 'bse-', 'bsc-'];
    const accessoryKeywords = ['bracket', 'braket', 'mount', 'montaj', 'housing', 'gasket', 'fitting', 'screw', 'nut', 'bolt', 'washer', 'stand', 'cover', 'case', 'pad', 'mat', 'tool', 'remote', 'shield', 'enclosure', 'software', 'usb'];

    if (accessoryPrefixes.some(p => text.includes(p)) || accessoryKeywords.some(k => text.includes(k))) {
        return 'Aksesuar';
    }

    // 4. FOURTH PRIORITY: ADAPTÖRLER
    if (text.includes('adapter') || text.includes('adaptör') || text.includes('adpt') || text.includes('converter') || text.includes('con') || text.includes('jack') || text.includes('plug') || text.includes('socket') || text.includes('conn')) {
        return 'Adaptör';
    }

    // 5. FIFTH PRIORITY: ANA BİLEŞENLER
    
    // Sensor
    if (text.includes('bs-') || text.includes('zs-') || text.includes('ss-') || text.includes('cs-') || text.includes('fr-') || text.includes('rp-') || text.includes('sensor') || text.includes('sensör') || text.includes('radar') || text.includes('ultrasonic') || text.includes('detection') || text.includes('sidescan') || text.includes('backsense') || text.includes('zonesafe')) {
        return 'Sensor';
    }

    // Monitor
    if (text.includes('be-m') || text.includes('vbv-m') || text.includes('mon') || text.includes('lcd') || text.includes('display') || text.includes('screen') || text.includes('ekran') || text.includes('select 7') || text.includes('elite 7')) {
        return 'Monitor';
    }

    // Camera
    if (text.includes('be-c') || text.includes('vbv-c') || text.includes('md-') || text.includes('ip-') || text.includes('ai-') || text.includes('camera') || text.includes('kamera') || text.includes('cam') || text.includes('dome') || text.includes('eyeball') || text.includes('shutter')) {
        return 'Kamera';
    }
    
    return 'Diğer';
}
