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
      "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
      "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Abuja FCT", "Gombe", 
      "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", 
      "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", 
      "Taraba", "Yobe", "Zamfara"
    ]
  },
  {
    name: "United States",
    code: "US",
    dialCode: "+1",
    flag: "🇺🇸",
    states: [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
      "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
      "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
      "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
      "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
      "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
      "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", 
      "Wisconsin", "Wyoming"
    ]
  },
  {
    name: "United Kingdom",
    code: "GB",
    dialCode: "+44",
    flag: "🇬🇧",
    states: [
      "Greater London", "Greater Manchester", "West Midlands", "West Yorkshire", 
      "Merseyside", "South Yorkshire", "Tyne and Wear", "Scotland", "Wales", "Northern Ireland",
      "Berkshire", "Cambridgeshire", "Cheshire", "Essex", "Hampshire", "Kent", "Surrey"
    ]
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    dialCode: "+971",
    flag: "🇦🇪",
    states: [
      "Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"
    ]
  },
  {
    name: "Canada",
    code: "CA",
    dialCode: "+1",
    flag: "🇨🇦",
    states: [
      "Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Saskatchewan", 
      "Nova Scotia", "New Brunswick", "Newfoundland and Labrador", "Prince Edward Island"
    ]
  },
  {
    name: "Ghana",
    code: "GH",
    dialCode: "+233",
    flag: "🇬🇭",
    states: [
      "Greater Accra", "Ashanti", "Western", "Central", "Eastern", "Northern", 
      "Volta", "Upper East", "Upper West", "Bono", "Ahafo"
    ]
  },
  {
    name: "Kenya",
    code: "KE",
    dialCode: "+254",
    flag: "🇰🇪",
    states: [
      "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Machakos", "Uasin Gishu", "Kilifi"
    ]
  },
  {
    name: "South Africa",
    code: "ZA",
    dialCode: "+27",
    flag: "🇿🇦",
    states: [
      "Gauteng (Johannesburg/Pretoria)", "Western Cape (Cape Town)", "KwaZulu-Natal (Durban)", 
      "Eastern Cape", "Free State", "Limpopo", "Mpumalanga", "North West", "Northern Cape"
    ]
  },
  {
    name: "Germany",
    code: "DE",
    dialCode: "+49",
    flag: "🇩🇪",
    states: [
      "Bavaria", "Berlin", "Baden-Württemberg", "North Rhine-Westphalia", "Hesse", "Hamburg", "Saxony"
    ]
  },
  {
    name: "France",
    code: "FR",
    dialCode: "+33",
    flag: "🇫🇷",
    states: [
      "Île-de-France (Paris)", "Auvergne-Rhône-Alpes (Lyon)", "Provence-Alpes-Côte d'Azur (Marseille/Nice)", 
      "Nouvelle-Aquitaine (Bordeaux)", "Occitanie (Toulouse)"
    ]
  }
];
