export interface InfrastructureItem {
    name: string;
    type?: string;
    location?: string;
    coordinates: [number, number]; // [longitude, latitude]
    [key: string]: any;
}

export const INDIA_WEBCAMS: InfrastructureItem[] = [
    // EarthCam
    { name: 'Taj Mahal View', location: 'Agra, UP', coordinates: [78.0421, 27.1751] },
    { name: 'Varanasi Dashashwamedh Ghat', location: 'Varanasi, UP', coordinates: [83.0107, 25.3109] },
    { name: 'Varanasi Ganga Aarti', location: 'Varanasi, UP', coordinates: [83.0106, 25.3044] },
    { name: 'Gateway of India', location: 'Mumbai, MH', coordinates: [72.8347, 18.9220] },
    { name: 'India Gate', location: 'New Delhi', coordinates: [77.2295, 28.6129] },
    { name: 'Jaipur Hawa Mahal', location: 'Jaipur, RJ', coordinates: [75.8267, 26.9239] },
    { name: 'Golden Temple', location: 'Amritsar, PB', coordinates: [74.8765, 31.6200] },
    { name: 'Mysore Palace', location: 'Mysuru, KA', coordinates: [76.6552, 12.3052] },
    { name: 'Marine Drive', location: 'Mumbai, MH', coordinates: [72.8235, 18.9432] },
    { name: 'Char Minar', location: 'Hyderabad, TS', coordinates: [78.4747, 17.3616] },
    { name: 'Howrah Bridge', location: 'Kolkata, WB', coordinates: [88.3468, 22.5851] },
    { name: 'Meenakshi Temple', location: 'Madurai, TN', coordinates: [78.1193, 9.9195] },

    // Skyline Webcams
    { name: 'Goa Beach Panorama', location: 'Goa', coordinates: [73.8278, 15.4909] },
    { name: 'Kovalam Beach', location: 'Kerala', coordinates: [76.9784, 8.3988] },
    { name: 'Udaipur Lake Palace', location: 'Udaipur, RJ', coordinates: [73.6809, 24.5764] },
    { name: 'Rishikesh Ganga View', location: 'Rishikesh, UK', coordinates: [78.2676, 30.0869] },
    { name: 'Shimla Mall Road', location: 'Shimla, HP', coordinates: [77.1734, 31.1048] },
    { name: 'Manali Valley View', location: 'Manali, HP', coordinates: [77.1887, 32.2396] },
    { name: 'Darjeeling Tiger Hill', location: 'Darjeeling, WB', coordinates: [88.2636, 27.0125] },
    { name: 'Gangtok MG Marg', location: 'Gangtok, SK', coordinates: [88.6138, 27.3314] },
    { name: 'Munnar Tea Gardens', location: 'Munnar, KL', coordinates: [77.0595, 10.0889] },
    { name: 'Ooty Lake', location: 'Ooty, TN', coordinates: [76.6932, 11.4064] },

    // Religious
    { name: 'Tirumala Tirupati Balaji', location: 'Tirupati, AP', coordinates: [79.3472, 13.6833] },
    { name: 'Vaishno Devi Bhawan', location: 'Katra, J&K', coordinates: [74.9490, 33.0304] },
    { name: 'Kashi Vishwanath Temple', location: 'Varanasi, UP', coordinates: [83.0107, 25.3109] },
    { name: 'Somnath Temple', location: 'Somnath, GJ', coordinates: [70.4012, 20.8880] },
    { name: 'Shirdi Sai Baba Temple', location: 'Shirdi, MH', coordinates: [74.4779, 19.7668] },
    { name: 'Jagannath Temple Puri', location: 'Puri, OD', coordinates: [85.8181, 19.8048] },
    { name: 'Kedarnath Temple', location: 'Kedarnath, UK', coordinates: [79.0669, 30.7352] },
    { name: 'Badrinath Temple', location: 'Badrinath, UK', coordinates: [79.4938, 30.7433] },
    { name: 'Siddhivinayak Temple', location: 'Mumbai, MH', coordinates: [72.8306, 19.0169] },
    { name: 'Mahabodhi Temple', location: 'Bodh Gaya, BR', coordinates: [84.9911, 24.6961] },
    { name: 'Dargah Ajmer Sharif', location: 'Ajmer, RJ', coordinates: [74.6279, 26.4569] },
    { name: 'Sabarimala Temple', location: 'Sabarimala, KL', coordinates: [77.0828, 9.4361] },
    { name: 'Rameshwaram Temple', location: 'Rameshwaram, TN', coordinates: [79.3174, 9.2876] },
    { name: 'Dwarka Temple', location: 'Dwarka, GJ', coordinates: [68.9674, 22.2376] },
    { name: 'Amarnath Cave', location: 'Amarnath, J&K', coordinates: [75.5006, 34.2149] },

    // Weather/Environmental
    { name: 'Nanda Devi Peak', location: 'Uttarakhand', coordinates: [79.9742, 30.3753] },
    { name: 'Rohtang Pass', location: 'Manali, HP', coordinates: [77.2477, 32.3722] },
    { name: 'Atal Tunnel South', location: 'Manali, HP', coordinates: [77.1634, 32.3197] },
    { name: 'Zoji La Pass', location: 'J&K', coordinates: [75.4894, 34.2842] },
    { name: 'Sela Pass', location: 'Arunachal Pradesh', coordinates: [92.1019, 27.5060] },
    { name: 'Nathu La Pass', location: 'Sikkim', coordinates: [88.8308, 27.3864] },
    { name: 'Sundarbans Mangrove', location: 'West Bengal', coordinates: [88.8985, 21.9497] },
    { name: 'Kaziranga NP Gate', location: 'Assam', coordinates: [93.1711, 26.5775] },
    { name: 'Jim Corbett NP', location: 'Uttarakhand', coordinates: [78.7747, 29.5300] },

    // River/Flood Monitoring (CWC)
    { name: 'Yamuna at Delhi', location: 'Delhi', coordinates: [77.2500, 28.6800] },
    { name: 'Ganga at Varanasi', location: 'UP', coordinates: [83.0100, 25.3000] },
    { name: 'Ganga at Haridwar', location: 'UK', coordinates: [78.1642, 29.9457] },
    { name: 'Ganga at Patna', location: 'Bihar', coordinates: [85.1600, 25.6100] },
    { name: 'Brahmaputra at Guwahati', location: 'Assam', coordinates: [91.7500, 26.1900] },
    { name: 'Godavari at Bhadrachalam', location: 'Telangana', coordinates: [80.8900, 17.6700] }
];

export const INDIA_RAILWAY_STATIONS: InfrastructureItem[] = [
    { name: 'New Delhi', code: 'NDLS', platforms: 16, coordinates: [77.2190, 28.6424] },
    { name: 'Howrah Junction', code: 'HWH', platforms: 23, coordinates: [88.3429, 22.5839] },
    { name: 'Mumbai CSMT (VT)', code: 'CSTM', platforms: 18, coordinates: [72.8355, 18.9398] },
    { name: 'Chennai Central', code: 'MAS', platforms: 12, coordinates: [80.2747, 13.0836] },
    { name: 'Sealdah', code: 'SDAH', platforms: 20, coordinates: [88.3685, 22.5649] },
    { name: 'Secunderabad Junction', code: 'SC', platforms: 10, coordinates: [78.5015, 17.4339] },
    { name: 'Lucknow Junction', code: 'LKO', platforms: 9, coordinates: [80.9231, 26.8311] },
    { name: 'Bangalore City (KSR)', code: 'SBC', platforms: 10, coordinates: [77.5669, 12.9773] },
    { name: 'Ahmedabad Junction', code: 'ADI', platforms: 12, coordinates: [72.6005, 23.0269] },
    { name: 'Pune Junction', code: 'PUNE', platforms: 6, coordinates: [73.8743, 18.5285] }
];

export const INDIA_AIRPORTS: InfrastructureItem[] = [
    { name: 'Indira Gandhi Intl', location: 'Delhi', iata: 'DEL', icao: 'VIDP', traffic: 72.0, coordinates: [77.1031, 28.5665] },
    { name: 'Chhatrapati Shivaji Intl', location: 'Mumbai', iata: 'BOM', icao: 'VABB', traffic: 50.0, coordinates: [72.8656, 19.0896] },
    { name: 'Kempegowda Intl', location: 'Bangalore', iata: 'BLR', icao: 'VOBL', traffic: 37.0, coordinates: [77.7066, 13.1986] },
    { name: 'Rajiv Gandhi Intl', location: 'Hyderabad', iata: 'HYD', icao: 'VOHS', traffic: 25.0, coordinates: [78.4294, 17.2403] },
    { name: 'Chennai Intl', location: 'Chennai', iata: 'MAA', icao: 'VOMM', traffic: 23.0, coordinates: [80.1709, 12.9941] },
    { name: 'Netaji Subhas Chandra Bose', location: 'Kolkata', iata: 'CCU', icao: 'VECC', traffic: 20.0, coordinates: [88.4467, 22.6547] },
    { name: 'Sardar Vallabhbhai Patel', location: 'Ahmedabad', iata: 'AMD', icao: 'VAAH', traffic: 12.0, coordinates: [72.6347, 23.0772] },
    { name: 'Cochin Intl', location: 'Kochi', iata: 'COK', icao: 'VOCI', traffic: 10.0, coordinates: [76.2730, 9.9471] },
    { name: 'Goa (Mopa)', location: 'Goa', iata: 'GOX', icao: 'VOGO', traffic: 5.0, coordinates: [73.8333, 15.7383] },
    { name: 'Pune', location: 'Pune', iata: 'PNQ', icao: 'VAPO', traffic: 10.0, coordinates: [73.9197, 18.5822] }
];

export const INDIA_NUCLEAR_PLANTS: InfrastructureItem[] = [
    { name: 'Tarapur (TAPS)', location: 'Maharashtra', capacity: '1,400 MW', coordinates: [72.6580, 19.8310] },
    { name: 'Rawatbhata (RAPS)', location: 'Rajasthan', capacity: '1,180 MW', coordinates: [75.5870, 24.8800] },
    { name: 'Kalpakkam (MAPS)', location: 'Tamil Nadu', capacity: '440 MW', coordinates: [80.1720, 12.5570] },
    { name: 'Narora (NAPS)', location: 'UP', capacity: '440 MW', coordinates: [78.3960, 28.1760] },
    { name: 'Kakrapar (KAPS)', location: 'Gujarat', capacity: '1,440 MW', coordinates: [73.3500, 21.2360] },
    { name: 'Kaiga (KGS)', location: 'Karnataka', capacity: '880 MW', coordinates: [74.4340, 14.8500] },
    { name: 'Kudankulam (KKNPP)', location: 'Tamil Nadu', capacity: '2,000 MW', coordinates: [77.7110, 8.1690] }
];

export const INDIA_POWER_PLANTS: InfrastructureItem[] = [
    { name: 'Vindhyachal STPS', location: 'MP', capacity: '4,760 MW', type: 'Thermal', coordinates: [82.6600, 24.0800] },
    { name: 'Mundra TPS', location: 'Gujarat', capacity: '4,620 MW', type: 'Thermal', coordinates: [69.7200, 22.7300] },
    { name: 'Sipat STPS', location: 'Chhattisgarh', capacity: '2,980 MW', type: 'Thermal', coordinates: [82.2700, 22.1400] },
    { name: 'Bhadla Solar Park', location: 'Rajasthan', capacity: '2,245 MW', type: 'Solar', coordinates: [71.9200, 27.5400] },
    { name: 'Pavagada Solar Park', location: 'Karnataka', capacity: '2,050 MW', type: 'Solar', coordinates: [77.2600, 14.1000] }
];

export const INDIA_MAJOR_DAMS: InfrastructureItem[] = [
    { name: 'Tehri Dam', location: 'Uttarakhand', height: '260.5m', coordinates: [78.4833, 30.3778] },
    { name: 'Bhakra Dam', location: 'HP/Punjab', height: '226m', coordinates: [76.4333, 31.4167] },
    { name: 'Sardar Sarovar', location: 'Gujarat', height: '163m', coordinates: [73.7450, 21.8300] },
    { name: 'Hirakud Dam', location: 'Odisha', height: '61m', coordinates: [83.8700, 21.5200] },
    { name: 'Nagarjuna Sagar', location: 'Telangana/AP', height: '124m', coordinates: [79.3125, 16.5725] }
];

export const INDIA_DATA_CENTERS: InfrastructureItem[] = [
    { name: 'Mumbai DC Hub', location: 'Mumbai', notes: 'India largest hub (~70% traffic)', coordinates: [72.8777, 19.0760] },
    { name: 'Chennai DC Hub', location: 'Chennai', notes: 'Ambattur, Porur', coordinates: [80.2707, 13.0827] },
    { name: 'Hyderabad DC Hub', location: 'Hyderabad', notes: 'Gachibowli, Kondapur', coordinates: [78.4867, 17.3850] },
    { name: 'Bangalore DC Hub', location: 'Bengaluru', notes: 'Whitefield, Electronic City', coordinates: [77.5946, 12.9716] },
    { name: 'Delhi NCR DC Hub', location: 'Noida/Gurugram', notes: 'North India Hub', coordinates: [77.3300, 28.5700] },
    { name: 'Yotta D1', location: 'Navi Mumbai', notes: 'India largest DC', coordinates: [73.1200, 18.9900] }
];

export const INDIA_HIGH_SPEED_RAIL = {
    name: 'Mumbai-Ahmedabad HSR',
    path: [
        [72.8640, 19.0660], // Mumbai BKC
        [72.9750, 19.1860], // Thane
        [72.8100, 19.4550], // Virar
        [72.9050, 20.3710], // Vapi
        [72.8310, 21.1700], // Surat
        [72.9960, 21.7050], // Bharuch
        [73.1810, 22.3100], // Vadodara
        [72.6000, 23.0270]  // Ahmedabad
    ]
};

export const INDIA_CORRIDORS = [
    { name: 'Delhi-Mumbai Expressway', length: '1350km', path: [[77.209, 28.614], [72.878, 19.076]] },
    { name: 'Mumbai-Pune Expressway', length: '94km', path: [[72.937, 19.020], [73.857, 18.520]] },
    { name: 'Yamuna Expressway', length: '165km', path: [[77.388, 28.507], [80.923, 26.847]] }, // Actually to Agra, but close enough approximation for now
    { name: 'Agra-Lucknow Expressway', length: '302km', path: [[77.987, 27.176], [80.946, 26.847]] }
];
