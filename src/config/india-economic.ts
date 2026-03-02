// India Economic Zones — SEZs, FDI Cities, State Capitals
// Source: DPIIT, Census of India, data.gov.in, public data
// Part of Bharat Monitor India Intelligence Hub

export interface IndianSEZ {
    id: string;
    name: string;
    lat: number;
    lon: number;
    city: string;
    state: string;
    type: string;
    note: string;
}

export interface IndianStateCapital {
    id: string;
    name: string;
    lat: number;
    lon: number;
    state: string;
    type: 'state' | 'ut';
    population?: string; // metro area estimate
}

export interface FDICity {
    id: string;
    name: string;
    lat: number;
    lon: number;
    state: string;
    speciality: string;
    note: string;
}

// Special Economic Zones (major ones with coordinates)
export const INDIAN_SEZS: IndianSEZ[] = [
    {
        id: 'seepz_mumbai',
        name: 'SEEPZ (Santa Cruz Electronics)',
        lat: 19.1565,
        lon: 72.8696,
        city: 'Mumbai',
        state: 'Maharashtra',
        type: 'Electronics / IT',
        note: "India's oldest export processing zone. Gems & jewelry.",
    },
    {
        id: 'noida_sez',
        name: 'Noida SEZ',
        lat: 28.5355,
        lon: 77.3910,
        city: 'Noida',
        state: 'Uttar Pradesh',
        type: 'IT / ITES',
        note: 'IT/ITES hub near Delhi NCR. Major tech companies.',
    },
    {
        id: 'mahindra_world_city',
        name: 'Mahindra World City SEZ',
        lat: 12.7483,
        lon: 80.0064,
        city: 'Chennai',
        state: 'Tamil Nadu',
        type: 'IT / Manufacturing',
        note: 'Integrated business city. IT + auto manufacturing.',
    },
    {
        id: 'dlf_cyber_city',
        name: 'DLF Cyber City SEZ',
        lat: 28.4946,
        lon: 77.0887,
        city: 'Gurugram',
        state: 'Haryana',
        type: 'IT / ITES',
        note: 'Major IT SEZ in Gurugram. Fortune 500 companies.',
    },
    {
        id: 'infosys_mysuru',
        name: 'Infosys SEZ',
        lat: 12.3375,
        lon: 76.6410,
        city: 'Mysuru',
        state: 'Karnataka',
        type: 'IT / ITES',
        note: 'Infosys development center and training campus.',
    },
    {
        id: 'apiic_vizag',
        name: 'APIIC SEZ',
        lat: 17.7447,
        lon: 83.3522,
        city: 'Visakhapatnam',
        state: 'Andhra Pradesh',
        type: 'Pharma / IT',
        note: 'Multi-sector SEZ. Pharma and IT focus.',
    },
    {
        id: 'cochin_sez',
        name: 'Cochin SEZ',
        lat: 9.9534,
        lon: 76.3522,
        city: 'Kochi',
        state: 'Kerala',
        type: 'Electronics / Manufacturing',
        note: 'Near Cochin Port. Electronics and food processing.',
    },
    {
        id: 'mundra_sez',
        name: 'Mundra SEZ (Adani)',
        lat: 22.8346,
        lon: 69.7213,
        city: 'Mundra',
        state: 'Gujarat',
        type: 'Multi-sector / Port',
        note: 'Adani Group. Connected to Mundra Port. Power + logistics.',
    },
    {
        id: 'sri_city_sez',
        name: 'Sri City SEZ',
        lat: 13.5655,
        lon: 80.0091,
        city: 'Sri City',
        state: 'Andhra Pradesh',
        type: 'Manufacturing / Electronics',
        note: 'Japanese and Korean investment hub. Electronics manufacturing.',
    },
    {
        id: 'falta_sez',
        name: 'Falta SEZ',
        lat: 22.1771,
        lon: 88.0914,
        city: 'Falta',
        state: 'West Bengal',
        type: 'Multi-sector',
        note: 'Multi-product SEZ near Kolkata. Leather and engineering.',
    },
    {
        id: 'gift_city',
        name: 'GIFT City (Gujarat Intl Finance Tec-City)',
        lat: 23.1572,
        lon: 72.6810,
        city: 'Gandhinagar',
        state: 'Gujarat',
        type: 'Financial Services (IFSC)',
        note: "India's first IFSC. India INX, NSE IFSC, BSE IFSC. Tax-free zone.",
    },
];

// Top FDI Destination Cities
export const INDIAN_FDI_CITIES: FDICity[] = [
    {
        id: 'fdi_mumbai',
        name: 'Mumbai',
        lat: 19.0760,
        lon: 72.8777,
        state: 'Maharashtra',
        speciality: 'Financial capital',
        note: 'Largest FDI recipient. BSE, NSE, RBI headquarters.',
    },
    {
        id: 'fdi_delhi',
        name: 'Delhi NCR',
        lat: 28.6139,
        lon: 77.2090,
        state: 'Delhi',
        speciality: 'Government & services',
        note: 'National capital region. Includes Noida, Gurugram, Faridabad.',
    },
    {
        id: 'fdi_bangalore',
        name: 'Bengaluru (Bangalore)',
        lat: 12.9716,
        lon: 77.5946,
        state: 'Karnataka',
        speciality: 'IT & startup capital',
        note: 'Silicon Valley of India. Largest tech ecosystem. HAL.',
    },
    {
        id: 'fdi_chennai',
        name: 'Chennai',
        lat: 13.0827,
        lon: 80.2707,
        state: 'Tamil Nadu',
        speciality: 'Auto & manufacturing',
        note: 'Detroit of India. Chennai-Sriperumbudur auto corridor.',
    },
    {
        id: 'fdi_hyderabad',
        name: 'Hyderabad',
        lat: 17.3850,
        lon: 78.4867,
        state: 'Telangana',
        speciality: 'IT, pharma, defense',
        note: 'HITEC City. Genome Valley pharma cluster. DRDO labs.',
    },
    {
        id: 'fdi_pune',
        name: 'Pune',
        lat: 18.5204,
        lon: 73.8567,
        state: 'Maharashtra',
        speciality: 'IT, auto, manufacturing',
        note: 'Hinjewadi IT Park. PCMC auto zone. Defense R&D.',
    },
    {
        id: 'fdi_ahmedabad',
        name: 'Ahmedabad',
        lat: 23.0225,
        lon: 72.5714,
        state: 'Gujarat',
        speciality: 'Textiles, chemicals, pharma',
        note: 'Gujarat industrial hub. GIFT City nearby.',
    },
    {
        id: 'fdi_kolkata',
        name: 'Kolkata',
        lat: 22.5726,
        lon: 88.3639,
        state: 'West Bengal',
        speciality: 'Eastern India commercial hub',
        note: 'Sector V Salt Lake IT hub. Jute & tea trade.',
    },
];

// All 28 State Capitals + 8 Union Territory capitals
export const INDIAN_STATE_CAPITALS: IndianStateCapital[] = [
    // States
    { id: 'cap_ap', name: 'Amaravati', lat: 16.5062, lon: 80.6480, state: 'Andhra Pradesh', type: 'state' },
    { id: 'cap_ar', name: 'Itanagar', lat: 27.0844, lon: 93.6053, state: 'Arunachal Pradesh', type: 'state' },
    { id: 'cap_as', name: 'Dispur', lat: 26.1445, lon: 91.7362, state: 'Assam', type: 'state' },
    { id: 'cap_br', name: 'Patna', lat: 25.6093, lon: 85.1376, state: 'Bihar', type: 'state' },
    { id: 'cap_cg', name: 'Raipur', lat: 21.2514, lon: 81.6296, state: 'Chhattisgarh', type: 'state' },
    { id: 'cap_ga', name: 'Panaji', lat: 15.4909, lon: 73.8278, state: 'Goa', type: 'state' },
    { id: 'cap_gj', name: 'Gandhinagar', lat: 23.2156, lon: 72.6369, state: 'Gujarat', type: 'state' },
    { id: 'cap_hr', name: 'Chandigarh', lat: 30.7333, lon: 76.7794, state: 'Haryana', type: 'state' },
    { id: 'cap_hp', name: 'Shimla', lat: 31.1048, lon: 77.1734, state: 'Himachal Pradesh', type: 'state' },
    { id: 'cap_jh', name: 'Ranchi', lat: 23.3441, lon: 85.3096, state: 'Jharkhand', type: 'state' },
    { id: 'cap_ka', name: 'Bengaluru', lat: 12.9716, lon: 77.5946, state: 'Karnataka', type: 'state' },
    { id: 'cap_kl', name: 'Thiruvananthapuram', lat: 8.5241, lon: 76.9366, state: 'Kerala', type: 'state' },
    { id: 'cap_mp', name: 'Bhopal', lat: 23.2599, lon: 77.4126, state: 'Madhya Pradesh', type: 'state' },
    { id: 'cap_mh', name: 'Mumbai', lat: 19.0760, lon: 72.8777, state: 'Maharashtra', type: 'state' },
    { id: 'cap_mn', name: 'Imphal', lat: 24.8170, lon: 93.9368, state: 'Manipur', type: 'state' },
    { id: 'cap_ml', name: 'Shillong', lat: 25.5788, lon: 91.8933, state: 'Meghalaya', type: 'state' },
    { id: 'cap_mz', name: 'Aizawl', lat: 23.7271, lon: 92.7176, state: 'Mizoram', type: 'state' },
    { id: 'cap_nl', name: 'Kohima', lat: 25.6751, lon: 94.1086, state: 'Nagaland', type: 'state' },
    { id: 'cap_od', name: 'Bhubaneswar', lat: 20.2961, lon: 85.8245, state: 'Odisha', type: 'state' },
    { id: 'cap_pb', name: 'Chandigarh', lat: 30.7333, lon: 76.7794, state: 'Punjab', type: 'state' },
    { id: 'cap_rj', name: 'Jaipur', lat: 26.9124, lon: 75.7873, state: 'Rajasthan', type: 'state' },
    { id: 'cap_sk', name: 'Gangtok', lat: 27.3389, lon: 88.6065, state: 'Sikkim', type: 'state' },
    { id: 'cap_tn', name: 'Chennai', lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu', type: 'state' },
    { id: 'cap_tg', name: 'Hyderabad', lat: 17.3850, lon: 78.4867, state: 'Telangana', type: 'state' },
    { id: 'cap_tr', name: 'Agartala', lat: 23.8315, lon: 91.2868, state: 'Tripura', type: 'state' },
    { id: 'cap_up', name: 'Lucknow', lat: 26.8467, lon: 80.9462, state: 'Uttar Pradesh', type: 'state' },
    { id: 'cap_uk', name: 'Dehradun', lat: 30.3165, lon: 78.0322, state: 'Uttarakhand', type: 'state' },
    { id: 'cap_wb', name: 'Kolkata', lat: 22.5726, lon: 88.3639, state: 'West Bengal', type: 'state' },
    // Union Territories
    { id: 'cap_dl', name: 'New Delhi', lat: 28.6139, lon: 77.2090, state: 'Delhi NCT', type: 'ut' },
    { id: 'cap_jk_s', name: 'Srinagar', lat: 34.0837, lon: 74.7973, state: 'Jammu & Kashmir', type: 'ut' },
    { id: 'cap_jk_w', name: 'Jammu', lat: 32.7266, lon: 74.8570, state: 'Jammu & Kashmir (Winter)', type: 'ut' },
    { id: 'cap_la', name: 'Leh', lat: 34.1526, lon: 77.5771, state: 'Ladakh', type: 'ut' },
    { id: 'cap_py', name: 'Puducherry', lat: 11.9416, lon: 79.8083, state: 'Puducherry', type: 'ut' },
    { id: 'cap_ch', name: 'Chandigarh', lat: 30.7333, lon: 76.7794, state: 'Chandigarh', type: 'ut' },
    { id: 'cap_dn', name: 'Daman', lat: 20.3974, lon: 72.8328, state: 'Dadra & Nagar Haveli and Daman & Diu', type: 'ut' },
    { id: 'cap_ld', name: 'Kavaratti', lat: 10.5593, lon: 72.6358, state: 'Lakshadweep', type: 'ut' },
    { id: 'cap_an', name: 'Port Blair', lat: 11.6234, lon: 92.7265, state: 'Andaman & Nicobar', type: 'ut' },
];
