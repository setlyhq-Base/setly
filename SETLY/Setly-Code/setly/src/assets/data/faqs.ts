import { Faq } from '../../app/core/models/faq.model';

export const FAQS: Faq[] = [
  {
    id: "docs-ssn-001",
    category: "Documents",
    tags: ["ssn", "documents", "us"],
    question: "What documents do I need to apply for an SSN in the US?",
    answer: "Typically: (1) Passport, (2) I-94, (3) I-20 (for F-1) or DS-2019 (J-1), (4) proof of local address, (5) completed SS-5 form. Check your local SSA office for exact requirements."
  },
  {
    id: "bank-boa-002",
    category: "Banking",
    tags: ["bank", "checking", "newcomer"],
    question: "How do I open a bank account without US credit history?",
    answer: "Most banks allow a basic checking with passport + I-94 + local address. Consider newcomer-friendly banks and bring secondary ID if you have one."
  },
  {
    id: "sim-usa-003",
    category: "Mobile",
    tags: ["sim", "carrier", "phone"],
    question: "Best SIM options for a new arrival?",
    answer: "Popular choices: eSIM from major carriers or MVNOs. Pick based on coverage in your city and budget; many offer student deals."
  },
  {
    id: "housing-verify-004",
    category: "Housing",
    tags: ["housing", "safety", "scams"],
    question: "How do I avoid housing scams?",
    answer: "Use trusted listings, never wire money before viewing (virtual or in-person), verify landlord identity, and insist on a written lease."
  },
  {
    id: "airport-uber-005",
    category: "Transport",
    tags: ["uber", "airport", "pickup"],
    question: "Can Setly book my airport pickup?",
    answer: "Yes—use our in-app Uber deep link with your destination prefilled. You’ll confirm the ride in the Uber app."
  },
  {
    id: "housing-find-006",
    category: "Housing",
    tags: ["housing", "rent", "apartments"],
    question: "How do I find housing near my university?",
    answer: "Use Setly's housing search to filter by university proximity. Check listings on Facebook groups, Craigslist, or university housing offices. Always view in person."
  },
  {
    id: "docs-visa-007",
    category: "Documents",
    tags: ["visa", "immigration", "f1"],
    question: "What is the F-1 visa process?",
    answer: "Apply through SEVIS, pay fee, submit DS-160 form, attend visa interview. This is general info; consult an immigration advisor for personalized advice."
  },
  {
    id: "bank-atm-008",
    category: "Banking",
    tags: ["atm", "fees", "cash"],
    question: "How to avoid ATM fees?",
    answer: "Use your bank's ATMs or fee-free networks. Apps like Bank of America show fee-free locations. International fees apply otherwise."
  },
  {
    id: "sim-activation-009",
    category: "Mobile",
    tags: ["sim", "activation", "data"],
    question: "How to activate a new SIM card?",
    answer: "Insert SIM, follow carrier app instructions or call customer service. For eSIM, scan QR code in settings. Test by making a call."
  },
  {
    id: "housing-lease-010",
    category: "Housing",
    tags: ["lease", "rent", "contract"],
    question: "What to look for in a lease agreement?",
    answer: "Rent amount, duration, utilities included, pet policy, termination clauses. Read carefully and consider legal review if unsure."
  },
  {
    id: "airport-arrival-011",
    category: "Transport",
    tags: ["airport", "arrival", "customs"],
    question: "What happens at airport arrival?",
    answer: "Passport control, customs declaration, baggage claim. Have I-94 ready. If issues, ask for help at info desk."
  },
  {
    id: "docs-driver-012",
    category: "Documents",
    tags: ["driver", "license", "id"],
    question: "How to get a US driver's license?",
    answer: "Pass written test, vision screening, road test. Bring passport, I-94, proof of address. International licenses may be valid temporarily."
  },
  {
    id: "bank-transfer-013",
    category: "Banking",
    tags: ["transfer", "money", "international"],
    question: "How to transfer money from abroad?",
    answer: "Use wire transfer, Western Union, or apps like Wise/Remitly. Compare fees and exchange rates. Bank accounts may take time to open."
  },
  {
    id: "sim-plans-014",
    category: "Mobile",
    tags: ["sim", "plans", "unlimited"],
    question: "Unlimited data plans available?",
    answer: "Yes, from carriers like Verizon, AT&T. Check for student discounts. MVNOs like Visible offer cheap unlimited options."
  },
  {
    id: "housing-utilities-015",
    category: "Housing",
    tags: ["utilities", "bills", "setup"],
    question: "How to set up utilities?",
    answer: "Contact local providers for electricity, gas, internet. May need deposit and proof of address. Setly can help with checklists."
  },
  {
    id: "airport-luggage-016",
    category: "Transport",
    tags: ["luggage", "lost", "baggage"],
    question: "What if my luggage is lost?",
    answer: "Report at baggage services desk immediately. Airlines provide essentials kit. File claim online within days."
  },
  {
    id: "docs-insurance-017",
    category: "Documents",
    tags: ["insurance", "health", "coverage"],
    question: "Do I need health insurance?",
    answer: "Yes, for F-1 students. University health plans or private options. Emergency care is available but expensive without coverage."
  },
  {
    id: "bank-cards-018",
    category: "Banking",
    tags: ["debit", "credit", "cards"],
    question: "Debit vs credit cards for newcomers?",
    answer: "Start with debit for spending within balance. Credit builds history but requires responsible use. Avoid high fees."
  },
  {
    id: "sim-roaming-019",
    category: "Mobile",
    tags: ["roaming", "travel", "data"],
    question: "What about roaming for travel?",
    answer: "Turn off data roaming to avoid charges. Use WiFi or buy local SIM. Apps like Google Fi offer global plans."
  },
  {
    id: "housing-roommates-020",
    category: "Housing",
    tags: ["roommates", "shared", "living"],
    question: "Tips for living with roommates?",
    answer: "Communicate expectations, set house rules, respect privacy. Use apps like Splitwise for bills. Address issues early."
  },
  {
    id: "airport-ground-021",
    category: "Transport",
    tags: ["ground", "transport", "shuttle"],
    question: "Ground transport from airport?",
    answer: "Uber/Lyft, shuttles, public transit. Setly's Uber deep link is convenient. Pre-book for peak times."
  },
  {
    id: "docs-sevis-022",
    category: "Documents",
    tags: ["sevis", "f1", "maintenance"],
    question: "How to maintain SEVIS status?",
    answer: "Full-time enrollment, timely fee payments, address updates. Report changes within 10 days. Not legal advice."
  },
  {
    id: "bank-safety-023",
    category: "Banking",
    tags: ["safety", "fraud", "security"],
    question: "Banking safety tips?",
    answer: "Use strong passwords, monitor statements, avoid public WiFi for transactions. Report suspicious activity immediately."
  },
  {
    id: "sim-coverage-024",
    category: "Mobile",
    tags: ["coverage", "signal", "areas"],
    question: "Check coverage in my area?",
    answer: "Use carrier coverage maps online. Test signal at potential housing. Consider boosters for rural areas."
  },
  {
    id: "housing-deposit-025",
    category: "Housing",
    tags: ["deposit", "security", "refund"],
    question: "Security deposit details?",
    answer: "Usually 1-2 months rent. Refundable if no damage. Get receipt and inspect property. Laws vary by state."
  },
  {
    id: "airport-visa-026",
    category: "Transport",
    tags: ["visa", "stamp", "entry"],
    question: "Visa stamp at airport?",
    answer: "Immigration officer stamps passport. Keep safe. For F-1, I-94 is electronic. Not legal advice."
  },
  {
    id: "docs-mail-027",
    category: "Documents",
    tags: ["mail", "address", "forwarding"],
    question: "How to handle mail and address?",
    answer: "Get local address for SSN/bank. Use USPS forwarding or virtual mailbox services. Update SEVIS with new address."
  },
  {
    id: "bank-budget-028",
    category: "Banking",
    tags: ["budget", "expenses", "saving"],
    question: "Budgeting for US living?",
    answer: "Track expenses with apps. Expect higher costs for housing/food. Save for emergencies. Setly has newcomer checklists."
  },
  {
    id: "sim-emergency-029",
    category: "Mobile",
    tags: ["emergency", "calls", "911"],
    question: "Emergency calls without SIM?",
    answer: "WiFi calling or borrow phone. 911 works on any network. Have ICE contacts saved."
  },
  {
    id: "housing-inspection-030",
    category: "Housing",
    tags: ["inspection", "move-in", "repairs"],
    question: "Move-in inspection?",
    answer: "Document condition with photos/videos. Note any issues. Helps with deposit disputes."
  }
];
