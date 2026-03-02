export interface NodeItem {
    id: string;
    name: string;
    lat: number;
    lng: number;
    state: string;
    [key: string]: any;
}

export interface NuclearNode extends NodeItem {
    capacity_mw: number;
    unit_count: number;
}

export interface PowerNode extends NodeItem {
    capacity_mw: number;
}

export interface AirportNode extends NodeItem {
    iata: string;
    pax_mn: number;
    category: string;
}

export interface DatacenterNode extends NodeItem {
    operator: string;
    tier: number;
    it_load_mw: number;
}

export interface SezNode extends NodeItem {
    category: string;
}

export interface ManufacturingNode extends NodeItem {
    category: string;
    key_companies: string[];
}

export interface WeatherAlertNode extends NodeItem {
    severity: string;
    type: string;
    trend: string;
    source: string;
}

export const BHARAT_DATA = {
    metadata: {
        platform: 'Bharat Monitor v3.0',
        projection: 'WGS-84',
        geofence: 'India',
        total_nodes: 101,
        last_updated: '2026-02-28',
    },
    nodes: {
        nuclear: [
            { id: 'tarapur', name: 'Tarapur Atomic Power Station', lat: 19.9, lng: 72.9, capacity_mw: 1400, state: 'Maharashtra', unit_count: 4 },
            { id: 'kudankulam', name: 'Kudankulam Nuclear Power Plant', lat: 8.2, lng: 77.7, capacity_mw: 2000, state: 'Tamil Nadu', unit_count: 2 },
            { id: 'kaiga', name: 'Kaiga Generating Station', lat: 14.8, lng: 74.4, capacity_mw: 880, state: 'Karnataka', unit_count: 4 },
            { id: 'narora', name: 'Narora Atomic Power Station', lat: 28.2, lng: 78.4, capacity_mw: 440, state: 'Uttar Pradesh', unit_count: 2 },
            { id: 'kakrapar', name: 'Kakrapar Atomic Power Station', lat: 21.2, lng: 73.3, capacity_mw: 440, state: 'Gujarat', unit_count: 2 },
            { id: 'rawatbhata', name: 'Rawatbhata Atomic Power Station', lat: 24.9, lng: 75.6, capacity_mw: 1180, state: 'Rajasthan', unit_count: 6 },
            { id: 'kalpakkam', name: 'Madras Atomic Power Station', lat: 12.5, lng: 80.2, capacity_mw: 440, state: 'Tamil Nadu', unit_count: 2 },
            { id: 'gorakhpur', name: 'Gorakhpur Haryana Anu Vidyut', lat: 29.9, lng: 75.8, capacity_mw: 1400, state: 'Haryana', unit_count: 4 },
        ] as NuclearNode[],
        thermal: [
            { id: 'vindhyachal', name: 'Vindhyachal STPS', lat: 24.1, lng: 82.7, capacity_mw: 4760, state: 'Madhya Pradesh' },
            { id: 'mundra_thm', name: 'Mundra Thermal PS', lat: 22.8, lng: 69.7, capacity_mw: 4620, state: 'Gujarat' },
            { id: 'sipat', name: 'Sipat Thermal PP', lat: 22.1, lng: 82.2, capacity_mw: 2980, state: 'Chhattisgarh' },
            { id: 'ramagundam', name: 'NTPC Ramagundam', lat: 18.8, lng: 79.5, capacity_mw: 2600, state: 'Telangana' },
            { id: 'farakka', name: 'Farakka STPS', lat: 24.8, lng: 87.9, capacity_mw: 2100, state: 'West Bengal' },
            { id: 'rihand', name: 'Rihand Thermal PS', lat: 24.2, lng: 83.0, capacity_mw: 3000, state: 'Uttar Pradesh' },
            { id: 'korba', name: 'NTPC Korba', lat: 22.4, lng: 82.7, capacity_mw: 2600, state: 'Chhattisgarh' },
            { id: 'talcher', name: 'NTPC Talcher Thermal', lat: 20.9, lng: 85.2, capacity_mw: 3000, state: 'Odisha' },
            { id: 'kahalgaon', name: 'Kahalgaon STPS', lat: 25.2, lng: 87.2, capacity_mw: 2340, state: 'Bihar' },
            { id: 'tiroda', name: 'Tiroda Power Plant', lat: 21.4, lng: 79.9, capacity_mw: 3300, state: 'Maharashtra' },
        ] as PowerNode[],
        solar: [
            { id: 'bhadla', name: 'Bhadla Solar Park', lat: 27.5, lng: 71.9, capacity_mw: 2245, state: 'Rajasthan' },
            { id: 'pavagada', name: 'Pavagada Solar Park', lat: 14.1, lng: 77.3, capacity_mw: 2050, state: 'Karnataka' },
            { id: 'kurnool', name: 'Kurnool Ultra Mega Solar', lat: 15.8, lng: 78.0, capacity_mw: 1000, state: 'Andhra Pradesh' },
            { id: 'rewa', name: 'Rewa Ultra Mega Solar', lat: 24.5, lng: 81.3, capacity_mw: 750, state: 'Madhya Pradesh' },
            { id: 'charanka', name: 'Charanka Solar Park', lat: 23.9, lng: 71.2, capacity_mw: 590, state: 'Gujarat' },
            { id: 'sambhar', name: 'Sambhar Solar', lat: 26.9, lng: 75.2, capacity_mw: 400, state: 'Rajasthan' },
            { id: 'ananthapuram', name: 'Ananthapuram Solar Park', lat: 14.5, lng: 77.5, capacity_mw: 500, state: 'Andhra Pradesh' },
        ] as PowerNode[],
        hydro: [
            { id: 'tehri', name: 'Tehri Dam', lat: 30.4, lng: 78.5, capacity_mw: 2400, state: 'Uttarakhand' },
            { id: 'bhakra', name: 'Bhakra Nangal Dam', lat: 31.4, lng: 76.4, capacity_mw: 1325, state: 'Punjab / HP' },
            { id: 'hirakud', name: 'Hirakud Dam', lat: 21.5, lng: 83.8, capacity_mw: 347, state: 'Odisha' },
            { id: 'nagarjuna', name: 'Nagarjunasagar Dam', lat: 16.6, lng: 79.3, capacity_mw: 815, state: 'Telangana' },
            { id: 'sardar', name: 'Sardar Sarovar Dam', lat: 21.8, lng: 73.7, capacity_mw: 1450, state: 'Gujarat' },
            { id: 'koyna', name: 'Koyna Hydroelectric', lat: 17.4, lng: 73.8, capacity_mw: 1960, state: 'Maharashtra' },
            { id: 'idukki', name: 'Idukki Arch Dam', lat: 9.9, lng: 76.9, capacity_mw: 780, state: 'Kerala' },
            { id: 'srisailam', name: 'Srisailam Dam', lat: 16.1, lng: 78.9, capacity_mw: 1670, state: 'Andhra Pradesh' },
        ] as PowerNode[],
        airports: [
            { id: 'DEL', name: 'Indira Gandhi International', lat: 28.56, lng: 77.1, iata: 'DEL', state: 'Delhi', pax_mn: 69.9, category: 'Hub' },
            { id: 'BOM', name: 'CSIA Mumbai', lat: 19.09, lng: 72.87, iata: 'BOM', state: 'Maharashtra', pax_mn: 49.8, category: 'Hub' },
            { id: 'BLR', name: 'Kempegowda International Bangalore', lat: 13.2, lng: 77.71, iata: 'BLR', state: 'Karnataka', pax_mn: 33.5, category: 'Hub' },
            { id: 'HYD', name: 'Rajiv Gandhi International Hyderabad', lat: 17.24, lng: 78.43, iata: 'HYD', state: 'Telangana', pax_mn: 21.4, category: 'Intl' },
            { id: 'MAA', name: 'Chennai International', lat: 12.99, lng: 80.17, iata: 'MAA', state: 'Tamil Nadu', pax_mn: 20.1, category: 'Intl' },
            { id: 'CCU', name: 'NSCBI Airport Kolkata', lat: 22.65, lng: 88.45, iata: 'CCU', state: 'West Bengal', pax_mn: 16.3, category: 'Intl' },
            { id: 'COK', name: 'Cochin International', lat: 10.15, lng: 76.4, iata: 'COK', state: 'Kerala', pax_mn: 9.5, category: 'Intl' },
            { id: 'AMD', name: 'SVP International Ahmedabad', lat: 23.07, lng: 72.63, iata: 'AMD', state: 'Gujarat', pax_mn: 9.0, category: 'Intl' },
            { id: 'PNQ', name: 'Pune International', lat: 18.58, lng: 73.92, iata: 'PNQ', state: 'Maharashtra', pax_mn: 8.2, category: 'Intl' },
            { id: 'GOI', name: 'Goa International (Manohar)', lat: 15.39, lng: 73.83, iata: 'GOI', state: 'Goa', pax_mn: 7.8, category: 'Intl' },
            { id: 'BBI', name: 'Biju Patnaik Intl Bhubaneswar', lat: 20.25, lng: 85.82, iata: 'BBI', state: 'Odisha', pax_mn: 5.2, category: 'Intl' },
            { id: 'IXC', name: 'Chandigarh Airport', lat: 30.67, lng: 76.79, iata: 'IXC', state: 'Punjab', pax_mn: 3.8, category: 'Intl' },
            { id: 'TRV', name: 'Trivandrum International', lat: 8.48, lng: 76.92, iata: 'TRV', state: 'Kerala', pax_mn: 5.6, category: 'Intl' },
            { id: 'IXE', name: 'Mangalore International', lat: 12.96, lng: 74.89, iata: 'IXE', state: 'Karnataka', pax_mn: 2.1, category: 'Intl' },
        ] as AirportNode[],
        datacenters: [
            { id: 'dc_navi', name: 'Navi Mumbai Hyperscale DC', lat: 19.03, lng: 73.02, operator: 'Reliance/NTT', tier: 4, it_load_mw: 80 },
            { id: 'dc_andheri', name: 'Andheri DC Campus', lat: 19.12, lng: 72.85, operator: 'CtrlS Datacenters', tier: 3, it_load_mw: 20 },
            { id: 'dc_che', name: 'Chennai IT Corridor DC', lat: 12.97, lng: 80.25, operator: 'ESDS / Tata', tier: 3, it_load_mw: 30 },
            { id: 'dc_hyd', name: 'Hyderabad HITEC City DC', lat: 17.43, lng: 78.38, operator: 'Microsoft / Google', tier: 4, it_load_mw: 120 },
            { id: 'dc_blr', name: 'Bangalore Electronic City DC', lat: 12.85, lng: 77.65, operator: 'Amazon / Jio', tier: 4, it_load_mw: 150 },
            { id: 'dc_pun', name: 'Pune Hinjewadi DC', lat: 18.59, lng: 73.74, operator: 'Sify Technologies', tier: 3, it_load_mw: 25 },
            { id: 'dc_del', name: 'Delhi NCR Hyperscale Zone', lat: 28.52, lng: 77.31, operator: 'Yotta / NTT', tier: 4, it_load_mw: 100 },
            { id: 'dc_kol', name: 'Kolkata Sector V DC', lat: 22.57, lng: 88.44, operator: 'Tulip / ESDS', tier: 3, it_load_mw: 18 },
            { id: 'dc_ahm', name: 'Ahmedabad GIFT City DC', lat: 23.17, lng: 72.69, operator: 'GIFT SEZ', tier: 3, it_load_mw: 22 },
        ] as DatacenterNode[],
        sez: [
            { id: 'gift', name: 'GIFT City (Financial SEZ)', lat: 23.17, lng: 72.68, category: 'Financial / IT', state: 'Gujarat' },
            { id: 'noida_sez', name: 'NOIDA Special Economic Zone', lat: 28.52, lng: 77.38, category: 'IT / Electronics', state: 'Uttar Pradesh' },
            { id: 'sriperumbudur', name: 'Sriperumbudur Electronics SEZ', lat: 12.91, lng: 79.92, category: 'Electronics', state: 'Tamil Nadu' },
            { id: 'kandla', name: 'Kandla Free Trade Zone', lat: 23.02, lng: 70.21, category: 'Multi-product', state: 'Gujarat' },
            { id: 'vizag_sez', name: 'Visakhapatnam SEZ', lat: 17.72, lng: 83.32, category: 'Multi-product', state: 'Andhra Pradesh' },
            { id: 'cochin_sez', name: 'Cochin SEZ', lat: 9.97, lng: 76.27, category: 'Services', state: 'Kerala' },
            { id: 'falta', name: 'Falta SEZ', lat: 22.27, lng: 88.08, category: 'Multi-product', state: 'West Bengal' },
            { id: 'rajiv_hinjewadi', name: 'Rajiv Gandhi Infotech Park', lat: 18.62, lng: 73.73, category: 'IT / Software', state: 'Maharashtra' },
            { id: 'mundra_port', name: 'Mundra Port SEZ', lat: 22.83, lng: 69.71, category: 'Port / Logistics', state: 'Gujarat' },
        ] as SezNode[],
        manufacturing: [
            { id: 'chennai_auto', name: 'Chennai Auto Hub', lat: 12.78, lng: 79.98, category: 'Automotive', key_companies: ['Hyundai', 'Ford', 'BMW', 'Renault'], state: 'Tamil Nadu' },
            { id: 'pune_auto', name: 'Pune Auto Corridor', lat: 18.52, lng: 73.78, category: 'Automotive', key_companies: ['Tata', 'Mercedes', 'Volkswagen', 'Bajaj'], state: 'Maharashtra' },
            { id: 'noida_elec', name: 'Greater Noida Electronics', lat: 28.45, lng: 77.52, category: 'Electronics', key_companies: ['Samsung', 'Xiaomi', 'Oppo', 'Vivo'], state: 'Uttar Pradesh' },
            { id: 'surat_tex', name: 'Surat Textile Hub', lat: 21.17, lng: 72.83, category: 'Textiles', key_companies: ['Diamond & Synthetic Fabric Mills'], state: 'Gujarat' },
            { id: 'ludhiana', name: 'Ludhiana Industrial Hub', lat: 30.9, lng: 75.85, category: 'Engineering / Textiles', key_companies: ['Hosiery', 'Cycles', 'Machine Parts'], state: 'Punjab' },
            { id: 'blr_aero', name: 'Bangalore Aerospace Hub', lat: 13.03, lng: 77.58, category: 'Aerospace / Defence', key_companies: ['HAL', 'ISRO', 'DRDO', 'BEL'], state: 'Karnataka' },
            { id: 'ahm_pharma', name: 'Ahmedabad Pharma Cluster', lat: 22.95, lng: 72.52, category: 'Pharmaceuticals', key_companies: ['Sun Pharma', 'Torrent', 'Zydus', 'Cadila'], state: 'Gujarat' },
            { id: 'jamshedpur', name: 'Jamshedpur Steel Hub', lat: 22.8, lng: 86.2, category: 'Steel / Heavy Mfg', key_companies: ['Tata Steel', 'SAIL'], state: 'Jharkhand' },
        ] as ManufacturingNode[],
        weather_alerts: [
            { id: 'bob_low', name: 'Bay of Bengal Low Pressure Area', lat: 14.5, lng: 85.5, severity: 'Moderate', type: 'Low Pressure', trend: 'Intensifying', source: 'IMD', state: 'Bay of Bengal' },
            { id: 'arab_watch', name: 'Arabian Sea Weather Watch', lat: 18.0, lng: 67.5, severity: 'Watch', type: 'Cyclonic Circulation', trend: 'Stable', source: 'IMD', state: 'Arabian Sea' },
            { id: 'mon_trough', name: 'Monsoon Trough Active', lat: 22.5, lng: 76.0, severity: 'Active', type: 'Monsoon Trough', trend: 'Westward', source: 'IMD', state: 'Central India' },
            { id: 'ne_rain', name: 'Heavy Rainfall Alert NE', lat: 25.5, lng: 92.5, severity: 'Warning', type: 'Heavy Rainfall', trend: 'Persisting', source: 'IMD', state: 'North East India' },
        ] as WeatherAlertNode[],
    },
    layer_config: {
        nuclear: { label: 'Nuclear', icon: '☢', color: '#FF6B35', marker_size: 8 },
        thermal: { label: 'Thermal', icon: '♨', color: '#A855F7', marker_size: 6 },
        solar: { label: 'Solar', icon: '☀', color: '#FBBF24', marker_size: 6 },
        hydro: { label: 'Hydro', icon: '💧', color: '#22D3EE', marker_size: 6 },
        airports: { label: 'Airports', icon: '✈', color: '#34D399', marker_size: 7 },
        datacenters: { label: 'Datacenters', icon: '⬡', color: '#818CF8', marker_size: 6 },
        sez: { label: 'SEZ / Trade', icon: '◆', color: '#F59E0B', marker_size: 6 },
        manufacturing: { label: 'Industry Hubs', icon: '⚙', color: '#F87171', marker_size: 6 },
        weather_alerts: { label: 'IMD Weather', icon: '⛈', color: '#60A5FA', marker_size: 12 },
    },
    aggregates: {
        energy: {
            nuclear_total_mw: 8180,
            thermal_total_mw: 31460,
            solar_total_mw: 7535,
            hydro_total_mw: 10747,
            grand_total_mw: 57922,
            grand_total_gw: 57.9,
        },
        datacenters: {
            total_it_load_mw: 565,
            tier4_count: 4,
            tier3_count: 5,
        },
        airports: {
            total_pax_mn_fy24: 258.9,
            hub_count: 3,
            intl_count: 11,
        },
        coverage: {
            total_assets: 101,
            states_covered: 28,
            layer_types: 9,
        },
    },
};
