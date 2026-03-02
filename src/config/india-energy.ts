// India Energy Infrastructure — Refineries & LNG Terminals
// Source: PPAC (Petroleum Planning & Analysis Cell), public data
// Part of Bharat Monitor India Intelligence Hub

export interface IndianRefinery {
    id: string;
    name: string;
    lat: number;
    lon: number;
    state: string;
    operator: string;
    capacity: string; // MTPA (million tonnes per annum)
    note: string;
}

export interface LNGTerminal {
    id: string;
    name: string;
    lat: number;
    lon: number;
    state: string;
    operator: string;
    capacity: string; // MTPA
    note: string;
}

// India's major oil refineries — 15 facilities
export const INDIAN_REFINERIES: IndianRefinery[] = [
    {
        id: 'jamnagar_reliance',
        name: 'Jamnagar Refinery (Reliance)',
        lat: 22.3541,
        lon: 69.6822,
        state: 'Gujarat',
        operator: 'Reliance Industries',
        capacity: '68.2 MTPA',
        note: "World's largest refinery complex. Exports refined products globally.",
    },
    {
        id: 'vadinar_nayara',
        name: 'Vadinar Refinery (Nayara Energy)',
        lat: 22.4579,
        lon: 69.6987,
        state: 'Gujarat',
        operator: 'Nayara Energy (Rosneft)',
        capacity: '20 MTPA',
        note: 'Second largest private refinery. Russian Rosneft stake.',
    },
    {
        id: 'koyali_iocl',
        name: 'Koyali Refinery',
        lat: 22.3418,
        lon: 73.1589,
        state: 'Gujarat',
        operator: 'IOCL',
        capacity: '13.7 MTPA',
        note: 'Major IOCL refinery near Vadodara.',
    },
    {
        id: 'mathura_iocl',
        name: 'Mathura Refinery',
        lat: 27.4924,
        lon: 77.6737,
        state: 'Uttar Pradesh',
        operator: 'IOCL',
        capacity: '8.0 MTPA',
        note: 'Supplies fuel to northern India and Delhi NCR.',
    },
    {
        id: 'panipat_iocl',
        name: 'Panipat Refinery',
        lat: 29.4095,
        lon: 76.9779,
        state: 'Haryana',
        operator: 'IOCL',
        capacity: '15.0 MTPA',
        note: 'Integrated refinery + petrochemical complex.',
    },
    {
        id: 'barauni_iocl',
        name: 'Barauni Refinery',
        lat: 25.4549,
        lon: 86.0169,
        state: 'Bihar',
        operator: 'IOCL',
        capacity: '6.0 MTPA',
        note: 'Supplies eastern India. Connected to Haldia via pipeline.',
    },
    {
        id: 'paradip_iocl',
        name: 'Paradip Refinery',
        lat: 20.2963,
        lon: 86.6255,
        state: 'Odisha',
        operator: 'IOCL',
        capacity: '15.0 MTPA',
        note: 'Newest IOCL mega-refinery. Connected to Paradip port.',
    },
    {
        id: 'haldia_iocl',
        name: 'Haldia Refinery',
        lat: 22.0583,
        lon: 88.0589,
        state: 'West Bengal',
        operator: 'IOCL',
        capacity: '8.0 MTPA',
        note: 'Eastern India refinery. Crude oil imported via Haldia port.',
    },
    {
        id: 'vizag_hpcl',
        name: 'Visakhapatnam Refinery',
        lat: 17.7261,
        lon: 83.3175,
        state: 'Andhra Pradesh',
        operator: 'HPCL',
        capacity: '8.3 MTPA',
        note: 'East coast refinery near Eastern Naval Command.',
    },
    {
        id: 'mangalore_mrpl',
        name: 'Mangalore Refinery (MRPL)',
        lat: 12.9141,
        lon: 74.8068,
        state: 'Karnataka',
        operator: 'MRPL (ONGC subsidiary)',
        capacity: '15.0 MTPA',
        note: 'Connected to New Mangalore Port. Processes Middle East crude.',
    },
    {
        id: 'kochi_bpcl',
        name: 'Kochi Refinery',
        lat: 9.9637,
        lon: 76.2870,
        state: 'Kerala',
        operator: 'BPCL',
        capacity: '15.5 MTPA',
        note: 'Integrated refinery + petrochemical complex (IREP).',
    },
    {
        id: 'chennai_cpcl',
        name: 'Chennai Petroleum Refinery',
        lat: 13.0480,
        lon: 80.2499,
        state: 'Tamil Nadu',
        operator: 'CPCL (IOCL subsidiary)',
        capacity: '10.5 MTPA',
        note: 'Oldest refinery in South India. Manali, Chennai.',
    },
    {
        id: 'numaligarh_nrl',
        name: 'Numaligarh Refinery',
        lat: 26.6300,
        lon: 93.7200,
        state: 'Assam',
        operator: 'NRL (OIL subsidiary)',
        capacity: '3.0 MTPA',
        note: 'Northeast India refinery. Expansion to 9 MTPA planned.',
    },
    {
        id: 'bongaigaon_iocl',
        name: 'Bongaigaon Refinery',
        lat: 26.4836,
        lon: 90.5625,
        state: 'Assam',
        operator: 'IOCL',
        capacity: '2.35 MTPA',
        note: 'Northeast India. Processes Assam crude.',
    },
    {
        id: 'digboi_iocl',
        name: 'Digboi Refinery',
        lat: 27.3932,
        lon: 95.6189,
        state: 'Assam',
        operator: 'IOCL',
        capacity: '0.65 MTPA',
        note: "Asia's oldest operating refinery (1901). Heritage site.",
    },
];

// India's LNG import terminals — 6 facilities
export const INDIAN_LNG_TERMINALS: LNGTerminal[] = [
    {
        id: 'dahej_lng',
        name: 'Dahej LNG Terminal',
        lat: 21.7142,
        lon: 72.5736,
        state: 'Gujarat',
        operator: 'Petronet LNG',
        capacity: '17.5 MTPA',
        note: "India's largest LNG terminal. Connected to HBJ pipeline.",
    },
    {
        id: 'hazira_lng',
        name: 'Hazira LNG Terminal',
        lat: 21.1034,
        lon: 72.6270,
        state: 'Gujarat',
        operator: 'Shell',
        capacity: '5.0 MTPA',
        note: 'Shell-operated terminal near Surat.',
    },
    {
        id: 'dabhol_lng',
        name: 'Dabhol LNG Terminal',
        lat: 17.5893,
        lon: 73.1777,
        state: 'Maharashtra',
        operator: 'RGPPL',
        capacity: '5.0 MTPA',
        note: 'Ratnagiri Gas & Power. Formerly Enron Dabhol project.',
    },
    {
        id: 'kochi_lng',
        name: 'Kochi LNG Terminal',
        lat: 9.9637,
        lon: 76.2870,
        state: 'Kerala',
        operator: 'Petronet LNG',
        capacity: '5.0 MTPA',
        note: 'South India LNG supply. Pipeline connectivity limited.',
    },
    {
        id: 'ennore_lng',
        name: 'Ennore LNG Terminal',
        lat: 13.2242,
        lon: 80.3261,
        state: 'Tamil Nadu',
        operator: 'IOCL / AG&P',
        capacity: '5.0 MTPA',
        note: 'East coast LNG terminal at Kamarajar Port.',
    },
    {
        id: 'mundra_lng',
        name: 'Mundra LNG Terminal',
        lat: 22.7396,
        lon: 69.7078,
        state: 'Gujarat',
        operator: 'Adani / GSPC',
        capacity: '5.0 MTPA',
        note: 'Adani Group terminal at Mundra port complex.',
    },
];
