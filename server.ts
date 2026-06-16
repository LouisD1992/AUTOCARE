import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), "fleet_data.json");

// Default initial data for Fleet Management
const DEFAULT_STORE = {
  vehicles: [
    {
      id: "V-001",
      name: "VinFast VF8 Plus",
      plateNumber: "30K-999.88",
      type: "Điện",
      odometer: 18450,
      averageConsumption: 18.5, // kWh/100km
      oilChangeInterval: 12000,
      lastMaintenanceOdo: 12000,
      insuranceExpiry: "2026-12-15",
      registrationExpiry: "2026-12-15",
      image: "https://images.unsplash.com/photo-1621993202323-f438eec934ff?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "V-002",
      name: "Toyota Camry 2.5Q",
      plateNumber: "29A-666.99",
      type: "Cao cấp",
      odometer: 48900,
      averageConsumption: 7.8, // L/100km
      oilChangeInterval: 5000,
      lastMaintenanceOdo: 45000,
      insuranceExpiry: "2026-08-20",
      registrationExpiry: "2026-08-20",
      image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "V-003",
      name: "Ford Ranger Wildtrak",
      plateNumber: "30F-123.45",
      type: "Bán tải",
      odometer: 72100,
      averageConsumption: 8.6, // L/100km
      oilChangeInterval: 8000,
      lastMaintenanceOdo: 64000,
      insuranceExpiry: "2026-04-10",
      registrationExpiry: "2026-10-18",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "V-004",
      name: "Hyundai Accent 1.4 AT",
      plateNumber: "30G-777.22",
      type: "Phổ thông",
      odometer: 24500,
      averageConsumption: 6.2, // L/100km
      oilChangeInterval: 5000,
      lastMaintenanceOdo: 20000,
      insuranceExpiry: "2026-11-30",
      registrationExpiry: "2027-05-12",
      image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600"
    }
  ],
  trips: [
    {
      id: "T-1001",
      vehicleId: "V-001",
      vehicleName: "VinFast VF8 Plus",
      vehiclePlate: "30K-999.88",
      driverName: "Dương Minh Hoàng",
      date: "2026-06-12",
      startingOdo: 18200,
      endingOdo: 18450,
      distance: 250,
      purpose: "Công tác",
      startingPoint: "Văn phòng Hà Nội",
      destination: "Chi nhánh Hải Phòng",
      tollFee: 190000,
      notes: "Chở đoàn kiểm định chất lượng dự án Hải Phòng. Sạc đầy pin tại trạm V-Green Hải Phòng.",
      createdAt: "2026-06-12T17:30:00Z"
    },
    {
      id: "T-1002",
      vehicleId: "V-002",
      vehicleName: "Toyota Camry 2.5Q",
      vehiclePlate: "29A-666.99",
      driverName: "Trần Văn Tuyền",
      date: "2026-06-14",
      startingOdo: 48780,
      endingOdo: 48900,
      distance: 120,
      purpose: "Đưa đón Sếp",
      startingPoint: "Sân bay Nội Bài",
      destination: "Khách sạn Metropole",
      tollFee: 70000,
      notes: "Đón Giám đốc tài chính từ TP.HCM ra làm việc tại HN.",
      createdAt: "2026-06-14T11:20:00Z"
    },
    {
      id: "T-1003",
      vehicleId: "V-003",
      vehicleName: "Ford Ranger Wildtrak",
      vehiclePlate: "30F-123.45",
      driverName: "Nguyễn Hồng Sơn",
      date: "2026-06-10",
      startingOdo: 71920,
      endingOdo: 72100,
      distance: 180,
      purpose: "Giao hàng",
      startingPoint: "Kho Tổng Thường Tín",
      destination: "Công trường Hòa Bình",
      tollFee: 110000,
      notes: "Vận chuyển vật dụng thiết bị bảo trợ lao động dự phòng lên công trường.",
      createdAt: "2026-06-10T16:45:00Z"
    }
  ],
  fuels: [
    {
      id: "F-2001",
      vehicleId: "V-002",
      vehicleName: "Toyota Camry 2.5Q",
      date: "2026-06-08",
      odometer: 48200,
      liters: 45,
      pricePerLiter: 22850,
      totalAmount: 1028250,
      gasStation: "Petrolimex Số 1 - Láng Hạ",
      isFullTank: true,
      createdAt: "2026-06-08T08:30:00Z"
    },
    {
      id: "F-2002",
      vehicleId: "V-003",
      vehicleName: "Ford Ranger Wildtrak",
      date: "2026-06-05",
      odometer: 71500,
      liters: 65,
      pricePerLiter: 19450,
      totalAmount: 1264250,
      gasStation: "PV Oil Đại Cồ Việt",
      isFullTank: true,
      createdAt: "2026-06-05T10:15:00Z"
    }
  ],
  maintenances: [
    {
      id: "M-3001",
      vehicleId: "V-001",
      vehicleName: "VinFast VF8 Plus",
      title: "Bảo dưỡng 12.000 km",
      date: "2026-04-12",
      odometer: 12000,
      cost: 1500000,
      garage: "VinFast Smart City Hà Nội",
      notes: "Kiểm tra pin hệ thống, đảo lốp, cập nhật firmware phần mềm v9.",
      status: "Đã hoàn thành",
      createdAt: "2026-04-12T10:00:00Z"
    },
    {
      id: "M-3002",
      vehicleId: "V-002",
      vehicleName: "Toyota Camry 2.5Q",
      title: "Bảo dưỡng 45.000 km & Thay dầu máy",
      date: "2026-05-02",
      odometer: 45000,
      cost: 2400000,
      garage: "Toyota Mỹ Đình",
      notes: "Thay nhớt Castrol Magnatec, thay lọc dầu, vệ sinh điều hòa.",
      status: "Đã hoàn thành",
      createdAt: "2026-05-02T14:30:00Z"
    },
    {
      id: "M-3003",
      vehicleId: "V-003",
      vehicleName: "Ford Ranger Wildtrak",
      title: "Bảo dưỡng gầm bệ & Lọc dầu",
      date: "2026-02-18",
      odometer: 64000,
      cost: 4800000,
      garage: "Ford Thanh Xuân",
      notes: "Nhớt quá hạn xấp xỉ, cần thực hiện bảo dưỡng thay dầu động cơ định kỳ.",
      status: "Cần thực hiện ngay",
      createdAt: "2026-02-18T11:00:00Z"
    }
  ]
};

// Auto-create of fleet data
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_STORE, null, 2));
}

app.use(express.json());

// Load and Save store helpers
function getStore() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    const store = JSON.parse(data);
    store.vehicles = store.vehicles || [];
    store.trips = store.trips || [];
    store.fuels = store.fuels || [];
    store.maintenances = store.maintenances || [];
    store.drivers = store.drivers || [
      { id: "DRV-1", name: "Dương Minh Hoàng", phoneNumber: "0981234567", licenseNumber: "B2 (Cấp năm 2023)" },
      { id: "DRV-2", name: "Trần Văn Tuyền", phoneNumber: "0902345678", licenseNumber: "D (Cấp năm 2021)" },
      { id: "DRV-3", name: "Nguyễn Hồng Sơn", phoneNumber: "0915678901", licenseNumber: "C (Cấp năm 2022)" }
    ];
    store.departments = store.departments || [
      { id: "DEP-1", name: "Phòng Kinh Doanh", contactPerson: "Nguyễn Thị Mai", phoneNumber: "0934567890" },
      { id: "DEP-2", name: "Bộ Phận Kỹ Thuật", contactPerson: "Trần Thế Khoa", phoneNumber: "0971239876" },
      { id: "DEP-3", name: "Ban Giám Đốc", contactPerson: "Trần Thị Lan", phoneNumber: "024-332211" }
    ];
    return store;
  } catch (error) {
    console.error("Error loading hạm đội store, resetting to default:", error);
    const store = {
      ...DEFAULT_STORE,
      drivers: [
        { id: "DRV-1", name: "Dương Minh Hoàng", phoneNumber: "0981234567", licenseNumber: "B2 (Cấp năm 2023)" },
        { id: "DRV-2", name: "Trần Văn Tuyền", phoneNumber: "0902345678", licenseNumber: "D (Cấp năm 2021)" },
        { id: "DRV-3", name: "Nguyễn Hồng Sơn", phoneNumber: "0915678901", licenseNumber: "C (Cấp năm 2022)" }
      ],
      departments: [
        { id: "DEP-1", name: "Phòng Kinh Doanh", contactPerson: "Nguyễn Thị Mai", phoneNumber: "0934567890" },
        { id: "DEP-2", name: "Bộ Phận Kỹ Thuật", contactPerson: "Trần Thế Khoa", phoneNumber: "0971239876" },
        { id: "DEP-3", name: "Ban Giám Đốc", contactPerson: "Trần Thị Lan", phoneNumber: "024-332211" }
      ]
    };
    return store;
  }
}

function saveStore(store: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
  } catch (error) {
    console.error("Error writing fleet data store:", error);
  }
}

// Lazy load Google GenAI
let aiInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiInstance = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY_IF_ABSENT",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// 🚗 API ENDPOINTS

// 1. Get vehicles list
app.get("/api/vehicles", (req, res) => {
  const store = getStore();
  res.json({ success: true, data: store.vehicles || [] });
});

// 2. Add custom vehicle
app.post("/api/vehicles", (req, res) => {
  try {
    const vehicle = req.body;
    if (!vehicle.name || !vehicle.plateNumber) {
      return res.status(400).json({ success: false, error: "Thiếu tên xe hoặc biển số xe" });
    }
    const store = getStore();
    const newVehicle = {
      id: `V-${Date.now()}`,
      name: vehicle.name,
      plateNumber: vehicle.plateNumber,
      type: vehicle.type || "Phổ thông",
      odometer: parseInt(vehicle.odometer as any) || 0,
      averageConsumption: parseFloat(vehicle.averageConsumption as any) || 8.0,
      oilChangeInterval: parseInt(vehicle.oilChangeInterval as any) || 5000,
      lastMaintenanceOdo: parseInt(vehicle.lastMaintenanceOdo as any) || parseInt(vehicle.odometer as any) || 0,
      insuranceExpiry: vehicle.insuranceExpiry || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      registrationExpiry: vehicle.registrationExpiry || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      image: vehicle.image || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600"
    };

    store.vehicles.push(newVehicle);
    saveStore(store);
    res.json({ success: true, data: newVehicle });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi ghi thông tin xe" });
  }
});

// 2a. Edit vehicle
app.put("/api/vehicles/:id", (req, res) => {
  try {
    const id = req.params.id;
    const update = req.body;
    const store = getStore();
    const index = store.vehicles.findIndex((v: any) => v.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: "Không tìm thấy xe" });
    }
    
    store.vehicles[index] = {
      ...store.vehicles[index],
      name: update.name || store.vehicles[index].name,
      plateNumber: update.plateNumber || store.vehicles[index].plateNumber,
      type: update.type || store.vehicles[index].type,
      odometer: update.odometer !== undefined ? parseInt(update.odometer) : store.vehicles[index].odometer,
      averageConsumption: update.averageConsumption !== undefined ? parseFloat(update.averageConsumption) : store.vehicles[index].averageConsumption,
      oilChangeInterval: update.oilChangeInterval !== undefined ? parseInt(update.oilChangeInterval) : store.vehicles[index].oilChangeInterval,
      lastMaintenanceOdo: update.lastMaintenanceOdo !== undefined ? parseInt(update.lastMaintenanceOdo) : store.vehicles[index].lastMaintenanceOdo,
      insuranceExpiry: update.insuranceExpiry !== undefined ? update.insuranceExpiry : store.vehicles[index].insuranceExpiry,
      registrationExpiry: update.registrationExpiry !== undefined ? update.registrationExpiry : store.vehicles[index].registrationExpiry,
      image: update.image || store.vehicles[index].image
    };

    saveStore(store);
    res.json({ success: true, data: store.vehicles[index] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2b. Delete vehicle
app.delete("/api/vehicles/:id", (req, res) => {
  try {
    const id = req.params.id;
    const store = getStore();
    store.vehicles = store.vehicles.filter((v: any) => v.id !== id);
    saveStore(store);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get Trips / Mileage Log
app.get("/api/mileage", (req, res) => {
  const store = getStore();
  res.json({ success: true, data: store.trips || [] });
});

// 4. Log Trip (updates Odo)
app.post("/api/mileage", (req, res) => {
  try {
    const trip = req.body;
    if (!trip.vehicleId || !trip.startingOdo || !trip.endingOdo) {
      return res.status(400).json({ success: false, error: "Thiếu tham số xe, số km bắt đầu hoặc kết thúc" });
    }

    const start = parseInt(trip.startingOdo);
    const end = parseInt(trip.endingOdo);
    if (end < start) {
      return res.status(400).json({ success: false, error: "Số Km kết thúc không thể nhỏ hơn Số Km bắt đầu" });
    }

    const store = getStore();
    const vehicle = store.vehicles.find((v: any) => v.id === trip.vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, error: "Không tìm thấy thông tin xe tương ứng" });
    }

    const distance = end - start;

    // Create log
    const newTrip = {
      id: `T-${Date.now()}`,
      vehicleId: trip.vehicleId,
      vehicleName: vehicle.name,
      vehiclePlate: vehicle.plateNumber,
      driverName: trip.driverName || "Tài xế nội bộ",
      date: trip.date || new Date().toISOString().split('T')[0],
      startingOdo: start,
      endingOdo: end,
      distance: distance,
      purpose: trip.purpose || "Công tác",
      startingPoint: trip.startingPoint || "Công ty",
      destination: trip.destination || "Khách hàng",
      tollFee: parseInt(trip.tollFee as any) || 0,
      notes: trip.notes || "",
      createdAt: new Date().toISOString()
    };

    // Update vehicle odometer
    vehicle.odometer = end;

    store.trips.unshift(newTrip);
    saveStore(store);

    res.json({ success: true, data: newTrip });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi ghi lịch trình số km" });
  }
});

// 5. Get Fuel Logs
app.get("/api/fuel", (req, res) => {
  const store = getStore();
  res.json({ success: true, data: store.fuels || [] });
});

// 6. Add Fuel Refill
app.post("/api/fuel", (req, res) => {
  try {
    const fuel = req.body;
    if (!fuel.vehicleId || !fuel.liters || !fuel.pricePerLiter) {
      return res.status(400).json({ success: false, error: "Thiếu thông tin xe, số lít hoặc đơn giá xăng dặm" });
    }

    const store = getStore();
    const vehicle = store.vehicles.find((v: any) => v.id === fuel.vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, error: "Không tìm thấy thông tin xe tương ứng" });
    }

    const liters = parseFloat(fuel.liters);
    const price = parseInt(fuel.pricePerLiter);
    const amount = Math.round(liters * price);
    const odo = parseInt(fuel.odometer) || vehicle.odometer;

    const newFuel = {
      id: `F-${Date.now()}`,
      vehicleId: fuel.vehicleId,
      vehicleName: vehicle.name,
      date: fuel.date || new Date().toISOString().split('T')[0],
      odometer: odo,
      liters: liters,
      pricePerLiter: price,
      totalAmount: amount,
      gasStation: fuel.gasStation || "Cửa hàng xăng dầu Petrolimex",
      isFullTank: fuel.isFullTank === true || fuel.isFullTank === 'true',
      createdAt: new Date().toISOString()
    };

    // If odometer updated, adjust vehicle odometer
    if (odo > vehicle.odometer) {
      vehicle.odometer = odo;
    }

    store.fuels.unshift(newFuel);
    saveStore(store);

    res.json({ success: true, data: newFuel });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi ghi nhận hóa đơn xăng dầu" });
  }
});

// 7. Get Maintenance Logs
app.get("/api/maintenance", (req, res) => {
  const store = getStore();
  res.json({ success: true, data: store.maintenances || [] });
});

// 8. Add/Schedule Maintenance
app.post("/api/maintenance", (req, res) => {
  try {
    const maint = req.body;
    if (!maint.vehicleId || !maint.title || !maint.cost) {
      return res.status(400).json({ success: false, error: "Thiếu thông tin xe, hạng mục hoặc chi phí bảo dưỡng" });
    }

    const store = getStore();
    const vehicle = store.vehicles.find((v: any) => v.id === maint.vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, error: "Không tìm thấy xe" });
    }

    const odo = parseInt(maint.odometer) || vehicle.odometer;

    const newMaint = {
      id: `M-${Date.now()}`,
      vehicleId: maint.vehicleId,
      vehicleName: vehicle.name,
      title: maint.title,
      date: maint.date || new Date().toISOString().split('T')[0],
      odometer: odo,
      cost: parseInt(maint.cost) || 0,
      garage: maint.garage || "Garage ủy quyền chính hãng",
      notes: maint.notes || "",
      status: maint.status || "Đã hoàn thành",
      createdAt: new Date().toISOString()
    };

    if (newMaint.status === "Đã hoàn thành") {
      vehicle.lastMaintenanceOdo = odo;
      if (odo > vehicle.odometer) {
        vehicle.odometer = odo;
      }
    }

    store.maintenances.unshift(newMaint);
    saveStore(store);

    res.json({ success: true, data: newMaint });
  } catch (error) {
    res.status(500).json({ success: false, error: "Lỗi ghi thông tin bảo dưỡng" });
  }
});

// --- DRIVERS CRUD ---
app.get("/api/drivers", (req, res) => {
  const store = getStore();
  res.json({ success: true, data: store.drivers || [] });
});

app.post("/api/drivers", (req, res) => {
  try {
    const driver = req.body;
    if (!driver.name) {
      return res.status(400).json({ success: false, error: "Họ tên không được để trống" });
    }
    const store = getStore();
    const newDriver = {
      id: `DRV-${Date.now()}`,
      name: driver.name,
      phoneNumber: driver.phoneNumber || "",
      licenseNumber: driver.licenseNumber || ""
    };
    store.drivers = store.drivers || [];
    store.drivers.push(newDriver);
    saveStore(store);
    res.json({ success: true, data: newDriver });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/api/drivers/:id", (req, res) => {
  try {
    const id = req.params.id;
    const update = req.body;
    const store = getStore();
    store.drivers = store.drivers || [];
    const index = store.drivers.findIndex((d: any) => d.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: "Không tìm thấy tài xế" });
    }
    store.drivers[index] = {
      ...store.drivers[index],
      name: update.name || store.drivers[index].name,
      phoneNumber: update.phoneNumber !== undefined ? update.phoneNumber : store.drivers[index].phoneNumber,
      licenseNumber: update.licenseNumber !== undefined ? update.licenseNumber : store.drivers[index].licenseNumber
    };
    saveStore(store);
    res.json({ success: true, data: store.drivers[index] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/drivers/:id", (req, res) => {
  try {
    const id = req.params.id;
    const store = getStore();
    store.drivers = (store.drivers || []).filter((d: any) => d.id !== id);
    saveStore(store);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// --- DEPARTMENTS CRUD ---
app.get("/api/departments", (req, res) => {
  const store = getStore();
  res.json({ success: true, data: store.departments || [] });
});

app.post("/api/departments", (req, res) => {
  try {
    const dep = req.body;
    if (!dep.name) {
      return res.status(400).json({ success: false, error: "Tên đơn vị, phòng ban không được để trống" });
    }
    const store = getStore();
    const newDep = {
      id: `DEP-${Date.now()}`,
      name: dep.name,
      contactPerson: dep.contactPerson || "",
      phoneNumber: dep.phoneNumber || ""
    };
    store.departments = store.departments || [];
    store.departments.push(newDep);
    saveStore(store);
    res.json({ success: true, data: newDep });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/api/departments/:id", (req, res) => {
  try {
    const id = req.params.id;
    const update = req.body;
    const store = getStore();
    store.departments = store.departments || [];
    const index = store.departments.findIndex((d: any) => d.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: "Không tìm thấy phòng ban/đơn vị" });
    }
    store.departments[index] = {
      ...store.departments[index],
      name: update.name || store.departments[index].name,
      contactPerson: update.contactPerson !== undefined ? update.contactPerson : store.departments[index].contactPerson,
      phoneNumber: update.phoneNumber !== undefined ? update.phoneNumber : store.departments[index].phoneNumber
    };
    saveStore(store);
    res.json({ success: true, data: store.departments[index] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/departments/:id", (req, res) => {
  try {
    const id = req.params.id;
    const store = getStore();
    store.departments = (store.departments || []).filter((d: any) => d.id !== id);
    saveStore(store);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// --- LOGS DELETION (INDIVIDUAL AND ALL) ---

// Deleted individual trip log
app.delete("/api/mileage/:id", (req, res) => {
  try {
    const id = req.params.id;
    const store = getStore();
    store.trips = (store.trips || []).filter((t: any) => t.id !== id);
    saveStore(store);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete all mileage logs
app.delete("/api/mileage", (req, res) => {
  try {
    const store = getStore();
    store.trips = [];
    saveStore(store);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete individual fuel refilling log
app.delete("/api/fuel/:id", (req, res) => {
  try {
    const id = req.params.id;
    const store = getStore();
    store.fuels = (store.fuels || []).filter((f: any) => f.id !== id);
    saveStore(store);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete all fuel logs
app.delete("/api/fuel", (req, res) => {
  try {
    const store = getStore();
    store.fuels = [];
    saveStore(store);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete individual maintenance log
app.delete("/api/maintenance/:id", (req, res) => {
  try {
    const id = req.params.id;
    const store = getStore();
    store.maintenances = (store.maintenances || []).filter((m: any) => m.id !== id);
    saveStore(store);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete all maintenance logs
app.delete("/api/maintenance", (req, res) => {
  try {
    const store = getStore();
    store.maintenances = [];
    saveStore(store);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// 9. AI Co-pilot Chat proxy (Gemini API)
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: "Message is required" });
    }

    // Guard on Gemini API Key
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        text: "Xin chào! Hiện tại tôi đang chạy ở chế độ Demo (thiếu API Key của hạm đội). Tôi là Trợ lý AI Co-pilot từ RoyalCare Auto, chuyên viên tính toán định mức nhiên liệu, báo lỗi động cơ OBD và hướng dẫn bảo dưỡng định kỳ các dòng xe ô tô. \n\n*Hỏi tôi:* Cách tính định mức xăng xe Camry, ý nghĩa biểu tượng báo lỗi lọc nhớt đỏ, hay lịch bảo quản phanh đĩa xe!"
      });
    }

    const store = getStore();
    const vehiclesBrief = store.vehicles.map((v: any) => 
      `- ${v.name} (Biển: ${v.plateNumber}, ODO: ${v.odometer} km, Định mức: ${v.averageConsumption} L/100km, Thay dầu mỗi: ${v.oilChangeInterval} km)`
    ).join("\n");

    const aiClient = getGenAI();
    
    // We create chat context
    const chatInstance = aiClient.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: `Bạn là RoyalCare Fleet AI Co-pilot - Trợ lý số hóa thông minh, kỹ sư kiểm định chuyên môn vững vàng của RoyalCare Auto Việt Nam. 
Nhiệm vụ của bạn là hỗ trợ các chủ doanh nghiệp, quản lý hạm đội, tài xế và cá nhân quản lý số km hành trình, định mức xăng dầu dặm, tư vấn xử lý lỗi xe, và lên kế hoạch bảo dưỡng an toàn.

Thông tin đội xe hiện tại đang được quản lý bởi hệ thống:
${vehiclesBrief}

Cẩm nang kiến thức bạn có:
1. Công thức tính định mức hao phí xăng: Chi phí = (Quãng đường / 100) * Định mức tiêu thụ * Đơn giá xăng. (Đơn giá xăng trung bình hiện tại khoảng: RON95-III là 22.850đ/lít, Dầu Diesel DO là 19.450đ/lít).
2. Quy định bảo dưỡng:
   - Cấp 1 (Thay dầu nhớt & kiểm tra phanh): Mỗi 5.000 km hoặc sau 6 tháng.
   - Cấp 2 (Thay lọc dầu cốc, lọc gió): Mỗi 10.000 km.
   - Cấp 3 (Vệ sinh bugi, bướm ga): Mỗi 20.000 km.
   - Cấp 4 (Trọn gói, thay dầu số, phanh, nước làm mát): Mỗi 40.000 km.
3. Giải mã nhanh một số mã lỗi kiểm check động cơ OBD tiêu chuẩn và đèn cảnh báo táp-lô (như biểu tượng đèn dầu đỏ, biểu tượng ắc quy, đèn phanh ABS, đèn kiểm tra lỗi động cơ màu vàng cá vàng).
4. Khuyên giải các tài xế lái xe an toàn, duy trì áp suất lốp chu đáo, và sử dụng nhiên liệu tối ưu.

Hãy trả lời ngắn gọn, có cấu trúc markdown rõ ràng, sử dụng các icon thân thiện như 🚗, 🛠️, ⛽, 📈 để tạo cảm hứng và luôn khuyên lái xe an toàn.`
      }
    });

    const result = await chatInstance.sendMessage({ message });
    res.json({ success: true, text: result.text });
  } catch (error: any) {
    console.error("Gemini AI API Error in server.ts:", error);
    res.status(500).json({ success: false, error: error.message || "Lỗi xử lý phản hồi từ AI Co-pilot" });
  }
});


// Setup dev system
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server run on http://0.0.0.0:${PORT}`);
  });
}

startServer();
