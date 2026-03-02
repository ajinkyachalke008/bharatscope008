/**
 * India Weather, Radar & Environmental Monitoring Configuration
 * Bharat Monitor — Environmental Intelligence Layer
 *
 * IMD Doppler radar stations, CWC flood monitoring points,
 * major highway/expressway waypoints, and CPCB air quality stations.
 */

// ─── IMD Doppler Radar Stations ───
export interface IMDRadarStation {
    name: string;
    code: string;
    lat: number;
    lng: number;
    type: 'S-Band' | 'C-Band' | 'X-Band';
    state: string;
}

export const IMD_RADAR_STATIONS: IMDRadarStation[] = [
    { name: 'Delhi (Mausam Bhawan)', code: 'DEL', lat: 28.5897, lng: 77.2140, type: 'S-Band', state: 'Delhi' },
    { name: 'Mumbai (Colaba)', code: 'MUM', lat: 18.8953, lng: 72.8111, type: 'S-Band', state: 'Maharashtra' },
    { name: 'Chennai (Nungambakkam)', code: 'MAS', lat: 13.0657, lng: 80.2376, type: 'S-Band', state: 'Tamil Nadu' },
    { name: 'Kolkata (Alipore)', code: 'CCU', lat: 22.5354, lng: 88.3346, type: 'S-Band', state: 'West Bengal' },
    { name: 'Hyderabad (Begumpet)', code: 'HYD', lat: 17.4460, lng: 78.4678, type: 'S-Band', state: 'Telangana' },
    { name: 'Bengaluru (HAL)', code: 'BLR', lat: 12.9478, lng: 77.6680, type: 'C-Band', state: 'Karnataka' },
    { name: 'Ahmedabad', code: 'AMD', lat: 23.0651, lng: 72.6010, type: 'S-Band', state: 'Gujarat' },
    { name: 'Pune (Pashan)', code: 'PNQ', lat: 18.5382, lng: 73.8063, type: 'S-Band', state: 'Maharashtra' },
    { name: 'Jaipur', code: 'JAI', lat: 26.8159, lng: 75.8204, type: 'S-Band', state: 'Rajasthan' },
    { name: 'Lucknow', code: 'LKO', lat: 26.7672, lng: 80.8859, type: 'S-Band', state: 'Uttar Pradesh' },
    { name: 'Bhopal', code: 'BHO', lat: 23.2890, lng: 77.3489, type: 'S-Band', state: 'Madhya Pradesh' },
    { name: 'Visakhapatnam', code: 'VTZ', lat: 17.7182, lng: 83.2244, type: 'S-Band', state: 'Andhra Pradesh' },
    { name: 'Thiruvananthapuram', code: 'TRV', lat: 8.5008, lng: 76.9477, type: 'S-Band', state: 'Kerala' },
    { name: 'Patna', code: 'PAT', lat: 25.6009, lng: 85.0956, type: 'S-Band', state: 'Bihar' },
    { name: 'Nagpur', code: 'NAG', lat: 21.0924, lng: 79.0488, type: 'S-Band', state: 'Maharashtra' },
    { name: 'Guwahati', code: 'GAU', lat: 26.1054, lng: 91.5788, type: 'S-Band', state: 'Assam' },
    { name: 'Bhubaneswar', code: 'BBI', lat: 20.2534, lng: 85.8039, type: 'S-Band', state: 'Odisha' },
    { name: 'Srinagar', code: 'SXR', lat: 34.0837, lng: 74.7973, type: 'C-Band', state: 'Jammu & Kashmir' },
    { name: 'Chandigarh', code: 'IXC', lat: 30.6680, lng: 76.7885, type: 'S-Band', state: 'Chandigarh' },
    { name: 'Kochi (Cochin)', code: 'COK', lat: 9.9445, lng: 76.2542, type: 'C-Band', state: 'Kerala' },
];

// ─── CWC Flood Monitoring Points ───
export interface FloodMonitoringPoint {
    name: string;
    river: string;
    lat: number;
    lng: number;
    state: string;
    dangerLevel: number; // meters
    warningLevel: number; // meters
}

export const FLOOD_MONITORING_POINTS: FloodMonitoringPoint[] = [
    { name: 'Varanasi', river: 'Ganga', lat: 25.3176, lng: 83.0100, state: 'Uttar Pradesh', dangerLevel: 71.26, warningLevel: 70.26 },
    { name: 'Patna', river: 'Ganga', lat: 25.6009, lng: 85.0956, state: 'Bihar', dangerLevel: 50.00, warningLevel: 49.00 },
    { name: 'Dibrugarh', river: 'Brahmaputra', lat: 27.4850, lng: 94.8700, state: 'Assam', dangerLevel: 106.61, warningLevel: 105.61 },
    { name: 'Guwahati', river: 'Brahmaputra', lat: 26.1854, lng: 91.7456, state: 'Assam', dangerLevel: 49.68, warningLevel: 48.68 },
    { name: 'Hathnikund', river: 'Yamuna', lat: 30.4058, lng: 77.5940, state: 'Haryana', dangerLevel: 200.00, warningLevel: 199.00 },
    { name: 'Delhi (Yamuna)', river: 'Yamuna', lat: 28.6519, lng: 77.2326, state: 'Delhi', dangerLevel: 205.33, warningLevel: 204.83 },
    { name: 'Surat', river: 'Tapi', lat: 21.1764, lng: 72.8226, state: 'Gujarat', dangerLevel: 9.00, warningLevel: 8.50 },
    { name: 'Silchar', river: 'Barak', lat: 24.8267, lng: 92.8009, state: 'Assam', dangerLevel: 21.49, warningLevel: 20.49 },
];

// ─── National Highways & Expressways Waypoints ───
export interface HighwayMonitoringPoint {
    name: string;
    route: string;
    lat: number;
    lng: number;
    description: string;
}

export const HIGHWAY_MONITORING_POINTS: HighwayMonitoringPoint[] = [
    { name: 'Delhi-Jaipur (KMP)', route: 'NH-48 / NH-352', lat: 28.4201, lng: 76.9512, description: 'Kundli-Manesar-Palwal Expressway junction' },
    { name: 'Mumbai-Pune Expressway', route: 'NH-48', lat: 18.7692, lng: 73.4015, description: 'Khandala toll plaza' },
    { name: 'Agra-Lucknow Expressway', route: 'ALE', lat: 27.0511, lng: 79.5832, description: 'Midpoint near Firozabad' },
    { name: 'Yamuna Expressway', route: 'Yamuna Exp', lat: 27.6800, lng: 77.4200, description: 'Greater Noida to Agra' },
    { name: 'Bengaluru-Mysuru Expressway', route: 'NH-275', lat: 12.6518, lng: 76.7592, description: 'Mandya section' },
    { name: 'Hyderabad ORR', route: 'NH-565', lat: 17.3451, lng: 78.2640, description: 'Outer Ring Road Hyderabad' },
    { name: 'Chennai ORR', route: 'NH-332', lat: 12.8879, lng: 80.0862, description: 'Chennai Peripheral Road' },
    { name: 'NH-44 (Delhi-Chennai)', route: 'NH-44', lat: 24.5785, lng: 78.5730, description: 'Longest national highway — Jhansi section' },
];

// ─── CPCB Air Quality Monitoring Stations ───
export interface AirQualityStation {
    name: string;
    city: string;
    lat: number;
    lng: number;
    state: string;
}

export const AQ_MONITORING_STATIONS: AirQualityStation[] = [
    { name: 'ITO', city: 'Delhi', lat: 28.6274, lng: 77.2500, state: 'Delhi' },
    { name: 'Anand Vihar', city: 'Delhi', lat: 28.6469, lng: 77.3162, state: 'Delhi' },
    { name: 'RK Puram', city: 'Delhi', lat: 28.5633, lng: 77.1747, state: 'Delhi' },
    { name: 'Mandir Marg', city: 'Delhi', lat: 28.6363, lng: 77.2010, state: 'Delhi' },
    { name: 'Worli', city: 'Mumbai', lat: 19.0176, lng: 72.8218, state: 'Maharashtra' },
    { name: 'Bandra Kurla', city: 'Mumbai', lat: 19.0670, lng: 72.8734, state: 'Maharashtra' },
    { name: 'Jadavpur', city: 'Kolkata', lat: 22.4960, lng: 88.3709, state: 'West Bengal' },
    { name: 'Victoria Memorial', city: 'Kolkata', lat: 22.5449, lng: 88.3422, state: 'West Bengal' },
    { name: 'Peenya', city: 'Bengaluru', lat: 13.0280, lng: 77.5222, state: 'Karnataka' },
    { name: 'Silk Board', city: 'Bengaluru', lat: 12.9170, lng: 77.6226, state: 'Karnataka' },
    { name: 'Alandur', city: 'Chennai', lat: 13.0024, lng: 80.2075, state: 'Tamil Nadu' },
    { name: 'Sector 62', city: 'Noida', lat: 28.6283, lng: 77.3646, state: 'Uttar Pradesh' },
    { name: 'Civil Lines', city: 'Lucknow', lat: 26.8590, lng: 80.9432, state: 'Uttar Pradesh' },
    { name: 'Talkatora', city: 'Lucknow', lat: 26.8560, lng: 80.9268, state: 'Uttar Pradesh' },
    { name: 'Ganga Nagar', city: 'Kanpur', lat: 26.4642, lng: 80.3229, state: 'Uttar Pradesh' },
    { name: 'Nehru Nagar', city: 'Ahmedabad', lat: 23.0405, lng: 72.5874, state: 'Gujarat' },
    { name: 'Collectorate', city: 'Gaya', lat: 24.7955, lng: 85.0092, state: 'Bihar' },
    { name: 'IGMS', city: 'Patna', lat: 25.6200, lng: 85.0966, state: 'Bihar' },
    { name: 'Sirifort', city: 'Delhi', lat: 28.5549, lng: 77.2198, state: 'Delhi' },
    { name: 'Zoo Park', city: 'Hyderabad', lat: 17.3504, lng: 78.4520, state: 'Telangana' },
];
