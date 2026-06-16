export interface Vehicle {
  id: string;
  name: string; // e.g. "VinFast VF8 SUV", "Toyota Camry Sedan"
  plateNumber: string; // e.g. "30K-999.88"
  type: "Phổ thông" | "Cao cấp" | "Bán tải" | "Điện";
  odometer: number; // Current km
  averageConsumption: number; // L/100km or kWh/100km
  oilChangeInterval: number; // e.g., 5000km
  lastMaintenanceOdo: number; // km at last maintenance
  insuranceExpiry: string; // Date
  registrationExpiry: string; // Date
  image: string;
}

export interface TripLog {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  driverName: string;
  date: string;
  startingOdo: number;
  endingOdo: number;
  distance: number;
  purpose: "Công tác" | "Đưa đón Sếp" | "Giao hàng" | "Ngoại giao" | "Cá nhân";
  startingPoint: string;
  destination: string;
  tollFee: number;
  notes?: string;
  createdAt: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  vehicleName: string;
  date: string;
  odometer: number;
  liters: number;
  pricePerLiter: number;
  totalAmount: number;
  gasStation: string;
  isFullTank: boolean;
  createdAt: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  vehicleName: string;
  title: string; // e.g., "Thay dầu động cơ", "Bảo dưỡng 10.000km"
  date: string;
  odometer: number;
  cost: number;
  garage: string;
  notes?: string;
  status: "Đã hoàn thành" | "Sắp đến hạn" | "Cần thực hiện ngay";
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export interface Driver {
  id: string;
  name: string;
  phoneNumber: string;
  licenseNumber: string;
}

export interface Department {
  id: string;
  name: string;
  contactPerson: string;
  phoneNumber: string;
}


