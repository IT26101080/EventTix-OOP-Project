/*
 * EventTix – MOCK DATA (frontend demonstration only)
 * ---------------------------------------------------
 * Everything in this file is temporary sample data. Nothing here is saved.
 * When the Spring Boot backend is ready, replace these arrays with data
 * rendered by Thymeleaf (th:each) or fetched from controller endpoints,
 * e.g. GET /events, GET /customers, GET /bookings.
 */
window.EventTixMock = {
  currentUser: {
    name: "Madhawa",
    role: "User",
  },

  categories: ["Music", "Technology", "Sports", "Arts & Culture", "Business", "Education", "Food & Drink"],

  venues: [
    "Nelum Pokuna Theatre, Colombo",
    "BMICH, Colombo",
    "Sugathadasa Stadium, Colombo",
    "Lionel Wendt Theatre, Colombo",
    "Waters Edge, Battaramulla",
    "Kandy City Centre Hall, Kandy",
    "Galle Face Green, Colombo",
  ],

  events: [
    { id: 1, name: "Colombo Jazz Night", category: "Music", dateTime: "2026-10-25T19:00", venue: "Nelum Pokuna Theatre, Colombo", ticketPrice: 4500, capacity: 1200, status: "ONGOING", description: "An evening of local and international jazz artists." },
    { id: 2, name: "Tech Innovators Summit", category: "Technology", dateTime: "2026-10-25T09:00", venue: "BMICH, Colombo", ticketPrice: 7500, capacity: 800, status: "ONGOING", description: "Talks and workshops on AI, cloud and software engineering." },
    { id: 3, name: "Startup Pitch Day", category: "Business", dateTime: "2026-11-02T10:00", venue: "Waters Edge, Battaramulla", ticketPrice: 2000, capacity: 300, status: "UPCOMING", description: "Early-stage startups pitch to investors." },
    { id: 4, name: "Classical Piano Recital", category: "Arts & Culture", dateTime: "2026-10-12T18:30", venue: "Lionel Wendt Theatre, Colombo", ticketPrice: 3000, capacity: 400, status: "ENDED", description: "Solo piano works from Chopin and Debussy." },
    { id: 5, name: "City Marathon 2026", category: "Sports", dateTime: "2026-11-08T05:30", venue: "Galle Face Green, Colombo", ticketPrice: 1500, capacity: 5000, status: "UPCOMING", description: "Full, half and fun-run categories." },
    { id: 6, name: "Java & Spring Boot Workshop", category: "Education", dateTime: "2026-11-15T09:30", venue: "BMICH, Colombo", ticketPrice: 2500, capacity: 150, status: "UPCOMING", description: "Hands-on workshop for university students." },
    { id: 7, name: "Street Food Festival", category: "Food & Drink", dateTime: "2026-10-25T16:00", venue: "Galle Face Green, Colombo", ticketPrice: 500, capacity: 3000, status: "ONGOING", description: "Food stalls from across the island." },
    { id: 8, name: "Indie Rock Live", category: "Music", dateTime: "2026-10-05T20:00", venue: "Sugathadasa Stadium, Colombo", ticketPrice: 3500, capacity: 2500, status: "ENDED", description: "Local indie bands live on stage." },
    { id: 9, name: "Photography Expo", category: "Arts & Culture", dateTime: "2026-11-20T10:00", venue: "Kandy City Centre Hall, Kandy", ticketPrice: 1000, capacity: 600, status: "UPCOMING", description: "Exhibition of landscape and wildlife photography." },
    { id: 10, name: "Cricket Fan Meetup", category: "Sports", dateTime: "2026-10-25T14:00", venue: "Sugathadasa Stadium, Colombo", ticketPrice: 1200, capacity: 1000, status: "ONGOING", description: "Meet former national players." },
    { id: 11, name: "Digital Marketing Bootcamp", category: "Business", dateTime: "2026-09-28T09:00", venue: "Waters Edge, Battaramulla", ticketPrice: 5000, capacity: 200, status: "ENDED", description: "One-day intensive on SEO, ads and analytics." },
    { id: 12, name: "Kandy Cultural Night", category: "Arts & Culture", dateTime: "2026-11-28T18:00", venue: "Kandy City Centre Hall, Kandy", ticketPrice: 2200, capacity: 700, status: "UPCOMING", description: "Traditional dance and drumming performances." },
    { id: 13, name: "Cloud Computing Meetup", category: "Technology", dateTime: "2026-10-25T17:30", venue: "BMICH, Colombo", ticketPrice: 0, capacity: 250, status: "ONGOING", description: "Community meetup with lightning talks." },
    { id: 14, name: "Wine & Dine Evening", category: "Food & Drink", dateTime: "2026-12-04T19:30", venue: "Waters Edge, Battaramulla", ticketPrice: 9500, capacity: 180, status: "UPCOMING", description: "Five-course dinner with paired wines." },
    { id: 15, name: "Symphony Orchestra Gala", category: "Music", dateTime: "2026-12-12T19:00", venue: "Nelum Pokuna Theatre, Colombo", ticketPrice: 6000, capacity: 1200, status: "UPCOMING", description: "Year-end gala concert." },
    { id: 16, name: "Robotics Competition", category: "Education", dateTime: "2026-09-20T08:30", venue: "BMICH, Colombo", ticketPrice: 800, capacity: 900, status: "ENDED", description: "Inter-university robotics challenge." },
    { id: 17, name: "Comedy Night Live", category: "Arts & Culture", dateTime: "2026-10-25T20:30", venue: "Lionel Wendt Theatre, Colombo", ticketPrice: 2800, capacity: 400, status: "ONGOING", description: "Stand-up comedy with local comedians." },
    { id: 18, name: "Badminton Open", category: "Sports", dateTime: "2026-12-18T09:00", venue: "Sugathadasa Stadium, Colombo", ticketPrice: 700, capacity: 1500, status: "UPCOMING", description: "National open badminton tournament." },
    { id: 19, name: "Entrepreneurs Networking", category: "Business", dateTime: "2026-10-25T18:00", venue: "Waters Edge, Battaramulla", ticketPrice: 1500, capacity: 250, status: "ONGOING", description: "Networking evening for founders and investors." },
    { id: 20, name: "Cyber Security Conference", category: "Technology", dateTime: "2027-01-10T09:00", venue: "BMICH, Colombo", ticketPrice: 8000, capacity: 600, status: "UPCOMING", description: "Industry talks on security and privacy." },
    { id: 21, name: "Baila Beats Festival", category: "Music", dateTime: "2026-08-30T19:00", venue: "Galle Face Green, Colombo", ticketPrice: 2000, capacity: 4000, status: "ENDED", description: "Open-air music festival." },
    { id: 22, name: "Science Fair 2026", category: "Education", dateTime: "2026-10-25T10:00", venue: "Kandy City Centre Hall, Kandy", ticketPrice: 300, capacity: 1500, status: "ONGOING", description: "School and university science projects." },
    { id: 23, name: "Dessert Masterclass", category: "Food & Drink", dateTime: "2027-01-18T15:00", venue: "Waters Edge, Battaramulla", ticketPrice: 4200, capacity: 60, status: "UPCOMING", description: "Learn plated desserts from pastry chefs." },
    { id: 24, name: "Art Auction Night", category: "Arts & Culture", dateTime: "2026-09-12T19:00", venue: "Lionel Wendt Theatre, Colombo", ticketPrice: 5000, capacity: 200, status: "ENDED", description: "Charity auction of contemporary art." },
  ],

  customers: [
    { id: 1, firstName: "Nimal", lastName: "Perera", email: "nimal.perera@example.com", phone: "0771234567", city: "Colombo", joinedOn: "2026-03-14" },
    { id: 2, firstName: "Sachini", lastName: "Fernando", email: "sachini.f@example.com", phone: "0712345678", city: "Kandy", joinedOn: "2026-04-02" },
    { id: 3, firstName: "Kasun", lastName: "Jayasinghe", email: "kasun.j@example.com", phone: "0759876543", city: "Galle", joinedOn: "2026-04-21" },
    { id: 4, firstName: "Dilini", lastName: "Wickramasinghe", email: "dilini.w@example.com", phone: "0763456789", city: "Colombo", joinedOn: "2026-05-09" },
    { id: 5, firstName: "Tharindu", lastName: "Silva", email: "tharindu.silva@example.com", phone: "0786543210", city: "Negombo", joinedOn: "2026-05-30" },
    { id: 6, firstName: "Ishara", lastName: "Gunawardena", email: "ishara.g@example.com", phone: "0701122334", city: "Kurunegala", joinedOn: "2026-06-11" },
    { id: 7, firstName: "Ruwan", lastName: "Bandara", email: "ruwan.b@example.com", phone: "0772233445", city: "Kandy", joinedOn: "2026-07-03" },
    { id: 8, firstName: "Hashini", lastName: "Rathnayake", email: "hashini.r@example.com", phone: "0713344556", city: "Matara", joinedOn: "2026-07-19" },
    { id: 9, firstName: "Chamath", lastName: "Dissanayake", email: "chamath.d@example.com", phone: "0754455667", city: "Colombo", joinedOn: "2026-08-08" },
    { id: 10, firstName: "Nethmi", lastName: "Herath", email: "nethmi.h@example.com", phone: "0765566778", city: "Jaffna", joinedOn: "2026-08-27" },
    { id: 11, firstName: "Pasindu", lastName: "Karunaratne", email: "pasindu.k@example.com", phone: "0786677889", city: "Galle", joinedOn: "2026-09-15" },
    { id: 12, firstName: "Amaya", lastName: "Senanayake", email: "amaya.s@example.com", phone: "0707788990", city: "Colombo", joinedOn: "2026-10-01" },
  ],

  bookings: [
    { id: 1001, customerId: 1, eventId: 1, quantity: 2, bookedOn: "2026-10-18T10:24", status: "CONFIRMED" },
    { id: 1002, customerId: 2, eventId: 3, quantity: 1, bookedOn: "2026-10-19T14:02", status: "PENDING" },
    { id: 1003, customerId: 3, eventId: 5, quantity: 3, bookedOn: "2026-10-20T09:41", status: "CONFIRMED" },
    { id: 1004, customerId: 4, eventId: 2, quantity: 1, bookedOn: "2026-10-20T16:15", status: "CONFIRMED" },
    { id: 1005, customerId: 5, eventId: 8, quantity: 4, bookedOn: "2026-09-29T11:30", status: "CANCELLED" },
    { id: 1006, customerId: 6, eventId: 6, quantity: 1, bookedOn: "2026-10-21T08:55", status: "CONFIRMED" },
    { id: 1007, customerId: 7, eventId: 12, quantity: 2, bookedOn: "2026-10-22T19:12", status: "PENDING" },
    { id: 1008, customerId: 8, eventId: 15, quantity: 2, bookedOn: "2026-10-23T12:48", status: "CONFIRMED" },
    { id: 1009, customerId: 9, eventId: 7, quantity: 5, bookedOn: "2026-10-24T17:20", status: "CONFIRMED" },
    { id: 1010, customerId: 10, eventId: 9, quantity: 1, bookedOn: "2026-10-24T20:05", status: "PENDING" },
    { id: 1011, customerId: 11, eventId: 14, quantity: 2, bookedOn: "2026-10-25T07:45", status: "CONFIRMED" },
    { id: 1012, customerId: 12, eventId: 17, quantity: 3, bookedOn: "2026-10-25T08:30", status: "CONFIRMED" },
  ],
};
