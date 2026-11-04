const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Master Güvenlik Anahtarı (Tüm sistemin ortak şifreleme katmanı)
const MASTER_API_KEY = process.env.API_SECRET || "EVTOL-BIO-NEXUS-MASTER-KEY-2026";

// Küresel Güvenlik Middleware
app.use((req, res, next) => {
    if (req.path === '/' || req.path === '/health') return next();
    
    const clientKey = req.headers['x-api-key'] || req.headers['x-bio-key'];
    if (clientKey !== MASTER_API_KEY) {
        return res.status(401).json({
            status: "error",
            code: "UNAUTHORIZED_ACCESS",
            message: "Güvenlik İhlali: Geçersiz veya eksik Master API Anahtarı."
        });
    }
    next();
});

// Birleşik Sistem Durum Matrisi (eVTOL Filosu + 2050 Biyolojik Ağ)
let globalSystemState = {
    system_version: "2050.Omnipresent.UnifiedCore",
    evtol_fleet: {
        status: "STANDBY",
        armed: false,
        offboard_active: false,
        battery: 98.5,
        position: { x: 0.0, y: 0.0, z: 0.0 }
    },
    bio_nexus: {
        active_hospitals: 1420,
        monitored_subjects: 854000,
        entropy_index: 0.02
    },
    last_sync: Date.now()
};

// 1. Sistem Sağlık Kontrolü
app.get('/', (req, res) => {
    res.json({
        status: "online",
        system: "eVTOL-Industry & Bio-Nexus 2050 Unified Engine",
        uptime: process.uptime()
    });
});

// ==========================================
// BÖLÜM A: eVTOL & JETSON ORIN / ROS 2 API
// ==========================================

app.get('/api/v1/telemetry', (req, res) => {
    res.json({ status: "success", data: globalSystemState.evtol_fleet });
});

app.post('/api/v1/set-position', (req, res) => {
    const { x, y, z, yaw } = req.body;
    if (x === undefined || y === undefined || z === undefined) {
        return res.status(400).json({ status: "error", message: "Eksik koordinat verisi." });
    }
    globalSystemState.evtol_fleet.position = { x, y, z };
    console.log(`[eVTOL SETPOINT] X: ${x}, Y: ${y}, Z: ${z}`);
    res.json({ status: "success", dispatched: true, setpoint: { x, y, z, yaw: yaw || 0 } });
});

app.post('/api/v1/enable', (req, res) => {
    const { enable } = req.body;
    globalSystemState.evtol_fleet.offboard_active = !!enable;
    console.log(`[eVTOL OFFBOARD] ${enable ? "AKTİF" : "PASİF"}`);
    res.json({ status: "success", offboard_state: enable ? "ENABLED" : "DISABLED" });
});

app.post('/api/v1/ai/command', (req, res) => {
    const { intent, parameters, confidence } = req.body;
    if (confidence && confidence < 0.85) {
        return res.status(400).json({ status: "rejected", reason: "Güven skoru yetersiz." });
    }
    console.log(`[AI eVTOL COMMAND] ${intent}`, parameters);
    res.json({ status: "success", message: "Komut Jetson Orin'e iletildi.", intent, parameters });
});

// ==========================================
// BÖLÜM B: 2050 BIO-NEXUS & HOSPITAL GRID API
// ==========================================

app.post('/api/v2/bio/analyze-phase', (req, res) => {
    const { subject_id, biological_phase, ai_confidence } = req.body;
    if (ai_confidence && ai_confidence < 0.92) {
        return res.status(400).json({ status: "rejected", reason: "Biyolojik AI güven eşiği altında." });
    }
    console.log(`[BIO-NEXUS] Denek: ${subject_id}, Evre: ${biological_phase}`);
    res.json({ status: "optimized", message: "Hücresel döngü güncellendi.", timestamp: Date.now() });
});

app.post('/api/v2/hospital/orchestrate', (req, res) => {
    const { hospital_id, department, critical_demand } = req.body;
    console.log(`[HOSPITAL GRID] Hastane: ${hospital_id}, Birim: ${department}`, critical_demand);
    res.json({ 
        status: "success", 
        orchestration_id: "ORCH-" + Math.floor(Math.random() * 100000), 
        action: "Nano-bot ve medikal kaynak dağıtımı optimize edildi." 
    });
});

app.post('/api/v2/ai/governance', (req, res) => {
    const { sector, directive, parameters } = req.body;
    console.log(`[2050 GOVERNANCE] Sektör: ${sector}, Direktif: ${directive}`);
    res.json({ 
        status: "executed", 
        consensus: "Decentralized Grid Master Approved", 
        directive, 
        parameters,
        timestamp: new Date().toISOString()
    });
});

// Sunucuyu Başlat
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[UNIFIED 2050 ENGINE] Sunucu ${PORT} portunda tam kapasite aktif.`);
});
