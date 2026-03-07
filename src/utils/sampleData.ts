import type { User } from "@/types/users"
import type { InventoryItem } from "@/types/inventory"
import type { MenuItem, Order } from "@/types/orders"

export const SEED_INVENTORY: InventoryItem[] = [
  { id: "1", ingredient: "Beef Ribeye",       unit: "kg",    current_stock: 18,   threshold: 10,  weekly_usage: 35,  status: "ok",       last_updated: "2026-03-07" },
  { id: "2", ingredient: "Chicken Thighs",    unit: "kg",    current_stock: 6,    threshold: 8,   weekly_usage: 22,  status: "low",      last_updated: "2026-03-07" },
  { id: "3", ingredient: "Suya Spice Blend",  unit: "bags",  current_stock: 3,    threshold: 5,   weekly_usage: 8,   status: "critical", last_updated: "2026-03-06" },
  { id: "4", ingredient: "Charcoal",          unit: "bags",  current_stock: 40,   threshold: 15,  weekly_usage: 20,  status: "ok",       last_updated: "2026-03-05" },
  { id: "5", ingredient: "Vegetable Oil",     unit: "L",     current_stock: 12,   threshold: 10,  weekly_usage: 15,  status: "ok",       last_updated: "2026-03-07" },
  { id: "6", ingredient: "Plantains",         unit: "crates",current_stock: 2,    threshold: 3,   weekly_usage: 6,   status: "critical", last_updated: "2026-03-07" },
  { id: "7", ingredient: "Tilapia (whole)",   unit: "kg",    current_stock: 9,    threshold: 8,   weekly_usage: 18,  status: "ok",       last_updated: "2026-03-06" },
  { id: "8", ingredient: "Jollof Rice",       unit: "kg",    current_stock: 7,    threshold: 10,  weekly_usage: 25,  status: "low",      last_updated: "2026-03-07" },
  { id: "9", ingredient: "Hibiscus Flowers",  unit: "kg",    current_stock: 1.5,  threshold: 2,   weekly_usage: 3,   status: "critical", last_updated: "2026-03-05" },
  { id:"10", ingredient: "Onions",            unit: "kg",    current_stock: 22,   threshold: 10,  weekly_usage: 14,  status: "ok",       last_updated: "2026-03-07" },
  { id:"11", ingredient: "Tomato Paste",      unit: "kg",    current_stock: 5,    threshold: 6,   weekly_usage: 9,   status: "low",      last_updated: "2026-03-06" },
  { id:"12", ingredient: "Salt",              unit: "kg",    current_stock: 8,    threshold: 3,   weekly_usage: 2,   status: "ok",       last_updated: "2026-03-04" },
]

export const SEED_MENU: MenuItem[] = [
  // Grills
  { id: "m1",  name: "Beef Suya",         category: "Grills",      price: 12.00, description: "Spiced skewered beef, grilled over charcoal" },
  { id: "m2",  name: "Chicken Suya",      category: "Grills",      price: 10.00, description: "Tender chicken skewers with suya spice blend" },
  { id: "m3",  name: "Grilled Tilapia",   category: "Grills",      price: 14.00, description: "Whole tilapia marinated and grilled to perfection" },
  { id: "m4",  name: "Pork Ribs",         category: "Grills",      price: 16.00, description: "Slow-grilled pork ribs with smoky glaze" },
  { id: "m5",  name: "Mixed Grill Plate", category: "Grills",      price: 20.00, description: "Beef, chicken & fish with sides" },
  // Rice & Sides
  { id: "m6",  name: "Jollof Rice",       category: "Rice & Sides", price: 8.00, description: "Party-style smoky tomato jollof rice" },
  { id: "m7",  name: "Fried Plantains",   category: "Rice & Sides", price: 5.00, description: "Sweet ripe plantains, golden fried" },
  { id: "m8",  name: "Coleslaw",          category: "Rice & Sides", price: 4.00, description: "Creamy house-made coleslaw" },
  { id: "m9",  name: "Fried Yam",         category: "Rice & Sides", price: 5.50, description: "Crispy yam wedges, lightly seasoned" },
  { id: "m10", name: "Ofada Rice",        category: "Rice & Sides", price: 9.00, description: "Local ofada rice with ayamase sauce" },
  // Snacks
  { id: "m11", name: "Puff Puff",         category: "Snacks",      price: 4.00, description: "Deep-fried dough balls, lightly sweetened" },
  { id: "m12", name: "Chin Chin",         category: "Snacks",      price: 3.00, description: "Crunchy fried snack, signature blend" },
  { id: "m13", name: "Suya Wrap",         category: "Snacks",      price: 7.00, description: "Suya strips in a soft flatbread wrap" },
  // Drinks
  { id: "m14", name: "Zobo (Hibiscus)",   category: "Drinks",      price: 3.00, description: "Chilled hibiscus flower drink" },
  { id: "m15", name: "Malt Drink",        category: "Drinks",      price: 2.50, description: "Cold non-alcoholic malt" },
  { id: "m16", name: "Bottled Water",     category: "Drinks",      price: 1.50, description: "Still or sparkling" },
  { id: "m17", name: "Fresh Juice",       category: "Drinks",      price: 4.00, description: "Watermelon or pineapple, freshly blended" },
]

export const SEED_RECENT_ORDERS: Order[] = [
  { id: "o1", orderNumber: "#034", type: "Dine In",  status: "ready",     total: 46.00, createdAt: "08:12 AM", items: [{ menuItem: { id:"m1", name:"Beef Suya",       category:"Grills",       price:12, description:"" }, qty:2 }, { menuItem:{ id:"m6", name:"Jollof Rice",    category:"Rice & Sides", price:8,  description:"" }, qty:1 }, { menuItem:{ id:"m14", name:"Zobo (Hibiscus)", category:"Drinks", price:3, description:""}, qty:2 }] },
  { id: "o2", orderNumber: "#033", type: "Takeaway", status: "ready",     total: 29.50, createdAt: "07:58 AM", items: [{ menuItem: { id:"m3", name:"Grilled Tilapia", category:"Grills",       price:14, description:"" }, qty:1 }, { menuItem:{ id:"m7", name:"Fried Plantains", category:"Rice & Sides", price:5,  description:"" }, qty:1 }, { menuItem:{ id:"m15", name:"Malt Drink",      category:"Drinks", price:2.5,description:""}, qty:2 }] },
  { id: "o3", orderNumber: "#032", type: "Dine In",  status: "preparing", total: 63.00, createdAt: "07:45 AM", items: [{ menuItem: { id:"m5", name:"Mixed Grill Plate",category:"Grills",       price:20, description:"" }, qty:2 }, { menuItem:{ id:"m10", name:"Ofada Rice",    category:"Rice & Sides", price:9,  description:"" }, qty:1 }, { menuItem:{ id:"m17", name:"Fresh Juice",    category:"Drinks", price:4, description:""}, qty:1 }] },
  { id: "o4", orderNumber: "#031", type: "Takeaway", status: "ready",     total: 21.00, createdAt: "07:30 AM", items: [{ menuItem: { id:"m2", name:"Chicken Suya",    category:"Grills",       price:10, description:"" }, qty:1 }, { menuItem:{ id:"m13", name:"Suya Wrap",     category:"Snacks",       price:7,  description:"" }, qty:1 }, { menuItem:{ id:"m16", name:"Bottled Water",  category:"Drinks", price:1.5,description:""}, qty:2 }] },
  { id: "o5", orderNumber: "#030", type: "Dine In",  status: "pending",   total: 38.00, createdAt: "07:15 AM", items: [{ menuItem: { id:"m4", name:"Pork Ribs",       category:"Grills",       price:16, description:"" }, qty:2 }, { menuItem:{ id:"m8", name:"Coleslaw",       category:"Rice & Sides", price:4,  description:"" }, qty:1 }, { menuItem:{ id:"m11", name:"Puff Puff",     category:"Snacks",     price:4, description:"" }, qty:1 }] },
]

export const SEED_USERS: User[] = [
  {
    id: "1",
    full_name: "Larry Noble",
    email: "larry@nakobigrill.com",
    role: "Admin",
    shift_type: "Day Shift",
    status: "active",
    created_at: "2025-01-10",
  },
  {
    id: "2",
    full_name: "Ama Asante",
    email: "ama@nakobigrill.com",
    role: "Order Taker",
    shift_type: "Day Shift",
    status: "active",
    created_at: "2025-02-14",
  },
  {
    id: "3",
    full_name: "Kwame Mensah",
    email: "kwame@nakobigrill.com",
    role: "Inventory Manager",
    shift_type: "Night Shift",
    status: "active",
    created_at: "2025-03-01",
  },
  {
    id: "4",
    full_name: "Efua Darko",
    email: "efua@nakobigrill.com",
    role: "Order Taker",
    shift_type: "Night Shift",
    status: "inactive",
    created_at: "2025-03-20",
  },
]
