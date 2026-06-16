import { Vehicle, TripLog, FuelLog, MaintenanceLog } from "./types";

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: "V-001",
    name: "VinFast VF8 Plus",
    plateNumber: "30K-999.88",
    type: "Điện",
    odometer: 18450,
    averageConsumption: 18.5, // kWh/100km
    oilChangeInterval: 12000, // Electric motors require less frequent chassis services
    lastMaintenanceOdo: 12000,
    insuranceExpiry: "2026-12-15",
    registrationExpiry: "2026-12-15",
    image: "https://images.unsplash.com/photo-1621993202323-f438eec934ff?auto=format&fit=crop&q=80&w=600" // Premium Electric SUV
  },
  {
    id: "V-002",
    name: "Toyota Camry 2.5Q",
    plateNumber: "29A-666.99",
    type: "Cao cấp",
    odometer: 48900,
    averageConsumption: 7.8, // L/100km
    oilChangeInterval: 5000, // every 5k km
    lastMaintenanceOdo: 45000, // needs oil change since current is 48900 (limit is 50000)
    insuranceExpiry: "2026-08-20",
    registrationExpiry: "2026-08-20",
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=600" // Sleek sedan
  },
  {
    id: "V-003",
    name: "Ford Ranger Wildtrak",
    plateNumber: "30F-123.45",
    type: "Bán tải",
    odometer: 72100,
    averageConsumption: 8.6, // L/100km
    oilChangeInterval: 8000,
    lastMaintenanceOdo: 64000, // 72100 - 64000 = 8100 -> OVERDUE (Needs maintenance immediately!)
    insuranceExpiry: "2026-04-10", // Lapsed!
    registrationExpiry: "2026-10-18",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600" // Truck
  },
  {
    id: "V-004",
    name: "Hyundai Accent 1.4 AT",
    plateNumber: "30G-777.22",
    type: "Phổ thông",
    odometer: 24500,
    averageConsumption: 6.2, // L/100km
    oilChangeInterval: 5000,
    lastMaintenanceOdo: 20000, // 4500km since last oil change, approaching 25000
    insuranceExpiry: "2026-11-30",
    registrationExpiry: "2027-05-12",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600" // Economy compact
  }
];

export const INITIAL_TRIPS: TripLog[] = [
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
  },
  {
    id: "T-1004",
    vehicleId: "V-004",
    vehicleName: "Hyundai Accent 1.4 AT",
    vehiclePlate: "30G-777.22",
    driverName: "Lê Minh Thảo",
    date: "2026-06-15",
    startingOdo: 24450,
    endingOdo: 24500,
    distance: 50,
    purpose: "Ngoại giao",
    startingPoint: "Trụ sở chính",
    destination: "Sở Kế hoạch Đầu tư",
    tollFee: 0,
    notes: "Trình hồ sơ nộp báo cáo quý 2.",
    createdAt: "2026-06-15T15:00:00Z"
  }
];

export const INITIAL_FUELS: FuelLog[] = [
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
  },
  {
    id: "F-2003",
    vehicleId: "V-004",
    vehicleName: "Hyundai Accent 1.4 AT",
    date: "2026-06-12",
    odometer: 24100,
    liters: 32,
    pricePerLiter: 22850,
    totalAmount: 731200,
    gasStation: "Petrolimex Số 45 - Phạm Văn Đồng",
    isFullTank: true,
    createdAt: "2026-06-12T18:00:00Z"
  }
];

export const INITIAL_MAINTENANCE: MaintenanceLog[] = [
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
    notes: "Phát hiện xước rotuyn lái nhẹ nhưng chưa cần thay. Sắp đến hạn bảo dưỡng 72.000km và nhớt quá hạn xấp xỉ.",
    status: "Cần thực hiện ngay",
    createdAt: "2026-02-18T11:00:00Z"
  }
];
