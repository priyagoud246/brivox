require('dotenv').config();
const mongoose = require('mongoose');

const SMESchema = new mongoose.Schema({
  name: String, role: String, location: String, flag: String,
  sector: String, services: [String], affiliation: String,
  stage: String, profExp: Number, domainExp: Number,
  education: String, color: String,
  coordinates: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]  // [longitude, latitude]
  }
});
SMESchema.index({ coordinates: '2dsphere' });
const SME = mongoose.model('SME', SMESchema);

// City coordinates map [longitude, latitude]
const CITY_COORDS = {
  'Delhi':          [77.2090, 28.6139],
  'New Delhi':      [77.2090, 28.6139],
  'Delhi - NCR':    [77.2090, 28.6139],
  'NCR / DELHI':    [77.2090, 28.6139],
  'Mumbai':         [72.8777, 19.0760],
  'Bengaluru':      [77.5946, 12.9716],
  'Bangalore':      [77.5946, 12.9716],
  'Hyderabad':      [78.4867, 17.3850],
  'Gurgaon':        [77.0266, 28.4595],
  'Gurugram':       [77.0266, 28.4595],
  'Ahmedabad':      [72.5714, 23.0225],
  'ahmedabad':      [72.5714, 23.0225],
  'Pune':           [73.8567, 18.5204],
  'Kolkata':        [88.3639, 22.5726],
  'Jaipur':         [75.7873, 26.9124],
  'Surat':          [72.8311, 21.1702],
  'Chandigarh':     [76.7794, 30.7333],
  'CHANDIGARH':     [76.7794, 30.7333],
  'Mohali':         [76.7179, 30.7046],
  'Dehradun':       [78.0322, 30.3165],
  'Shimoga':        [75.5681, 13.9299],
  'Bhubaneswar':    [85.8245, 20.2961],
  'Jodhpur':        [73.0243, 26.2389],
  'Udaipur':        [73.6833, 24.5854],
  'Vadodara Gujarat': [73.1812, 22.3072],
  'UAE':            [55.2708, 25.2048],
  'Dubai':          [55.2708, 25.2048],
  'London':         [-0.1276, 51.5074],
  'Delhi, India':   [77.2090, 28.6139],
  'New Delhi and Gurgaon': [77.2090, 28.6139],
  'GURGAON':        [77.0266, 28.4595],
};

const SME_DATA = [
  {name:"Abhishek Bhatia",location:"Delhi",flag:"🇮🇳",role:"Management Consultant",profExp:19,domainExp:6,sector:"Consumer Tech",services:["Consumer Tech","Manufacturing"],affiliation:"Lets Venture",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#0891b2"},
  {name:"Harsh Shailesh Modi",location:"Mumbai",flag:"🇮🇳",role:"Venture Partner at Ah! ventures",profExp:13,domainExp:5,sector:"Fintech",services:["Consumer Tech","Fintech","Edtech","Banking"],affiliation:"Multiple Platforms",stage:"Seed",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Praamod Kumar",location:"Bengaluru",flag:"🇮🇳",role:"Finance Professional",profExp:19,domainExp:2,sector:"Fintech",services:["Consumer Tech","Fintech","SaaS"],affiliation:"IPV",stage:"Seed",education:"Chartered Accountant",color:"#1a56db"},
  {name:"Shashank Malani",location:"Hyderabad",flag:"🇮🇳",role:"Entrepreneur and managing family business",profExp:6,domainExp:5,sector:"Fintech",services:["Consumer Tech","Fintech","SaaS","B2B Commerce & Tech"],affiliation:"LetsVenture: UTD Venturex",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Himani Shah",location:"UAE",flag:"🇦🇪",role:"Executive Director-Global banking",profExp:25,domainExp:15,sector:"Fintech",services:["Consumer Tech","Fintech","B2B Commerce & Tech"],affiliation:"IPV/WFC/Faad/BeyondSeed",stage:"Seed, Early (Series A & B)",education:"Bachelors",color:"#1a56db"},
  {name:"Koduri Lakshmi Srikanth",location:"Hyderabad",flag:"🇮🇳",role:"Managing Partner",profExp:19,domainExp:3,sector:"SaaS",services:["Consumer Tech","SaaS","Retail","Real Estate"],affiliation:"Individual Capacity",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#7c3aed"},
  {name:"Jaideep Singh Chowdhary",location:"Ahmedabad",flag:"🇮🇳",role:"Director of marketing",profExp:20,domainExp:5,sector:"Edtech",services:["Consumer Tech","Edtech"],affiliation:"—",stage:"Seed",education:"Masters/Post- Graduation",color:"#d97706"},
  {name:"Irfan Buddaseth",location:"New Delhi",flag:"🇮🇳",role:"Corporate Banker",profExp:15,domainExp:3,sector:"Fintech",services:["Fintech","SaaS","Banking","Financial Serv. & Insurance (BFSI)"],affiliation:"Inflection Point Ventures",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Kopparapu Chandra Mouli",location:"Hyderabad",flag:"🇮🇳",role:"VP Finance Technology and Probono Consultant",profExp:20,domainExp:2,sector:"Fintech",services:["Fintech","Banking","Financial Serv. & Insurance (BFSI)"],affiliation:"Mumbai Angels",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Siva Sankar Raju Gaduraju",location:"Bangalore",flag:"🇮🇳",role:"Project manager",profExp:10,domainExp:4,sector:"Fintech",services:["Fintech","SaaS","Healthcare","Banking"],affiliation:"Invest, we founder circle, IPV, Lead Angels",stage:"Seed, Early (Series A & B), Growth (Series C)",education:"Bachelors",color:"#0a7c5c"},
  {name:"Govardhan",location:"Hyderabad",flag:"🇮🇳",role:"Business Development",profExp:9,domainExp:2,sector:"Healthcare",services:["Consumer Tech","Healthcare"],affiliation:"Individual",stage:"Seed, Early (Series A & B), Growth (Series C), Late (Series D+)",education:"Masters/Post- Graduation",color:"#0a7c5c"},
  {name:"Ravishankar Anand",location:"Delhi",flag:"🇮🇳",role:"Mentor Investor",profExp:27,domainExp:7,sector:"SaaS",services:["SaaS","AgTech"],affiliation:"FaaD Network",stage:"Seed, Early (Series A & B)",education:"Doctorate",color:"#7c3aed"},
  {name:"Arth Chowdhary",location:"Surat",flag:"🇮🇳",role:"Ceo at insidefpv",profExp:5,domainExp:3,sector:"Consumer Tech",services:["Consumer Tech","B2B Commerce & Tech"],affiliation:"Ipv, soonicorn, best vantage, we founder circle",stage:"Seed",education:"Bachelors",color:"#0891b2"},
  {name:"Mahendra Thummar",location:"Ahmedabad",flag:"🇮🇳",role:"Spices Business",profExp:10,domainExp:4,sector:"Multi-sector",services:["Banking","Financial Serv. & Insurance (BFSI)"],affiliation:"—",stage:"Early (Series A & B)",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Abhijit Onkar",location:"Gurgaon",flag:"🇮🇳",role:"Founder CEO and Investor",profExp:18,domainExp:2,sector:"Fintech",services:["Consumer Tech","Fintech","SaaS"],affiliation:"Angelist",stage:"Seed",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Utpal Doshi",location:"Mumbai",flag:"🇮🇳",role:"Partner - Corporate Venture Capital 100X.VC",profExp:25,domainExp:7,sector:"Fintech",services:["Consumer Tech","Fintech","Edtech","Healthcare"],affiliation:"AngelList, IPV, Vcats, Waveform, LetsVenture",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#0a7c5c"},
  {name:"Pranav Obhrai",location:"New Delhi",flag:"🇮🇳",role:"Early stage Investor",profExp:8,domainExp:3,sector:"Edtech",services:["Consumer Tech","Edtech","Banking","Financial Serv. & Insurance (BFSI)"],affiliation:"Atrium Angels",stage:"Seed",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Saurabh Srivastava",location:"Gurgaon",flag:"🇮🇳",role:"CMO",profExp:22,domainExp:7,sector:"SaaS",services:["Consumer Tech","SaaS"],affiliation:"IPV",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#7c3aed"},
  {name:"Aditya Shah",location:"Bangalore",flag:"🇮🇳",role:"Global Director - Strategic Partnerships",profExp:12,domainExp:3,sector:"Fintech",services:["Consumer Tech","Fintech","SaaS","B2B Commerce & Tech"],affiliation:"letsventure",stage:"Seed",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Rishi Garg",location:"Delhi - NCR",flag:"🇮🇳",role:"Product Management",profExp:11,domainExp:0,sector:"Multi-sector",services:[],affiliation:"IPV",stage:"Seed",education:"Masters/Post- Graduation",color:"#64748b"},
  {name:"Vikram Dudani",location:"Delhi",flag:"🇮🇳",role:"COO and Marketing head for an Automotive Startup",profExp:32,domainExp:3,sector:"SaaS",services:["Consumer Tech","SaaS","Edtech","Banking"],affiliation:"IPV (Inflection Point Ventures)",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Mohammad Ehteshamul Haque",location:"Delhi, India",flag:"🇮🇳",role:"Director Asia Pacific",profExp:25,domainExp:5,sector:"B2B Commerce",services:["B2B Commerce & Tech"],affiliation:"Personal Connections",stage:"Seed",education:"Masters/Post- Graduation",color:"#dc2626"},
  {name:"Riddhi Shah",location:"Hyderabad",flag:"🇮🇳",role:"Angel Investor - Mentor Freelancer",profExp:12,domainExp:4,sector:"Fintech",services:["Consumer Tech","Fintech","SaaS","Healthcare"],affiliation:"Inflection Point Ventures, Faad Capital, LetsVenture",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#0a7c5c"},
  {name:"Vineet Nair",location:"Mumbai",flag:"🇮🇳",role:"Chief Medical Officer Fitterfly",profExp:10,domainExp:3,sector:"Healthcare",services:["Consumer Tech","Healthcare"],affiliation:"IPV, Favcy",stage:"Seed",education:"Masters/Post- Graduation",color:"#0a7c5c"},
  {name:"Rohit Aggarwal",location:"Dubai",flag:"🇦🇪",role:"Head of Procurement Strategy Emirates Airways",profExp:23,domainExp:5,sector:"Fintech",services:["Fintech","SaaS","Edtech","B2B Commerce & Tech"],affiliation:"IPV",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Gaurav Kedia",location:"Bhubaneswar",flag:"🇮🇳",role:"Wealth Management",profExp:11,domainExp:5,sector:"Fintech",services:["Consumer Tech","Fintech","Edtech","Healthcare"],affiliation:"Multiple (IPV, LetsVenture, Angellist, Lead Angels, WFC)",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#0a7c5c"},
  {name:"Sunay Kumat",location:"Mumbai",flag:"🇮🇳",role:"Fintech Vice President JP Morgan Chase",profExp:12,domainExp:5,sector:"Fintech",services:["Consumer Tech","Fintech"],affiliation:"IPV",stage:"Seed, Early (Series A & B), Growth (Series C)",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Nitin Sharma",location:"Jaipur",flag:"🇮🇳",role:"Chartered Accountant",profExp:21,domainExp:5,sector:"Fintech",services:["Fintech","SaaS","Banking","Financial Serv. & Insurance (BFSI)"],affiliation:"GCPL",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Kris Radhakrishnan",location:"UAE",flag:"🇦🇪",role:"Investor",profExp:12,domainExp:5,sector:"Fintech",services:["Consumer Tech","Fintech","SaaS","Edtech"],affiliation:"AngelList, LetsVenture",stage:"Seed",education:"Masters/Post- Graduation",color:"#0a7c5c"},
  {name:"Nirmal Shah",location:"Bangalore",flag:"🇮🇳",role:"Founder and Venture Investor",profExp:25,domainExp:3,sector:"Fintech",services:["Consumer Tech","Fintech","SaaS","Edtech"],affiliation:"GSF Venture Capital",stage:"Seed, Early (Series A & B)",education:"Bachelors",color:"#0a7c5c"},
  {name:"Arpit Surana",location:"Bangalore",flag:"🇮🇳",role:"Investment Banker",profExp:5,domainExp:4,sector:"Fintech",services:["Consumer Tech","Fintech","SaaS","Edtech"],affiliation:"IPV & IAN",stage:"Seed, Early (Series A & B), Growth (Series C), Late (Series D+)",education:"Masters/Post- Graduation",color:"#0a7c5c"},
  {name:"Umesh Musahib",location:"Hyderabad",flag:"🇮🇳",role:"COO/CFO for a Business Unit in Cognizant",profExp:22,domainExp:5,sector:"Healthcare",services:["Healthcare"],affiliation:"—",stage:"Seed",education:"Masters/Post- Graduation",color:"#0a7c5c"},
  {name:"Viswanath Rao",location:"Bangalore",flag:"🇮🇳",role:"CFO",profExp:24,domainExp:10,sector:"Fintech",services:["Consumer Tech","Fintech","SaaS","B2B Commerce & Tech"],affiliation:"IPV, INVST",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Shyam Kerkar",location:"Pune",flag:"🇮🇳",role:"General Management",profExp:26,domainExp:4,sector:"Edtech",services:["Consumer Tech","Edtech","Banking","Financial Serv. & Insurance (BFSI)"],affiliation:"Pitchright, Angellist, Invstt",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Sony Jamalpur",location:"Hyderabad",flag:"🇮🇳",role:"Data owner",profExp:10,domainExp:1,sector:"Fintech",services:["Fintech","Healthcare","Banking","Financial Serv. & Insurance (BFSI)"],affiliation:"Mrkinteriorsandfurnitures",stage:"Seed",education:"Masters/Post- Graduation",color:"#0a7c5c"},
  {name:"Satwinder",location:"Dehradun",flag:"🇮🇳",role:"Ceo and founder EssJay Financials",profExp:25,domainExp:2,sector:"Fintech",services:["Fintech","SaaS"],affiliation:"Ipv",stage:"Seed, Early (Series A & B), Growth (Series C)",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Rudreshkalyani",location:"Shimoga",flag:"🇮🇳",role:"Equity n Angel investor",profExp:18,domainExp:15,sector:"Fintech",services:["Consumer Tech","Fintech","SaaS","Edtech"],affiliation:"Inflection point ventures",stage:"Seed, Early (Series A & B)",education:"Bachelors",color:"#1a56db"},
  {name:"Dilleep Chandran",location:"GURGAON",flag:"🇮🇳",role:"Director Commercial Operations",profExp:28,domainExp:5,sector:"Healthcare",services:["Consumer Tech","SaaS","Edtech","Healthcare"],affiliation:"Direct and Inflection Point Ventures",stage:"Seed, Early (Series A & B)",education:"Bachelors",color:"#0a7c5c"},
  {name:"Vinayak Kathare",location:"Hyderabad",flag:"🇮🇳",role:"Vice President Stationary Energy storage",profExp:19,domainExp:3,sector:"Consumer Tech",services:["Electric vehicles","sustainability","Consumer Tech"],affiliation:"LetsVenture",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#0891b2"},
  {name:"Gaurav Vasishta",location:"Mohali",flag:"🇮🇳",role:"CEO at Digisson Group",profExp:25,domainExp:5,sector:"SaaS",services:["SaaS","Edtech","B2B Commerce & Tech"],affiliation:"Punjab Angels Network",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#7c3aed"},
  {name:"Ramana Reddy Maddirala",location:"Hyderabad",flag:"🇮🇳",role:"Real Estate",profExp:14,domainExp:3,sector:"Fintech",services:["Consumer Tech","Fintech","Edtech","Banking"],affiliation:"Itribe, Kaala Labs",stage:"Seed",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Ar Singhal",location:"Jodhpur",flag:"🇮🇳",role:"Formerly Regional director South East Asia",profExp:50,domainExp:40,sector:"Fintech",services:["Fintech","Banking","Financial Serv. & Insurance (BFSI)"],affiliation:"Confidential",stage:"Seed, Early (Series A & B), Growth (Series C), Late (Series D+)",education:"BE MBA IIM Calcutta LLB",color:"#1a56db"},
  {name:"Shreyas Katta",location:"Bengaluru",flag:"🇮🇳",role:"Strategy professional",profExp:8,domainExp:1,sector:"Consumer Tech",services:["Consumer Tech"],affiliation:"Misfits",stage:"Seed",education:"Masters/Post- Graduation",color:"#0891b2"},
  {name:"Deepak Kumar",location:"Chandigarh",flag:"🇮🇳",role:"DNA Expert Services",profExp:32,domainExp:5,sector:"Healthcare",services:["Consumer Tech","SaaS","Healthcare","B2B Commerce & Tech"],affiliation:"IPV",stage:"Seed, Early (Series A & B), Growth (Series C)",education:"Bachelors",color:"#0a7c5c"},
  {name:"Raghavendra Chitta",location:"Bangalore",flag:"🇮🇳",role:"Advisory",profExp:22,domainExp:5,sector:"Fintech",services:["Consumer Tech","Fintech","Edtech","B2B Commerce & Tech"],affiliation:"IPV",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Abhisek Bhagat",location:"Gurugram",flag:"🇮🇳",role:"Investment Analyst",profExp:2,domainExp:2,sector:"Fintech",services:["Consumer Tech","Fintech","SaaS","Healthcare"],affiliation:"Inflection Point Venture",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#0a7c5c"},
  {name:"Irfan Shaikh",location:"Hyderabad",flag:"🇮🇳",role:"Country head for a US based software product company",profExp:25,domainExp:5,sector:"SaaS",services:["SaaS","Edtech","B2B Commerce & Tech"],affiliation:"IPV",stage:"Seed",education:"Masters/Post- Graduation",color:"#7c3aed"},
  {name:"Gaurang Mehta",location:"Pune",flag:"🇮🇳",role:"IT industry cloud data center infrastructure",profExp:30,domainExp:2,sector:"SaaS",services:["SaaS"],affiliation:"Venture Catalysts, IPV, Direct",stage:"Seed, Early (Series A & B), Growth (Series C)",education:"Diploma in electrical engineering",color:"#7c3aed"},
  {name:"Venkata Suresh Babu Pasupuleti",location:"Hyderabad",flag:"🇮🇳",role:"Vice President ATAI",profExp:24,domainExp:8,sector:"Healthcare",services:["SaaS","Healthcare"],affiliation:"—",stage:"Seed",education:"Masters/Post- Graduation",color:"#0a7c5c"},
  {name:"Dr.Kasukurthi Praveen Kumar",location:"Bangalore",flag:"🇮🇳",role:"Doctor Medical and Healthcare",profExp:18,domainExp:7,sector:"Healthcare",services:["Healthcare","Service Industry"],affiliation:"—",stage:"Seed, Early (Series A & B), Growth (Series C)",education:"Masters/Post- Graduation",color:"#0a7c5c"},
  {name:"Sumanth Suri",location:"Bengaluru",flag:"🇮🇳",role:"Head of Product Strategy",profExp:18,domainExp:1,sector:"Fintech",services:["Fintech","SaaS","Banking","Financial Serv. & Insurance (BFSI)"],affiliation:"Angel list, Connexdoor",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Viswanath Rao CFO",location:"Bangalore",flag:"🇮🇳",role:"Chief Financial Officer",profExp:24,domainExp:8,sector:"Fintech",services:["Fintech","SaaS","Edtech","Healthcare"],affiliation:"IPV, Invstt",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#0a7c5c"},
  {name:"Snehith Galla",location:"Bengaluru",flag:"🇮🇳",role:"Head of New Initiatives at Turno",profExp:3,domainExp:2,sector:"Multi-sector",services:["FMCG","logistics and supply chain"],affiliation:"IPV",stage:"Seed, Early (Series A & B)",education:"Bachelors",color:"#64748b"},
  {name:"Avinash Peddi",location:"Hyderabad",flag:"🇮🇳",role:"Entrepreneur",profExp:22,domainExp:4,sector:"Fintech",services:["Consumer Tech","Fintech","SaaS","Healthcare"],affiliation:"LP with other platforms and direct captable",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#0a7c5c"},
  {name:"Srinivas Kothagundla",location:"Hyderabad",flag:"🇮🇳",role:"Angel Investor Virtual CFO",profExp:22,domainExp:5,sector:"Fintech",services:["Fintech","Healthcare","Banking","Financial Serv. & Insurance (BFSI)"],affiliation:"IPV, Soonicorn, Cogniphy, Ah Ventures and Favcy",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#0a7c5c"},
  {name:"Manav Mehta",location:"NCR / DELHI",flag:"🇮🇳",role:"Product Software Development",profExp:24,domainExp:5,sector:"Healthcare",services:["Consumer Tech","Edtech","Healthcare","B2B Commerce & Tech"],affiliation:"IPJ",stage:"Early (Series A & B), Growth (Series C)",education:"Masters/Post- Graduation",color:"#0a7c5c"},
  {name:"Yogita Malhotra",location:"New Delhi and Gurgaon",flag:"🇮🇳",role:"Product Manager",profExp:5,domainExp:1,sector:"Fintech",services:["Fintech","Edtech","Banking","Financial Serv. & Insurance (BFSI)"],affiliation:"Startup Angels Network",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Ashwin Reddy Channam",location:"Hyderabad",flag:"🇮🇳",role:"Software Engineering",profExp:17,domainExp:0,sector:"Fintech",services:["Consumer Tech","Fintech","Banking","Financial Serv. & Insurance (BFSI)"],affiliation:"—",stage:"Early (Series A & B), Growth (Series C), Late (Series D+)",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Anuurag Arora",location:"Delhi",flag:"🇮🇳",role:"Advisor to Executive Board of Directors",profExp:25,domainExp:15,sector:"Fintech",services:["Fintech","Healthcare","Banking","Financial Serv. & Insurance (BFSI)"],affiliation:"Family Office",stage:"Seed, Early (Series A & B), Growth (Series C)",education:"Masters/Post- Graduation",color:"#0a7c5c"},
  {name:"Moinuddin Salman",location:"Hyderabad",flag:"🇮🇳",role:"Sr. Pursuit Manager",profExp:22,domainExp:3,sector:"SaaS",services:["SaaS","B2B Commerce & Tech"],affiliation:"HDFC",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#7c3aed"},
  {name:"Sunil Kumat",location:"Udaipur",flag:"🇮🇳",role:"Angel Investor and Mentor",profExp:25,domainExp:7,sector:"Healthcare",services:["Consumer Tech","Healthcare","B2B Commerce & Tech","Hospitality"],affiliation:"IPV",stage:"Early (Series A & B)",education:"Bachelors",color:"#0a7c5c"},
  {name:"Dheeraj Dhawan",location:"London",flag:"🇬🇧",role:"Risk IT consulting",profExp:20,domainExp:11,sector:"Fintech",services:["Fintech","SaaS","Healthcare","Banking"],affiliation:"10+",stage:"Seed",education:"Bachelors",color:"#0a7c5c"},
  {name:"Prabhat Agarwal",location:"Gurgaon",flag:"🇮🇳",role:"CFO PristynCare Unicorn Startup",profExp:17,domainExp:3,sector:"Fintech",services:["Consumer Tech","Fintech","Edtech","Healthcare"],affiliation:"Direct investment into startups",stage:"Seed",education:"Masters/Post- Graduation",color:"#0a7c5c"},
  {name:"Siddhartha Saha",location:"Bengaluru",flag:"🇮🇳",role:"Deputy General Manager",profExp:12,domainExp:2,sector:"Healthcare",services:["SaaS","Healthcare","B2B Commerce & Tech"],affiliation:"Misfits",stage:"Seed",education:"Masters/Post- Graduation",color:"#0a7c5c"},
  {name:"Ravin Sanghavi",location:"Vadodara Gujarat",flag:"🇮🇳",role:"Angle investment startup mentoring",profExp:37,domainExp:9,sector:"Healthcare",services:["SaaS","Healthcare","B2B Commerce & Tech","Defensetech"],affiliation:"IPV,LV,VCATS,WFC",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#0a7c5c"},
  {name:"Aditya Penumatcha",location:"Hyderabad",flag:"🇮🇳",role:"Partner",profExp:20,domainExp:2,sector:"B2B Commerce",services:["B2B Commerce & Tech"],affiliation:"Venture Catalysts",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#dc2626"},
  {name:"Srinivasu Vatti",location:"Hyderabad",flag:"🇮🇳",role:"Chief Technology Officer",profExp:25,domainExp:4,sector:"Healthcare",services:["Consumer Tech","Healthcare","B2B Commerce & Tech","Product Innovations"],affiliation:"TIPS ENGINEERING PVT LTD",stage:"Seed, Growth (Series C)",education:"Masters/Post- Graduation",color:"#0a7c5c"},
  {name:"Vikas Jain",location:"Delhi",flag:"🇮🇳",role:"CFO",profExp:20,domainExp:10,sector:"Fintech",services:["Consumer Tech","Fintech","Edtech","Banking"],affiliation:"IPV",stage:"Seed",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Sudhir Goenka",location:"Gurgaon",flag:"🇮🇳",role:"Founder and Advisors",profExp:28,domainExp:5,sector:"SaaS",services:["Consumer Tech","SaaS","Banking","Financial Serv. & Insurance (BFSI)"],affiliation:"IPV",stage:"Seed, Early (Series A & B)",education:"Masters/Post- Graduation",color:"#1a56db"},
  {name:"Vivaswan Bhattacharya",location:"Kolkata",flag:"🇮🇳",role:"Consultant",profExp:27,domainExp:4,sector:"Fintech",services:["Fintech","Edtech","Banking","Financial Serv. & Insurance (BFSI)"],affiliation:"IPV",stage:"Seed, Early (Series A & B)",education:"Bachelors",color:"#1a56db"}
];

// Attach coordinates to each SME
const dataWithCoords = SME_DATA.map(sme => {
  const coords = CITY_COORDS[sme.location];
  return {
    ...sme,
    coordinates: coords
      ? { type: 'Point', coordinates: coords }
      : undefined   // skip geo index for unknown cities
  };
});

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');
    await SME.deleteMany({});
    console.log('✓ Cleared old data');
    await SME.insertMany(dataWithCoords);
    console.log(`✓ Seeded ${dataWithCoords.length} SMEs successfully`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();