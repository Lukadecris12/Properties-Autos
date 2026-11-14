export interface CountryData {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  states: string[];
}

export const COUNTRIES: CountryData[] = [
  {
    name: "Nigeria",
    code: "NG",
    dialCode: "+234",
    flag: "🇳🇬",
    states: [
      "Lagos", "Abuja FCT", "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
      "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe",
      "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Nasarawa",
      "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
      "Yobe", "Zamfara"
    ]
  },
  {
    name: "Afghanistan",
    code: "AF",
    dialCode: "+93",
    flag: "🇦🇫",
    states: ["Kabul", "Herat", "Kandahar", "Balkh", "Nangarhar", "Kunduz", "Baghlan", "Helmand", "Ghazni", "Badakhshan"]
  },
  {
    name: "Albania",
    code: "AL",
    dialCode: "+355",
    flag: "🇦🇱",
    states: ["Tirana", "Durres", "Vlore", "Shkoder", "Fier", "Korce", "Elbasan", "Berat", "Lezhe", "Kukes", "Diber", "Gjirokaster"]
  },
  {
    name: "Algeria",
    code: "DZ",
    dialCode: "+213",
    flag: "🇩🇿",
    states: ["Algiers", "Oran", "Constantine", "Annaba", "Blida", "Setif", "Batna", "Tlemcen", "Bejaia", "Tizi Ouzou"]
  },
  {
    name: "Andorra",
    code: "AD",
    dialCode: "+376",
    flag: "🇦🇩",
    states: ["Andorra la Vella", "Canillo", "Encamp", "Escaldes-Engordany", "La Massana", "Ordino", "Sant Julia de Loria"]
  },
  {
    name: "Angola",
    code: "AO",
    dialCode: "+244",
    flag: "🇦🇴",
    states: ["Luanda", "Benguela", "Huambo", "Huila", "Cabinda", "Cuanza Sul", "Bie", "Malanje", "Namibe", "Uige"]
  },
  {
    name: "Antigua and Barbuda",
    code: "AG",
    dialCode: "+1-268",
    flag: "🇦🇬",
    states: ["Saint John", "Saint George", "Saint Mary", "Saint Paul", "Saint Peter", "Saint Philip", "Barbuda"]
  },
  {
    name: "Argentina",
    code: "AR",
    dialCode: "+54",
    flag: "🇦🇷",
    states: ["Buenos Aires", "Autonomous City of Buenos Aires", "Cordoba", "Santa Fe", "Mendoza", "Tucuman", "Salta", "Entre Rios", "Misiones", "Neuquen", "Rio Negro"]
  },
  {
    name: "Armenia",
    code: "AM",
    dialCode: "+374",
    flag: "🇦🇲",
    states: ["Yerevan", "Aragatsotn", "Ararat", "Armavir", "Gegharkunik", "Kotayk", "Lori", "Shirak", "Syunik", "Tavush", "Vayots Dzor"]
  },
  {
    name: "Australia",
    code: "AU",
    dialCode: "+61",
    flag: "🇦🇺",
    states: ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania", "Australian Capital Territory", "Northern Territory"]
  },
  {
    name: "Austria",
    code: "AT",
    dialCode: "+43",
    flag: "🇦🇹",
    states: ["Vienna", "Lower Austria", "Upper Austria", "Styria", "Tyrol", "Carinthia", "Salzburg", "Vorarlberg", "Burgenland"]
  },
  {
    name: "Azerbaijan",
    code: "AZ",
    dialCode: "+994",
    flag: "🇦🇿",
    states: ["Baku", "Ganja", "Sumqayit", "Lankaran", "Mingachevir", "Nakhchivan", "Sheki", "Shirvan"]
  },
  {
    name: "Bahamas",
    code: "BS",
    dialCode: "+1-242",
    flag: "🇧🇸",
    states: ["New Providence", "Grand Bahama", "Abaco", "Andros", "Eleuthera", "Exuma", "Long Island"]
  },
  {
    name: "Bahrain",
    code: "BH",
    dialCode: "+973",
    flag: "🇧🇭",
    states: ["Capital Governorate", "Muharraq", "Northern Governorate", "Southern Governorate"]
  },
  {
    name: "Bangladesh",
    code: "BD",
    dialCode: "+880",
    flag: "🇧🇩",
    states: ["Dhaka", "Chattogram", "Rajshahi", "Khulna", "Barishal", "Sylhet", "Rangpur", "Mymensingh"]
  },
  {
    name: "Barbados",
    code: "BB",
    dialCode: "+1-246",
    flag: "🇧🇧",
    states: ["Saint Michael", "Christ Church", "Saint James", "Saint George", "Saint Philip", "Saint Thomas", "Saint Peter"]
  },
  {
    name: "Belarus",
    code: "BY",
    dialCode: "+375",
    flag: "🇧🇾",
    states: ["Minsk", "Minsk Region", "Brest", "Gomel", "Grodno", "Mogilev", "Vitebsk"]
  },
  {
    name: "Belgium",
    code: "BE",
    dialCode: "+32",
    flag: "🇧🇪",
    states: ["Brussels-Capital Region", "Antwerp", "East Flanders", "West Flanders", "Flemish Brabant", "Limburg", "Hainaut", "Liege", "Luxembourg", "Namur", "Walloon Brabant"]
  },
  {
    name: "Belize",
    code: "BZ",
    dialCode: "+501",
    flag: "🇧🇿",
    states: ["Belize", "Cayo", "Corozal", "Orange Walk", "Stann Creek", "Toledo"]
  },
  {
    name: "Benin",
    code: "BJ",
    dialCode: "+229",
    flag: "🇧🇯",
    states: ["Littoral", "Atlantique", "Oueme", "Borgou", "Zou", "Alibori", "Atakora", "Collines", "Kouffo", "Donga", "Mono", "Plateau"]
  },
  {
    name: "Bhutan",
    code: "BT",
    dialCode: "+975",
    flag: "🇧🇹",
    states: ["Thimphu", "Paro", "Punakha", "Chukha", "Bumthang", "Trashigang", "Wangdue Phodrang"]
  },
  {
    name: "Bolivia",
    code: "BO",
    dialCode: "+591",
    flag: "🇧🇴",
    states: ["La Paz", "Santa Cruz", "Cochabamba", "Chuquisaca", "Oruro", "Potosi", "Tarija", "Beni", "Pando"]
  },
  {
    name: "Bosnia and Herzegovina",
    code: "BA",
    dialCode: "+387",
    flag: "🇧🇦",
    states: ["Federation of Bosnia and Herzegovina", "Republika Srpska", "Brcko District"]
  },
  {
    name: "Botswana",
    code: "BW",
    dialCode: "+267",
    flag: "🇧🇼",
    states: ["South-East", "Central", "Ghanzi", "Kgalagadi", "Kgatleng", "Kweneng", "North-East", "North-West", "Southern"]
  },
  {
    name: "Brazil",
    code: "BR",
    dialCode: "+55",
    flag: "🇧🇷",
    states: [
      "Sao Paulo", "Rio de Janeiro", "Minas Gerais", "Bahia", "Parana", "Rio Grande do Sul",
      "Pernambuco", "Ceara", "Para", "Santa Catarina", "Goias", "Maranhao", "Amazonas",
      "Espirito Santo", "Paraiba", "Rio Grande do Norte", "Mato Grosso", "Alagoas", "Piaui",
      "Distrito Federal", "Mato Grosso do Sul", "Sergipe", "Rondonia", "Tocantins", "Acre", "Amapa", "Roraima"
    ]
  },
  {
    name: "Brunei",
    code: "BN",
    dialCode: "+673",
    flag: "🇧🇳",
    states: ["Brunei-Muara", "Belait", "Tutong", "Temburong"]
  },
  {
    name: "Bulgaria",
    code: "BG",
    dialCode: "+359",
    flag: "🇧🇬",
    states: ["Sofia City", "Plovdiv", "Varna", "Burgas", "Ruse", "Stara Zagora", "Pleven", "Blagoevgrad"]
  },
  {
    name: "Burkina Faso",
    code: "BF",
    dialCode: "+226",
    flag: "🇧🇫",
    states: ["Centre", "Hauts-Bassins", "Boucle du Mouhoun", "Cascades", "Centre-Est", "Centre-Nord", "Centre-Ouest", "Centre-Sud", "Est", "Nord", "Plateau-Central", "Sahel", "Sud-Ouest"]
  },
  {
    name: "Burundi",
    code: "BI",
    dialCode: "+257",
    flag: "🇧🇮",
    states: ["Bujumbura Mairie", "Gitega", "Ngozi", "Muyinga", "Kayanza", "Bururi", "Makamba"]
  },
  {
    name: "Cabo Verde",
    code: "CV",
    dialCode: "+238",
    flag: "🇨🇻",
    states: ["Praia", "Sao Vicente", "Santa Catarina", "Sal", "Boa Vista", "Sao Filipe"]
  },
  {
    name: "Cambodia",
    code: "KH",
    dialCode: "+855",
    flag: "🇰🇭",
    states: ["Phnom Penh", "Siem Reap", "Battambang", "Preah Sihanouk", "Kandal", "Kampong Cham", "Kampot"]
  },
  {
    name: "Cameroon",
    code: "CM",
    dialCode: "+237",
    flag: "🇨🇲",
    states: ["Centre", "Littoral", "West", "North-West", "South-West", "Far North", "North", "Adamawa", "East", "South"]
  },
  {
    name: "Canada",
    code: "CA",
    dialCode: "+1",
    flag: "🇨🇦",
    states: [
      "Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Saskatchewan",
      "Nova Scotia", "New Brunswick", "Newfoundland and Labrador", "Prince Edward Island",
      "Northwest Territories", "Yukon", "Nunavut"
    ]
  },
  {
    name: "Central African Republic",
    code: "CF",
    dialCode: "+236",
    flag: "🇨🇫",
    states: ["Bangui", "Ombella-M'Poko", "Lobaye", "Ouaka", "Haute-Kotto", "Ouham", "Nana-Mambere"]
  },
  {
    name: "Chad",
    code: "TD",
    dialCode: "+235",
    flag: "🇹🇩",
    states: ["N'Djamena", "Logone Occidental", "Mayo-Kebbi Est", "Moyen-Chari", "Ouaddai", "Batha", "Borkou"]
  },
  {
    name: "Chile",
    code: "CL",
    dialCode: "+56",
    flag: "🇨🇱",
    states: ["Santiago Metropolitan", "Valparaiso", "Biobio", "Maule", "La Araucania", "O'Higgins", "Los Lagos", "Antofagasta", "Coquimbo"]
  },
  {
    name: "China",
    code: "CN",
    dialCode: "+86",
    flag: "🇨🇳",
    states: [
      "Beijing", "Shanghai", "Guangdong", "Zhejiang", "Jiangsu", "Sichuan", "Hubei",
      "Fujian", "Shandong", "Henan", "Hunan", "Anhui", "Shaanxi", "Chongqing", "Tianjin",
      "Liaoning", "Yunnan", "Hebei", "Jiangxi", "Guangxi"
    ]
  },
  {
    name: "Colombia",
    code: "CO",
    dialCode: "+57",
    flag: "🇨🇴",
    states: ["Bogota D.C.", "Antioquia", "Valle del Cauca", "Cundinamarca", "Atlantico", "Santander", "Bolivar", "Boyaca", "Narino", "Tolima"]
  },
  {
    name: "Comoros",
    code: "KM",
    dialCode: "+269",
    flag: "🇰🇲",
    states: ["Grande Comore", "Anjouan", "Moheli"]
  },
  {
    name: "Congo (Republic)",
    code: "CG",
    dialCode: "+242",
    flag: "🇨🇬",
    states: ["Brazzaville", "Pointe-Noire", "Bouenza", "Pool", "Niari", "Cuvette", "Sangha"]
  },
  {
    name: "Congo (DRC)",
    code: "CD",
    dialCode: "+243",
    flag: "🇨🇩",
    states: ["Kinshasa", "Haut-Katanga", "North Kivu", "South Kivu", "Kongo Central", "Kasai", "Tshopo", "Ituri"]
  },
  {
    name: "Costa Rica",
    code: "CR",
    dialCode: "+506",
    flag: "🇨🇷",
    states: ["San Jose", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limon"]
  },
  {
    name: "Cote d'Ivoire",
    code: "CI",
    dialCode: "+225",
    flag: "🇨🇮",
    states: ["Abidjan", "Yamoussoukro", "Bas-Sassandra", "Comoe", "Goh-Djiboua", "Lacs", "Lagunes", "Montagnes", "Sassandra-Marahoue", "Vallee du Bandama"]
  },
  {
    name: "Croatia",
    code: "HR",
    dialCode: "+385",
    flag: "🇭🇷",
    states: ["City of Zagreb", "Split-Dalmatia", "Primorje-Gorski Kotar", "Istria", "Osijek-Baranja", "Zadar", "Dubrovnik-Neretva"]
  },
  {
    name: "Cuba",
    code: "CU",
    dialCode: "+53",
    flag: "🇨🇺",
    states: ["Havana", "Santiago de Cuba", "Camaguey", "Holguin", "Villa Clara", "Matanzas", "Pinar del Rio"]
  },
  {
    name: "Cyprus",
    code: "CY",
    dialCode: "+357",
    flag: "🇨🇾",
    states: ["Nicosia", "Limassol", "Larnaca", "Paphos", "Famagusta", "Kyrenia"]
  },
  {
    name: "Czechia",
    code: "CZ",
    dialCode: "+420",
    flag: "🇨🇿",
    states: ["Prague", "Central Bohemia", "South Moravia", "Moravia-Silesia", "South Bohemia", "Plzen", "Usti nad Labem", "Olomouc"]
  },
  {
    name: "Denmark",
    code: "DK",
    dialCode: "+45",
    flag: "🇩🇰",
    states: ["Capital Region of Denmark", "Central Denmark", "North Denmark", "Region Zealand", "Region of Southern Denmark"]
  },
  {
    name: "Djibouti",
    code: "DJ",
    dialCode: "+253",
    flag: "🇩🇯",
    states: ["Djibouti", "Ali Sabieh", "Arta", "Dikhil", "Obock", "Tadjourah"]
  },
  {
    name: "Dominica",
    code: "DM",
    dialCode: "+1-767",
    flag: "🇩🇲",
    states: ["Saint George", "Saint Andrew", "Saint David", "Saint John", "Saint Joseph", "Saint Luke", "Saint Mark", "Saint Patrick", "Saint Paul", "Saint Peter"]
  },
  {
    name: "Dominican Republic",
    code: "DO",
    dialCode: "+1-809",
    flag: "🇩🇴",
    states: ["Distrito Nacional", "Santo Domingo", "Santiago", "La Altagracia", "Puerto Plata", "La Romana", "San Cristobal", "Duarte"]
  },
  {
    name: "Ecuador",
    code: "EC",
    dialCode: "+593",
    flag: "🇪🇨",
    states: ["Pichincha", "Guayas", "Azuay", "Manabi", "El Oro", "Loja", "Tungurahua", "Esmeraldas", "Galapagos"]
  },
  {
    name: "Egypt",
    code: "EG",
    dialCode: "+20",
    flag: "🇪🇬",
    states: ["Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Sharqia", "Gharbia", "Luxor", "Aswan", "South Sinai"]
  },
  {
    name: "El Salvador",
    code: "SV",
    dialCode: "+503",
    flag: "🇸🇻",
    states: ["San Salvador", "La Libertad", "Santa Ana", "San Miguel", "Sonsonate", "Usulutan", "Ahuachapan"]
  },
  {
    name: "Equatorial Guinea",
    code: "GQ",
    dialCode: "+240",
    flag: "🇬🇶",
    states: ["Bioko Norte", "Litoral", "Centro Sur", "Kie-Ntem", "Wele-Nzas", "Annobon"]
  },
  {
    name: "Eritrea",
    code: "ER",
    dialCode: "+291",
    flag: "🇪🇷",
    states: ["Maekel", "Anseba", "Debub", "Gash-Barka", "Northern Red Sea", "Southern Red Sea"]
  },
  {
    name: "Estonia",
    code: "EE",
    dialCode: "+372",
    flag: "🇪🇪",
    states: ["Harju", "Tartu", "Ida-Viru", "Parnu", "Laane-Viru", "Viljandi", "Saare"]
  },
  {
    name: "Eswatini",
    code: "SZ",
    dialCode: "+268",
    flag: "🇸🇿",
    states: ["Hhohho", "Manzini", "Lubombo", "Shiselweni"]
  },
  {
    name: "Ethiopia",
    code: "ET",
    dialCode: "+251",
    flag: "🇪🇹",
    states: ["Addis Ababa", "Oromia", "Amhara", "Tigray", "Sidama", "Somali", "Afar", "Dire Dawa", "Harari"]
  },
  {
    name: "Fiji",
    code: "FJ",
    dialCode: "+679",
    flag: "🇫🇯",
    states: ["Central", "Western", "Northern", "Eastern", "Rotuma"]
  },
  {
    name: "Finland",
    code: "FI",
    dialCode: "+358",
    flag: "🇫🇮",
    states: ["Uusimaa", "Pirkanmaa", "Southwest Finland", "North Ostrobothnia", "Central Finland", "Lapland", "Satakunta"]
  },
  {
    name: "France",
    code: "FR",
    dialCode: "+33",
    flag: "🇫🇷",
    states: [
      "Ile-de-France", "Auvergne-Rhone-Alpes", "Nouvelle-Aquitaine", "Occitanie",
      "Hauts-de-France", "Provence-Alpes-Cote d'Azur", "Grand Est", "Pays de la Loire",
      "Brittany", "Normandy", "Bourgogne-Franche-Comte", "Centre-Val de Loire", "Corsica"
    ]
  },
  {
    name: "Gabon",
    code: "GA",
    dialCode: "+241",
    flag: "🇬🇦",
    states: ["Estuaire", "Ogooue-Maritime", "Haut-Ogooue", "Moyen-Ogooue", "Ngounie", "Nyanga", "Woleu-Ntem"]
  },
  {
    name: "Gambia",
    code: "GM",
    dialCode: "+220",
    flag: "🇬🇲",
    states: ["Banjul", "Kanifing", "West Coast", "Lower River", "Central River", "Upper River", "North Bank"]
  },
  {
    name: "Georgia",
    code: "GE",
    dialCode: "+995",
    flag: "🇬🇪",
    states: ["Tbilisi", "Adjara", "Imereti", "Kakheti", "Kvemo Kartli", "Shida Kartli", "Samegrelo-Zemo Svaneti"]
  },
  {
    name: "Germany",
    code: "DE",
    dialCode: "+49",
    flag: "🇩🇪",
    states: [
      "Berlin", "Bavaria", "North Rhine-Westphalia", "Baden-Wurttemberg", "Hesse", "Hamburg",
      "Lower Saxony", "Saxony", "Rhineland-Palatinate", "Schleswig-Holstein", "Brandenburg",
      "Saxony-Anhalt", "Thuringia", "Mecklenburg-Vorpommern", "Bremen", "Saarland"
    ]
  },
  {
    name: "Ghana",
    code: "GH",
    dialCode: "+233",
    flag: "🇬🇭",
    states: [
      "Greater Accra", "Ashanti", "Western", "Central", "Eastern", "Northern", "Volta",
      "Bono", "Upper East", "Upper West", "Ahafo", "Bono East", "Oti", "Savannah", "North East", "Western North"
    ]
  },
  {
    name: "Greece",
    code: "GR",
    dialCode: "+30",
    flag: "🇬🇷",
    states: ["Attica", "Central Macedonia", "Crete", "Thessaly", "Western Greece", "Peloponnese", "South Aegean", "Epirus"]
  },
  {
    name: "Grenada",
    code: "GD",
    dialCode: "+1-473",
    flag: "🇬🇩",
    states: ["Saint George", "Saint Andrew", "Saint David", "Saint John", "Saint Mark", "Saint Patrick", "Carriacou and Petite Martinique"]
  },
  {
    name: "Guatemala",
    code: "GT",
    dialCode: "+502",
    flag: "🇬🇹",
    states: ["Guatemala", "Quetzaltenango", "Escuintla", "Alta Verapaz", "Huehuetenango", "Peten", "Sacatepequez"]
  },
  {
    name: "Guinea",
    code: "GN",
    dialCode: "+224",
    flag: "🇬🇳",
    states: ["Conakry", "Kindia", "Boke", "Kankan", "Labe", "Mamou", "Nzerekore", "Faranah"]
  },
  {
    name: "Guinea-Bissau",
    code: "GW",
    dialCode: "+245",
    flag: "🇬🇼",
    states: ["Bissau", "Bafata", "Biombo", "Cacheu", "Gabu", "Oio", "Quinara", "Tombali"]
  },
  {
    name: "Guyana",
    code: "GY",
    dialCode: "+592",
    flag: "🇬🇾",
    states: ["Demerara-Mahaica", "Essequibo Islands-West Demerara", "East Berbice-Corentyne", "Upper Demerara-Berbice", "Cuyuni-Mazaruni"]
  },
  {
    name: "Haiti",
    code: "HT",
    dialCode: "+509",
    flag: "🇭🇹",
    states: ["Ouest", "Artibonite", "Nord", "Sud", "Centre", "Grand'Anse", "Nord-Est", "Sud-Est"]
  },
  {
    name: "Honduras",
    code: "HN",
    dialCode: "+504",
    flag: "🇭🇳",
    states: ["Francisco Morazan", "Cortes", "Atlantida", "Comayagua", "Copan", "Choluteca", "Yoro", "Islas de la Bahia"]
  },
  {
    name: "Hungary",
    code: "HU",
    dialCode: "+36",
    flag: "🇭🇺",
    states: ["Budapest", "Pest", "Borsod-Abauj-Zemplen", "Hajdu-Bihar", "Gyor-Moson-Sopron", "Csongrad-Csanad", "Fejer", "Baranya"]
  },
  {
    name: "Iceland",
    code: "IS",
    dialCode: "+354",
    flag: "🇮🇸",
    states: ["Capital Region", "Southern Peninsula", "West", "Westfjords", "Northwest", "Northeast", "East", "South"]
  },
  {
    name: "India",
    code: "IN",
    dialCode: "+91",
    flag: "🇮🇳",
    states: [
      "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Telangana", "Gujarat", "Uttar Pradesh",
      "West Bengal", "Rajasthan", "Kerala", "Punjab", "Haryana", "Madhya Pradesh", "Bihar",
      "Odisha", "Assam", "Andhra Pradesh", "Goa", "Chandigarh", "Jammu and Kashmir"
    ]
  },
  {
    name: "Indonesia",
    code: "ID",
    dialCode: "+62",
    flag: "🇮🇩",
    states: ["Jakarta", "West Java", "East Java", "Central Java", "Bali", "Banten", "North Sumatra", "South Sulawesi", "Yogyakarta", "Riau"]
  },
  {
    name: "Iran",
    code: "IR",
    dialCode: "+98",
    flag: "🇮🇷",
    states: ["Tehran", "Isfahan", "Razavi Khorasan", "Fars", "East Azerbaijan", "Khuzestan", "Mazandaran", "Alborz", "Gilan"]
  },
  {
    name: "Iraq",
    code: "IQ",
    dialCode: "+964",
    flag: "🇮🇶",
    states: ["Baghdad", "Basra", "Erbil", "Nineveh", "Sulaymaniyah", "Najaf", "Karbala", "Kirkuk", "Anbar"]
  },
  {
    name: "Ireland",
    code: "IE",
    dialCode: "+353",
    flag: "🇮🇪",
    states: ["Dublin", "Cork", "Galway", "Limerick", "Kildare", "Meath", "Wicklow", "Waterford", "Donegal", "Kerry"]
  },
  {
    name: "Israel",
    code: "IL",
    dialCode: "+972",
    flag: "🇮🇱",
    states: ["Tel Aviv District", "Jerusalem District", "Central District", "Haifa District", "Northern District", "Southern District"]
  },
  {
    name: "Italy",
    code: "IT",
    dialCode: "+39",
    flag: "🇮🇹",
    states: [
      "Lombardy", "Lazio", "Campania", "Veneto", "Piedmont", "Emilia-Romagna", "Tuscany",
      "Sicily", "Puglia", "Liguria", "Calabria", "Sardinia", "Trentino-South Tyrol", "Friuli-Venezia Giulia"
    ]
  },
  {
    name: "Jamaica",
    code: "JM",
    dialCode: "+1-876",
    flag: "🇯🇲",
    states: ["Kingston", "Saint Andrew", "Saint Catherine", "Saint James", "Clarendon", "Manchester", "Saint Ann", "Westmoreland"]
  },
  {
    name: "Japan",
    code: "JP",
    dialCode: "+81",
    flag: "🇯🇵",
    states: ["Tokyo", "Osaka", "Kanagawa", "Aichi", "Saitama", "Chiba", "Hyogo", "Hokkaido", "Fukuoka", "Kyoto", "Okinawa"]
  },
  {
    name: "Jordan",
    code: "JO",
    dialCode: "+962",
    flag: "🇯🇴",
    states: ["Amman", "Irbid", "Zarqa", "Balqa", "Aqaba", "Madaba", "Karak", "Mafraq"]
  },
  {
    name: "Kazakhstan",
    code: "KZ",
    dialCode: "+7",
    flag: "🇰🇿",
    states: ["Almaty", "Astana", "Shymkent", "Karaganda", "Aktobe", "Atyrau", "East Kazakhstan", "Mangystau"]
  },
  {
    name: "Kenya",
    code: "KE",
    dialCode: "+254",
    flag: "🇰🇪",
    states: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Eldoret (Uasin Gishu)", "Machakos", "Kajiado", "Kilifi", "Nyeri"]
  },
  {
    name: "Kiribati",
    code: "KI",
    dialCode: "+686",
    flag: "🇰🇮",
    states: ["Gilbert Islands", "Line Islands", "Phoenix Islands"]
  },
  {
    name: "Kuwait",
    code: "KW",
    dialCode: "+965",
    flag: "🇰🇼",
    states: ["Al Asimah (Capital)", "Hawalli", "Farwaniya", "Ahmadi", "Jahra", "Mubarak Al-Kabeer"]
  },
  {
    name: "Kyrgyzstan",
    code: "KG",
    dialCode: "+996",
    flag: "🇰🇬",
    states: ["Bishkek", "Osh", "Chuy", "Issyk-Kul", "Jalal-Abad", "Naryn", "Batken", "Talas"]
  },
  {
    name: "Laos",
    code: "LA",
    dialCode: "+856",
    flag: "🇱🇦",
    states: ["Vientiane Prefecture", "Luang Prabang", "Savannakhet", "Champasak", "Vientiane Province", "Khammouane"]
  },
  {
    name: "Latvia",
    code: "LV",
    dialCode: "+371",
    flag: "🇱🇻",
    states: ["Riga", "Pieriga", "Kurzeme", "Latgale", "Vidzeme", "Zemgale"]
  },
  {
    name: "Lebanon",
    code: "LB",
    dialCode: "+961",
    flag: "🇱🇧",
    states: ["Beirut", "Mount Lebanon", "North Lebanon", "South Lebanon", "Bekaa", "Nabatieh", "Akkar", "Baalbek-Hermel"]
  },
  {
    name: "Lesotho",
    code: "LS",
    dialCode: "+266",
    flag: "🇱🇸",
    states: ["Maseru", "Leribe", "Berea", "Mafeteng", "Mohale's Hoek", "Quthing", "Butha-Buthe"]
  },
  {
    name: "Liberia",
    code: "LR",
    dialCode: "+231",
    flag: "🇱🇷",
    states: ["Montserrado", "Nimba", "Bong", "Grand Bassa", "Margibi", "Lofa", "Maryland", "Grand Cape Mount"]
  },
  {
    name: "Libya",
    code: "LY",
    dialCode: "+218",
    flag: "🇱🇾",
    states: ["Tripoli", "Benghazi", "Misrata", "Zawiya", "Sabha", "Tobruk", "Derna"]
  },
  {
    name: "Liechtenstein",
    code: "LI",
    dialCode: "+423",
    flag: "🇱🇮",
    states: ["Vaduz", "Schaan", "Triesen", "Balzers", "Eschen", "Mauren"]
  },
  {
    name: "Lithuania",
    code: "LT",
    dialCode: "+370",
    flag: "🇱🇹",
    states: ["Vilnius", "Kaunas", "Klaipeda", "Siauliai", "Panevezys", "Alytus", "Marijampole"]
  },
  {
    name: "Luxembourg",
    code: "LU",
    dialCode: "+352",
    flag: "🇱🇺",
    states: ["Luxembourg", "Esch-sur-Alzette", "Capellen", "Mersch", "Diekirch", "Grevenmacher"]
  },
  {
    name: "Madagascar",
    code: "MG",
    dialCode: "+261",
    flag: "🇲🇬",
    states: ["Analamanga (Antananarivo)", "Atsinanana (Toamasina)", "Boeny (Mahajanga)", "Atsimo-Andrefana", "Haute Matsiatra", "Diana"]
  },
  {
    name: "Malawi",
    code: "MW",
    dialCode: "+265",
    flag: "🇲🇼",
    states: ["Central Region (Lilongwe)", "Southern Region (Blantyre)", "Northern Region (Mzuzu)"]
  },
  {
    name: "Malaysia",
    code: "MY",
    dialCode: "+60",
    flag: "🇲🇾",
    states: [
      "Kuala Lumpur", "Selangor", "Penang", "Johor", "Sabah", "Sarawak", "Perak",
      "Pahang", "Negeri Sembilan", "Kedah", "Melaka", "Kelantan", "Terengganu", "Putrajaya"
    ]
  },
  {
    name: "Maldives",
    code: "MV",
    dialCode: "+960",
    flag: "🇲🇻",
    states: ["Male", "Addu City", "Fuvahmulah", "Kulhudhuffushi", "Kaafu Atoll"]
  },
  {
    name: "Mali",
    code: "ML",
    dialCode: "+223",
    flag: "🇲🇱",
    states: ["Bamako", "Koulikoro", "Sikasso", "Segou", "Mopti", "Kayes", "Gao", "Timbuktu"]
  },
  {
    name: "Malta",
    code: "MT",
    dialCode: "+356",
    flag: "🇲🇹",
    states: ["Valletta / Harbour", "Northern", "South Eastern", "Western", "Gozo"]
  },
  {
    name: "Marshall Islands",
    code: "MH",
    dialCode: "+692",
    flag: "🇲🇭",
    states: ["Majuro", "Ebeye (Kwajalein)", "Jaluit", "Wotje"]
  },
  {
    name: "Mauritania",
    code: "MR",
    dialCode: "+222",
    flag: "🇲🇷",
    states: ["Nouakchott", "Dakhlet Nouadhibou", "Trarza", "Brakna", "Assaba", "Hodh Ech Chargui"]
  },
  {
    name: "Mauritius",
    code: "MU",
    dialCode: "+230",
    flag: "🇲🇺",
    states: ["Port Louis", "Plaines Wilhems", "Pamplemousses", "Riviere du Rempart", "Flacq", "Grand Port", "Moka", "Black River", "Savanne", "Rodrigues"]
  },
  {
    name: "Mexico",
    code: "MX",
    dialCode: "+52",
    flag: "🇲🇽",
    states: [
      "Mexico City", "State of Mexico", "Jalisco", "Nuevo Leon", "Puebla", "Guanajuato",
      "Veracruz", "Baja California", "Quintana Roo", "Yucatan", "Queretaro", "Chihuahua", "Sinaloa", "Oaxaca"
    ]
  },
  {
    name: "Micronesia",
    code: "FM",
    dialCode: "+691",
    flag: "🇫🇲",
    states: ["Pohnpei", "Chuuk", "Yap", "Kosrae"]
  },
  {
    name: "Moldova",
    code: "MD",
    dialCode: "+373",
    flag: "🇲🇩",
    states: ["Chisinau", "Balti", "Gagauzia", "Cahul", "Orhei", "Ungheni"]
  },
  {
    name: "Monaco",
    code: "MC",
    dialCode: "+377",
    flag: "🇲🇨",
    states: ["Monte Carlo", "La Condamine", "Monaco-Ville", "Fontvieille"]
  },
  {
    name: "Mongolia",
    code: "MN",
    dialCode: "+976",
    flag: "🇲🇳",
    states: ["Ulaanbaatar", "Darkhan-Uul", "Orkhon", "Selenge", "Tov", "Dornod", "Omnogovi"]
  },
  {
    name: "Montenegro",
    code: "ME",
    dialCode: "+382",
    flag: "🇲🇪",
    states: ["Podgorica", "Budva", "Bar", "Herceg Novi", "Kotor", "Niksic", "Tivat"]
  },
  {
    name: "Morocco",
    code: "MA",
    dialCode: "+212",
    flag: "🇲🇦",
    states: ["Casablanca-Settat", "Rabat-Sale-Kenitra", "Marrakesh-Safi", "Tanger-Tetouan-Al Hoceima", "Fes-Meknes", "Souss-Massa", "Oriental"]
  },
  {
    name: "Mozambique",
    code: "MZ",
    dialCode: "+258",
    flag: "🇲🇿",
    states: ["Maputo City", "Maputo Province", "Sofala", "Nampula", "Zambezia", "Tete", "Inhambane", "Gaza", "Cabo Delgado"]
  },
  {
    name: "Myanmar",
    code: "MM",
    dialCode: "+95",
    flag: "🇲🇲",
    states: ["Yangon", "Mandalay", "Naypyidaw", "Shan", "Bago", "Ayeyarwady", "Sagaing", "Mon"]
  },
  {
    name: "Namibia",
    code: "NA",
    dialCode: "+264",
    flag: "🇳🇦",
    states: ["Khomas", "Erongo", "Oshana", "Otjozondjupa", "Karas", "Hardap", "Omusati", "Zambezi"]
  },
  {
    name: "Nauru",
    code: "NR",
    dialCode: "+674",
    flag: "🇳🇷",
    states: ["Yaren", "Aiwo", "Anabar", "Boe", "Meneng"]
  },
  {
    name: "Nepal",
    code: "NP",
    dialCode: "+977",
    flag: "🇳🇵",
    states: ["Bagmati", "Koshi", "Madhesh", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"]
  },
  {
    name: "Netherlands",
    code: "NL",
    dialCode: "+31",
    flag: "🇳🇱",
    states: [
      "North Holland", "South Holland", "Utrecht", "North Brabant", "Gelderland",
      "Overijssel", "Limburg", "Flevoland", "Groningen", "Friesland", "Drenthe", "Zeeland"
    ]
  },
  {
    name: "New Zealand",
    code: "NZ",
    dialCode: "+64",
    flag: "🇳🇿",
    states: ["Auckland", "Wellington", "Canterbury", "Waikato", "Bay of Plenty", "Otago", "Manawatu-Whanganui", "Hawke's Bay", "Northland"]
  },
  {
    name: "Nicaragua",
    code: "NI",
    dialCode: "+505",
    flag: "🇳🇮",
    states: ["Managua", "Leon", "Matagalpa", "Masaya", "Chinandega", "Granada", "Esteli"]
  },
  {
    name: "Niger",
    code: "NE",
    dialCode: "+227",
    flag: "🇳🇪",
    states: ["Niamey", "Zinder", "Maradi", "Tahoua", "Dosso", "Tillaberi", "Agadez", "Diffa"]
  },
  {
    name: "North Korea",
    code: "KP",
    dialCode: "+850",
    flag: "🇰🇵",
    states: ["Pyongyang", "South Pyongan", "North Pyongan", "South Hamgyong", "North Hamgyong", "Kangwon"]
  },
  {
    name: "North Macedonia",
    code: "MK",
    dialCode: "+389",
    flag: "🇲🇰",
    states: ["Skopje", "Pelagonia", "Polog", "Eastern", "Southeastern", "Southwestern", "Vardar", "Northeastern"]
  },
  {
    name: "Norway",
    code: "NO",
    dialCode: "+47",
    flag: "🇳🇴",
    states: ["Oslo", "Akershus", "Vestland", "Rogaland", "Trondelag", "Agder", "Innlandet", "Nordland", "Troms"]
  },
  {
    name: "Oman",
    code: "OM",
    dialCode: "+968",
    flag: "🇴🇲",
    states: ["Muscat", "Dhofar", "Al Batinah North", "Al Batinah South", "Ad Dakhiliyah", "Ash Sharqiyah North", "Ash Sharqiyah South", "Al Buraimi"]
  },
  {
    name: "Pakistan",
    code: "PK",
    dialCode: "+92",
    flag: "🇵🇰",
    states: ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory", "Gilgit-Baltistan", "Azad Kashmir"]
  },
  {
    name: "Palau",
    code: "PW",
    dialCode: "+680",
    flag: "🇵🇼",
    states: ["Koror", "Airai", "Melekeok", "Ngerulmud", "Peleliu"]
  },
  {
    name: "Palestine",
    code: "PS",
    dialCode: "+970",
    flag: "🇵🇸",
    states: ["Ramallah and Al-Bireh", "Jerusalem", "Bethlehem", "Hebron", "Nablus", "Gaza", "Jenin"]
  },
  {
    name: "Panama",
    code: "PA",
    dialCode: "+507",
    flag: "🇵🇦",
    states: ["Panama", "Panama Oeste", "Chiriqui", "Colon", "Cocle", "Veraguas", "Bocas del Toro", "Herrera"]
  },
  {
    name: "Papua New Guinea",
    code: "PG",
    dialCode: "+675",
    flag: "🇵🇬",
    states: ["National Capital District", "Morobe", "Eastern Highlands", "Western Highlands", "East New Britain", "Madang"]
  },
  {
    name: "Paraguay",
    code: "PY",
    dialCode: "+595",
    flag: "🇵🇾",
    states: ["Asuncion", "Central", "Alto Parana", "Itapua", "Caaguazu", "Cordillera", "San Pedro"]
  },
  {
    name: "Peru",
    code: "PE",
    dialCode: "+51",
    flag: "🇵🇪",
    states: ["Lima", "Arequipa", "La Libertad", "Cusco", "Piura", "Lambayeque", "Junin", "Ancash", "Loreto"]
  },
  {
    name: "Philippines",
    code: "PH",
    dialCode: "+63",
    flag: "🇵🇭",
    states: ["Metro Manila (NCR)", "Calabarzon", "Central Luzon", "Central Visayas", "Western Visayas", "Davao Region", "Northern Mindanao", "Ilocos Region", "Bicol Region"]
  },
  {
    name: "Poland",
    code: "PL",
    dialCode: "+48",
    flag: "🇵🇱",
    states: ["Masovia (Warsaw)", "Lesser Poland (Krakow)", "Silesia", "Greater Poland", "Lower Silesia", "Pomerania", "Lodz", "West Pomerania", "Lublin"]
  },
  {
    name: "Portugal",
    code: "PT",
    dialCode: "+351",
    flag: "🇵🇹",
    states: ["Lisbon", "Porto", "Braga", "Setubal", "Aveiro", "Faro (Algarve)", "Coimbra", "Leiria", "Madeira", "Azores"]
  },
  {
    name: "Qatar",
    code: "QA",
    dialCode: "+974",
    flag: "🇶🇦",
    states: ["Doha", "Al Rayyan", "Al Wakrah", "Umm Salal", "Al Khor", "Al Daayen", "Al Shahaniya", "Al Shamal"]
  },
  {
    name: "Romania",
    code: "RO",
    dialCode: "+40",
    flag: "🇷🇴",
    states: ["Bucharest", "Cluj", "Timis", "Iasi", "Constanta", "Brasov", "Prahova", "Dolj", "Sibiu", "Bihor"]
  },
  {
    name: "Russia",
    code: "RU",
    dialCode: "+7",
    flag: "🇷🇺",
    states: ["Moscow", "Saint Petersburg", "Moscow Oblast", "Krasnodar Krai", "Sverdlovsk Oblast", "Tatarstan", "Novosibirsk Oblast", "Nizhny Novgorod Oblast", "Samara Oblast"]
  },
  {
    name: "Rwanda",
    code: "RW",
    dialCode: "+250",
    flag: "🇷🇼",
    states: ["Kigali City", "Eastern Province", "Northern Province", "Southern Province", "Western Province"]
  },
  {
    name: "Saint Kitts and Nevis",
    code: "KN",
    dialCode: "+1-869",
    flag: "🇰🇳",
    states: ["Saint George Basseterre", "Saint Peter Basseterre", "Saint Paul Charlestown", "Saint John Figtree"]
  },
  {
    name: "Saint Lucia",
    code: "LC",
    dialCode: "+1-758",
    flag: "🇱🇨",
    states: ["Castries", "Gros Islet", "Vieux Fort", "Soufriere", "Micoud", "Dennery"]
  },
  {
    name: "Saint Vincent and the Grenadines",
    code: "VC",
    dialCode: "+1-784",
    flag: "🇻🇨",
    states: ["Saint George", "Saint Andrew", "Saint David", "Saint Patrick", "Charlotte", "Grenadines"]
  },
  {
    name: "Samoa",
    code: "WS",
    dialCode: "+685",
    flag: "🇼🇸",
    states: ["Tuamasaga", "A'ana", "Atua", "Fa'asaleleaga", "Gaga'emauga"]
  },
  {
    name: "San Marino",
    code: "SM",
    dialCode: "+378",
    flag: "🇸🇲",
    states: ["City of San Marino", "Serravalle", "Borgo Maggiore", "Domagnano", "Fiorentino"]
  },
  {
    name: "Sao Tome and Principe",
    code: "ST",
    dialCode: "+239",
    flag: "🇸🇹",
    states: ["Agua Grande", "Me-Zochi", "Cantagalo", "Lobata", "Lemba", "Caue", "Principe"]
  },
  {
    name: "Saudi Arabia",
    code: "SA",
    dialCode: "+966",
    flag: "🇸🇦",
    states: ["Riyadh", "Makkah", "Eastern Province", "Madinah", "Asir", "Qassim", "Tabuk", "Hail", "Jazan", "Najran"]
  },
  {
    name: "Senegal",
    code: "SN",
    dialCode: "+221",
    flag: "🇸🇳",
    states: ["Dakar", "Thies", "Diourbel", "Saint-Louis", "Kaolack", "Ziguinchor", "Louga", "Tambacounda"]
  },
  {
    name: "Serbia",
    code: "RS",
    dialCode: "+381",
    flag: "🇷🇸",
    states: ["Belgrade", "Vojvodina", "Sumadija and Western Serbia", "Southern and Eastern Serbia"]
  },
  {
    name: "Seychelles",
    code: "SC",
    dialCode: "+248",
    flag: "🇸🇨",
    states: ["Mahe", "Praslin", "La Digue"]
  },
  {
    name: "Sierra Leone",
    code: "SL",
    dialCode: "+232",
    flag: "🇸🇱",
    states: ["Western Area (Freetown)", "Eastern Province", "Northern Province", "North West Province", "Southern Province"]
  },
  {
    name: "Singapore",
    code: "SG",
    dialCode: "+65",
    flag: "🇸🇬",
    states: ["Central Region", "East Region", "North Region", "North-East Region", "West Region"]
  },
  {
    name: "Slovakia",
    code: "SK",
    dialCode: "+421",
    flag: "🇸🇰",
    states: ["Bratislava", "Kosice", "Presov", "Zilina", "Banska Bystrica", "Nitra", "Trnava", "Trencin"]
  },
  {
    name: "Slovenia",
    code: "SI",
    dialCode: "+386",
    flag: "🇸🇮",
    states: ["Central Slovenia (Ljubljana)", "Drava (Maribor)", "Coastal-Karst", "Upper Carniola", "Savinja"]
  },
  {
    name: "Solomon Islands",
    code: "SB",
    dialCode: "+677",
    flag: "🇸🇧",
    states: ["Honiara", "Guadalcanal", "Malaita", "Western", "Isabel", "Makira-Ulawa"]
  },
  {
    name: "Somalia",
    code: "SO",
    dialCode: "+252",
    flag: "🇸🇴",
    states: ["Banaadir (Mogadishu)", "Puntland", "Somaliland", "Jubaland", "South West", "Galmudug", "Hirshabelle"]
  },
  {
    name: "South Africa",
    code: "ZA",
    dialCode: "+27",
    flag: "🇿🇦",
    states: [
      "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State",
      "Limpopo", "Mpumalanga", "North West", "Northern Cape"
    ]
  },
  {
    name: "South Korea",
    code: "KR",
    dialCode: "+82",
    flag: "🇰🇷",
    states: ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Gyeonggi", "Gangwon", "Jeju"]
  },
  {
    name: "South Sudan",
    code: "SS",
    dialCode: "+211",
    flag: "🇸🇸",
    states: ["Central Equatoria (Juba)", "Eastern Equatoria", "Western Equatoria", "Jonglei", "Upper Nile", "Unity", "Lakes", "Warrap"]
  },
  {
    name: "Spain",
    code: "ES",
    dialCode: "+34",
    flag: "🇪🇸",
    states: [
      "Madrid", "Catalonia", "Andalusia", "Valencian Community", "Galicia", "Basque Country",
      "Castile and Leon", "Canary Islands", "Balearic Islands", "Murcia", "Aragon", "Asturias"
    ]
  },
  {
    name: "Sri Lanka",
    code: "LK",
    dialCode: "+94",
    flag: "🇱🇰",
    states: ["Western (Colombo)", "Central (Kandy)", "Southern (Galle)", "North Western", "Sabaragamuwa", "Northern", "Eastern", "Uva", "North Central"]
  },
  {
    name: "Sudan",
    code: "SD",
    dialCode: "+249",
    flag: "🇸🇩",
    states: ["Khartoum", "Gezira", "Red Sea", "Kassala", "River Nile", "North Darfur", "South Darfur", "White Nile"]
  },
  {
    name: "Suriname",
    code: "SR",
    dialCode: "+597",
    flag: "🇸🇷",
    states: ["Paramaribo", "Wanica", "Nickerie", "Commewijne", "Saramacca", "Marowijne"]
  },
  {
    name: "Sweden",
    code: "SE",
    dialCode: "+46",
    flag: "🇸🇪",
    states: ["Stockholm", "Vastra Gotaland", "Skane", "Uppsala", "Ostergotland", "Jonkoping", "Halland", "Orebro"]
  },
  {
    name: "Switzerland",
    code: "CH",
    dialCode: "+41",
    flag: "🇨🇭",
    states: ["Zurich", "Geneva", "Vaud", "Bern", "Basel-Stadt", "Aargau", "Ticino", "Lucerne", "St. Gallen", "Valais", "Zug"]
  },
  {
    name: "Syria",
    code: "SY",
    dialCode: "+963",
    flag: "🇸🇾",
    states: ["Damascus", "Aleppo", "Homs", "Latakia", "Hama", "Tartus", "Rif Dimashq"]
  },
  {
    name: "Taiwan",
    code: "TW",
    dialCode: "+886",
    flag: "🇹🇼",
    states: ["Taipei", "New Taipei", "Taichung", "Kaohsiung", "Taoyuan", "Tainan", "Hsinchu"]
  },
  {
    name: "Tajikistan",
    code: "TJ",
    dialCode: "+992",
    flag: "🇹🇯",
    states: ["Dushanbe", "Sughd", "Khatlon", "Gorno-Badakhshan", "Districts of Republican Subordination"]
  },
  {
    name: "Tanzania",
    code: "TZ",
    dialCode: "+255",
    flag: "🇹🇿",
    states: ["Dar es Salaam", "Arusha", "Mwanza", "Dodoma", "Kilimanjaro", "Mbeya", "Morogoro", "Tanga", "Zanzibar"]
  },
  {
    name: "Thailand",
    code: "TH",
    dialCode: "+66",
    flag: "🇹🇭",
    states: ["Bangkok", "Chiang Mai", "Phuket", "Chonburi (Pattaya)", "Nonthaburi", "Samut Prakan", "Nakhon Ratchasima", "Khon Kaen", "Surat Thani"]
  },
  {
    name: "Timor-Leste",
    code: "TL",
    dialCode: "+670",
    flag: "🇹🇱",
    states: ["Dili", "Baucau", "Ermera", "Bobonaro", "Liquica", "Manufahi"]
  },
  {
    name: "Togo",
    code: "TG",
    dialCode: "+228",
    flag: "🇹🇬",
    states: ["Maritime (Lome)", "Plateaux", "Centrale", "Kara", "Savanes"]
  },
  {
    name: "Tonga",
    code: "TO",
    dialCode: "+676",
    flag: "🇹🇴",
    states: ["Tongatapu", "Vava'u", "Ha'apai", "'Eua", "Ongo Niua"]
  },
  {
    name: "Trinidad and Tobago",
    code: "TT",
    dialCode: "+1-868",
    flag: "🇹🇹",
    states: ["Port of Spain", "San Fernando", "Chaguanas", "Arima", "San Juan-Laventille", "Tunapuna-Piarco", "Tobago"]
  },
  {
    name: "Tunisia",
    code: "TN",
    dialCode: "+216",
    flag: "🇹🇳",
    states: ["Tunis", "Ariana", "Ben Arous", "Sfax", "Sousse", "Nabeul", "Bizerte", "Monastir"]
  },
  {
    name: "Turkey",
    code: "TR",
    dialCode: "+90",
    flag: "🇹🇷",
    states: ["Istanbul", "Ankara", "Izmir", "Antalya", "Bursa", "Adana", "Gaziantep", "Konya", "Mersin", "Mugla"]
  },
  {
    name: "Turkmenistan",
    code: "TM",
    dialCode: "+993",
    flag: "🇹🇲",
    states: ["Ashgabat", "Ahal", "Balkan", "Dashoguz", "Lebap", "Mary"]
  },
  {
    name: "Tuvalu",
    code: "TV",
    dialCode: "+688",
    flag: "🇹🇻",
    states: ["Funafuti", "Nanumea", "Nukufetau", "Vaitupu"]
  },
  {
    name: "Uganda",
    code: "UG",
    dialCode: "+256",
    flag: "🇺🇬",
    states: ["Central Region (Kampala)", "Eastern Region", "Northern Region", "Western Region"]
  },
  {
    name: "Ukraine",
    code: "UA",
    dialCode: "+380",
    flag: "🇺🇦",
    states: ["Kyiv", "Lviv", "Odesa", "Kharkiv", "Dnipropetrovsk", "Zaporizhzhia", "Vinnytsia", "Poltava"]
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    dialCode: "+971",
    flag: "🇦🇪",
    states: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"]
  },
  {
    name: "United Kingdom",
    code: "GB",
    dialCode: "+44",
    flag: "🇬🇧",
    states: [
      "Greater London", "Manchester", "Birmingham", "West Midlands", "West Yorkshire",
      "Merseyside", "Kent", "Surrey", "Essex", "Hampshire", "Scotland (Edinburgh)",
      "Scotland (Glasgow)", "Wales (Cardiff)", "Northern Ireland (Belfast)"
    ]
  },
  {
    name: "United States",
    code: "US",
    dialCode: "+1",
    flag: "🇺🇸",
    states: [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
      "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois",
      "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
      "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
      "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
      "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
      "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
      "West Virginia", "Wisconsin", "Wyoming"
    ]
  },
  {
    name: "Uruguay",
    code: "UY",
    dialCode: "+598",
    flag: "🇺🇾",
    states: ["Montevideo", "Canelones", "Maldonado", "Salto", "Colonia", "Paysandu", "Rocha"]
  },
  {
    name: "Uzbekistan",
    code: "UZ",
    dialCode: "+998",
    flag: "🇺🇿",
    states: ["Tashkent", "Samarkand", "Bukhara", "Fergana", "Andijan", "Namangan", "Kashkadarya"]
  },
  {
    name: "Vanuatu",
    code: "VU",
    dialCode: "+678",
    flag: "🇻🇺",
    states: ["Shefa (Port Vila)", "Sanma", "Tafea", "Malampa", "Penama", "Torba"]
  },
  {
    name: "Vatican City",
    code: "VA",
    dialCode: "+379",
    flag: "🇻🇦",
    states: ["Vatican City"]
  },
  {
    name: "Venezuela",
    code: "VE",
    dialCode: "+58",
    flag: "🇻🇪",
    states: ["Capital District (Caracas)", "Miranda", "Zulia", "Carabobo", "Aragua", "Lara", "Anzoategui", "Bolivar", "Merida"]
  },
  {
    name: "Vietnam",
    code: "VN",
    dialCode: "+84",
    flag: "🇻🇳",
    states: ["Ho Chi Minh City", "Hanoi", "Da Nang", "Hai Phong", "Can Tho", "Binh Duong", "Dong Nai", "Khanh Hoa", "Quang Ninh"]
  },
  {
    name: "Yemen",
    code: "YE",
    dialCode: "+967",
    flag: "🇾🇪",
    states: ["Sana'a", "Aden", "Taiz", "Hodeidah", "Ibb", "Hadramaut", "Dhamar"]
  },
  {
    name: "Zambia",
    code: "ZM",
    dialCode: "+260",
    flag: "🇿🇲",
    states: ["Lusaka", "Copperbelt", "Southern", "Central", "Eastern", "Northern", "North-Western", "Luapula", "Muchinga", "Western"]
  },
  {
    name: "Zimbabwe",
    code: "ZW",
    dialCode: "+263",
    flag: "🇿🇼",
    states: ["Harare", "Bulawayo", "Manicaland", "Mashonaland Central", "Mashonaland East", "Mashonaland West", "Masvingo", "Matabeleland North", "Matabeleland South", "Midlands"]
  }
];
