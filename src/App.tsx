import React, { useState, useEffect } from "react";
import VehicleCard from "./components/VehicleCard";
import TripLoggerForm from "./components/TripLoggerForm";
import TripHistoryList from "./components/TripHistoryList";
import FuelMaintenanceTracker from "./components/FuelMaintenanceTracker";
import AiChatAssistant from "./components/AiChatAssistant";
import { Vehicle, TripLog, FuelLog, MaintenanceLog, Driver, Department } from "./types";
import { 
  Plus, 
  Car, 
  Compass, 
  Fuel, 
  Wrench, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  LayoutDashboard,
  Users,
  Building,
  FileSpreadsheet,
  Clock,
  PhoneCall,
  Menu,
  X,
  Edit2,
  Trash2,
  User,
  Undo
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Fleet Core Data states
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<TripLog[]>([]);
  const [fuels, setFuels] = useState<FuelLog[]>([]);
  const [maintenances, setMaintenances] = useState<MaintenanceLog[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Selected states for inline shortcuts
  const [targetVehicle, setTargetVehicle] = useState<Vehicle | null>(null);

  // Time state for visual clock in sidebar
  const [time, setTime] = useState("");

  // New vehicle setup form modal state & editing vehicle state
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [newVehName, setNewVehName] = useState("");
  const [newVehPlate, setNewVehPlate] = useState("");
  const [newVehType, setNewVehType] = useState("Xăng/Dầu");
  const [newVehOdo, setNewVehOdo] = useState("");
  const [newVehConsumption, setNewVehConsumption] = useState("");
  const [newVehInterval, setNewVehInterval] = useState("");
  const [newVehYear, setNewVehYear] = useState("");
  const [newVehInsurance, setNewVehInsurance] = useState("");
  const [vehError, setVehError] = useState<string | null>(null);

  // Drivers Management state
  const [showAddDriverForm, setShowAddDriverForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [drvName, setDrvName] = useState("");
  const [drvPhone, setDrvPhone] = useState("");
  const [drvLicense, setDrvLicense] = useState("");
  const [drvError, setDrvError] = useState<string | null>(null);

  // Departments Management state
  const [showAddDeptForm, setShowAddDeptForm] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptNameState, setDeptNameState] = useState("");
  const [deptContact, setDeptContact] = useState("");
  const [deptPhone, setDeptPhone] = useState("");
  const [deptError, setDeptError] = useState<string | null>(null);

  // Fetch Vietnamese local digital clock for sidebar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Parallel master data fetch on mount & refreshes
  const fetchAllFleetData = async () => {
    setLoading(true);
    try {
      const [resVeh, resTrips, resFuels, resMaint, resDrivers, resDepts] = await Promise.all([
        fetch("/api/vehicles").then(r => r.json()),
        fetch("/api/mileage").then(r => r.json()),
        fetch("/api/fuel").then(r => r.json()),
        fetch("/api/maintenance").then(r => r.json()),
        fetch("/api/drivers").then(r => r.json()).catch(() => ({ success: true, data: [] })),
        fetch("/api/departments").then(r => r.json()).catch(() => ({ success: true, data: [] }))
      ]);

      if (resVeh.success) setVehicles(resVeh.data);
      if (resTrips.success) setTrips(resTrips.data);
      if (resFuels.success) setFuels(resFuels.data);
      if (resMaint.success) setMaintenances(resMaint.data);
      if (resDrivers.success) setDrivers(resDrivers.data || []);
      if (resDepts.success) setDepartments(resDepts.data || []);
    } catch (error) {
      console.error("Gặp lỗi tải thông tin cơ sở dữ liệu hạm đội:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFleetData();
  }, []);

  // Quick helper handlers
  const handleTripSuccess = (newTrip: any) => {
    fetchAllFleetData();
    setActiveTab("history"); // redirect to trip list
    setTargetVehicle(null);
  };

  // Fuel & Maintenance submission promises
  const handleAddFuelLog = async (payload: any): Promise<boolean> => {
    try {
      const res = await fetch("/api/fuel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        fetchAllFleetData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleAddMaintLog = async (payload: any): Promise<boolean> => {
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        fetchAllFleetData();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Vehicles: POST, PUT, DELETE operations
  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setVehError(null);

    if (!newVehName.trim() || !newVehPlate.trim()) {
      setVehError("Vui lòng nhập Tên xe và Biển kiểm soát.");
      return;
    }

    try {
      let imageStr = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600";
      if (newVehName.toLowerCase().includes("camry")) {
        imageStr = "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=600";
      } else if (newVehName.toLowerCase().includes("ranger") || newVehName.toLowerCase().includes("ford")) {
        imageStr = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600";
      } else if (newVehName.toLowerCase().includes("vinfast") || newVehName.toLowerCase().includes("vf")) {
        imageStr = "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=600";
      }

      // Convert fields with fallback default values according to optional fields specification
      const payload = {
        name: newVehName.trim(),
        plateNumber: newVehPlate.trim().toUpperCase(),
        type: newVehType,
        odometer: parseInt(newVehOdo) || 0,
        averageConsumption: parseFloat(newVehConsumption) || 7.5,
        oilChangeInterval: parseInt(newVehInterval) || 5000,
        lastMaintenanceOdo: parseInt(newVehOdo) || 0,
        insuranceExpiry: newVehInsurance.trim() || "Chưa mua",
        year: parseInt(newVehYear) || 2024,
        image: imageStr
      };

      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (data.success) {
        setShowAddVehicleModal(false);
        setNewVehName("");
        setNewVehPlate("");
        setNewVehOdo("");
        setNewVehConsumption("");
        setNewVehInterval("");
        setNewVehYear("");
        setNewVehInsurance("");
        fetchAllFleetData();
      } else {
        setVehError(data.error || "Có lỗi khi đăng kiểm phương tiện.");
      }
    } catch (err) {
      console.error(err);
      setVehError("Mất liên kết máy chủ. Hãy thử lại!");
    }
  };

  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    try {
      const response = await fetch(`/api/vehicles/${editingVehicle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingVehicle)
      });
      const data = await response.json();

      if (data.success) {
        setEditingVehicle(null);
        fetchAllFleetData();
      } else {
        alert(data.error || "Có lỗi xảy ra khi cập nhật thông tin xe.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối máy chủ");
    }
  };

  const handleDeleteVehicle = async (vehicle: Vehicle) => {
    if (!confirm(`Bạn có chắc muốn XÓA phương tiện ${vehicle.name} (${vehicle.plateNumber}) khỏi hệ thống?`)) return;
    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        fetchAllFleetData();
      } else {
        alert(data.error || "Lỗi khi xóa phương tiện.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi máy chủ khi xóa phương tiện.");
    }
  };

  // Drivers: POST, PUT, DELETE operations
  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDrvError(null);

    if (!drvName.trim()) {
      setDrvError("Họ tên nhân viên lái xe bắt buộc phải nhập.");
      return;
    }

    try {
      const payload = {
        name: drvName.trim(),
        phoneNumber: drvPhone.trim() || "",
        licenseNumber: drvLicense.trim() || ""
      };

      let response;
      if (editingDriver) {
        response = await fetch(`/api/drivers/${editingDriver.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch("/api/drivers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      const data = await response.json();

      if (data.success) {
        setShowAddDriverForm(false);
        setEditingDriver(null);
        setDrvName("");
        setDrvPhone("");
        setDrvLicense("");
        fetchAllFleetData();
      } else {
        setDrvError(data.error || "Lỗi thao tác trên hồ sơ tài xế.");
      }
    } catch (err) {
      console.error(err);
      setDrvError("Mất liên kết máy chủ tài xế.");
    }
  };

  const startEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
    setDrvName(driver.name);
    setDrvPhone(driver.phoneNumber);
    setDrvLicense(driver.licenseNumber);
    setShowAddDriverForm(true);
  };

  const handleDeleteDriver = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn XÓA nhân viên lái xe này?")) return;
    try {
      const res = await fetch(`/api/drivers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchAllFleetData();
      } else {
        alert(data.error || "Lỗi khi xóa");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Departments: POST, PUT, DELETE operations
  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeptError(null);

    if (!deptNameState.trim()) {
      setDeptError("Tên phòng ban / đơn vị đặt xe bắt buộc phải nhập.");
      return;
    }

    try {
      const payload = {
        name: deptNameState.trim(),
        contactPerson: deptContact.trim() || "",
        phoneNumber: deptPhone.trim() || ""
      };

      let response;
      if (editingDept) {
        response = await fetch(`/api/departments/${editingDept.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch("/api/departments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      const data = await response.json();

      if (data.success) {
        setShowAddDeptForm(false);
        setEditingDept(null);
        setDeptNameState("");
        setDeptContact("");
        setDeptPhone("");
        fetchAllFleetData();
      } else {
        setDeptError(data.error || "Lỗi thao tác phòng ban.");
      }
    } catch (err) {
      console.error(err);
      setDeptError("Mất liên kết máy chủ phòng ban.");
    }
  };

  const startEditDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptNameState(dept.name);
    setDeptContact(dept.contactPerson);
    setDeptPhone(dept.phoneNumber);
    setShowAddDeptForm(true);
  };

  const handleDeleteDept = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn XÓA phòng ban / đơn vị đặt xe này?")) return;
    try {
      const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchAllFleetData();
      } else {
        alert(data.error || "Lỗi khi xóa");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Deleting logs (individual and mass bulk delete)
  const handleDeleteTrip = async (id: string) => {
    try {
      const res = await fetch(`/api/mileage/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchAllFleetData();
      } else {
        alert(data.error || "Gặp lỗi khi xóa chuyến đi.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAllTrips = async () => {
    try {
      const res = await fetch(`/api/mileage`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchAllFleetData();
      } else {
        alert(data.error || "Gặp lỗi khi xóa tất cả lộ trình.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFuel = async (id: string) => {
    try {
      const res = await fetch(`/api/fuel/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchAllFleetData();
      } else {
        alert(data.error || "Gặp lỗi khi xóa phiếu đổ xăng.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAllFuels = async () => {
    try {
      const res = await fetch(`/api/fuel`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchAllFleetData();
      } else {
        alert(data.error || "Gặp lỗi khi xóa tất cả phiếu đổ xăng.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMaint = async (id: string) => {
    try {
      const res = await fetch(`/api/maintenance/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchAllFleetData();
      } else {
        alert(data.error || "Gặp lỗi khi xóa hồ sơ sửa chữa.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAllMaints = async () => {
    try {
      const res = await fetch(`/api/maintenance`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchAllFleetData();
      } else {
        alert(data.error || "Gặp lỗi khi dọn tất cả hồ sơ bảo dưởng.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Inline shortcuts linking to specific forms
  const handleShortcutTrip = (veh: Vehicle) => {
    setTargetVehicle(veh);
    setActiveTab("booking");
  };

  const handleShortcutFuel = (veh: Vehicle) => {
    setTargetVehicle(veh);
    setActiveTab("health-tips");
  };

  const handleShortcutMaint = (veh: Vehicle) => {
    setTargetVehicle(veh);
    setActiveTab("health-tips");
  };

  // KPI Calculations
  const totalKmDriven = trips.reduce((acc, t) => acc + t.distance, 0);
  const totalFuelVolume = fuels.reduce((acc, f) => acc + f.liters, 0);
  const totalCostEstimate = 
    fuels.reduce((acc, f) => acc + f.totalAmount, 0) + 
    maintenances.reduce((acc, m) => acc + m.cost, 0) +
    trips.reduce((acc, t) => acc + t.tollFee, 0);

  // Check vehicles overdue for oil/grease change
  const vehiclesWithOverdueMaint = vehicles.filter(v => {
    const drivenSinceMaint = v.odometer - v.lastMaintenanceOdo;
    return drivenSinceMaint >= v.oilChangeInterval;
  });

  // Sidebar list of active menus
  const menuItems = [
    { id: "home", label: "Tổng Quan", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "caregivers", label: "Danh Sách Xe", icon: <Car className="w-4 h-4" /> },
    { id: "drivers", label: "Nhân Viên Lái Xe", icon: <Users className="w-4 h-4" /> },
    { id: "departments", label: "Phòng Ban Đặt Xe", icon: <Building className="w-4 h-4" /> },
    { id: "booking", label: "Ghi Số KM", icon: <Compass className="w-4 h-4" /> },
    { id: "history", label: "Sổ Lộ Trình", icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: "health-tips", label: "Nhiên Liệu / Phanh", icon: <Fuel className="w-4 h-4" /> },
    { id: "ai-assistant", label: "Hỏi Trợ Lý AI", icon: <Sparkles className="w-4 h-4 text-emerald-400" /> }
  ];

  const handleMenuClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-royal-950 font-sans" id="royalcore-app-root">
      
      {/* 1. MOBILE RESPONSIVE NAV HEADER */}
      <header className="md:hidden bg-royal-950 text-white flex items-center justify-between p-4 sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-royal-650 rounded text-white font-extrabold text-sm">RC</div>
          <span className="font-display font-black text-lg tracking-tight">ROYALAUTO <span className="text-royal-400">FLEET</span></span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 bg-royal-900 border border-royal-800 rounded text-royal-300"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* 2. PERSISTENT VERTICAL SIDEBAR ON THE LEFT */}
      <aside className={`
        ${mobileMenuOpen ? "block" : "hidden"} 
        md:block w-full md:w-64 bg-royal-950 text-white flex flex-col justify-between shrink-0 border-r border-royal-900 
        md:sticky md:top-0 md:h-screen z-45 transition-all lg:shadow-xl overflow-y-auto
      `}>
        <div className="flex flex-col">
          {/* Logo brand & metadata */}
          <div className="p-6 border-b border-royal-900/60 flex flex-col gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-royal-600 rounded-xl shadow shadow-royal-600/50">
                <Car className="w-6 h-6 stroke-white" />
              </div>
              <div>
                <span className="font-display font-black text-xl tracking-wide block">
                  ROYAL<span className="text-royal-400 font-extrabold">AUTO</span>
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-300 block tracking-widest leading-none mt-0.5">Fleet Core v4.4</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Hệ Thống Theo Dõi Số KM & Định Mức Xăng Xe Doanh Nghiệp</p>
          </div>

          {/* Navigation vertical selections */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-3 text-xs font-bold rounded-xl transition duration-150 cursor-pointer text-left ${
                  activeTab === item.id 
                    ? "bg-royal-600 text-white shadow-md shadow-royal-600/20" 
                    : "text-slate-350 hover:text-white hover:bg-royal-900/50"
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer utilities */}
        <div className="p-5 border-t border-royal-900/60 space-y-4 font-medium text-slate-400 text-[11px] bg-royal-955">
          <div className="flex items-center justify-between">
            <span className="flex items-center text-slate-205 select-none font-mono">
              <Clock className="w-4 h-4 mr-1 text-royal-400 animate-pulse" />
              {time || "Đang kết nối..."}
            </span>
            <span className="inline-flex items-center text-green-400 text-[10px] font-semibold">
              ● REALTIME
            </span>
          </div>
          
          <div className="pt-2 border-t border-royal-900/30 text-[10.5px]">
            <a href="tel:19001009" className="flex items-center hover:text-white text-slate-300 transition-colors">
              <PhoneCall className="w-3.5 h-3.5 mr-1 text-royal-400" /> Hot: 1900-1009
            </a>
          </div>
        </div>
      </aside>

      {/* 3. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col justify-between min-h-screen overflow-x-hidden">
        
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          
          {loading && (
            <div className="text-center py-20 text-xs text-slate-500 font-semibold select-none flex flex-col items-center gap-2">
              <span className="inline-block animate-spin border-4 border-slate-200 border-t-royal-600 w-10 h-10 rounded-full" />
              <span>Đang kết nối cơ sở dữ liệu hạm đội...</span>
            </div>
          )}

          {!loading && (
            <>
              {/* TAB 1: HOME PAGE (Dashboard view) */}
              {activeTab === "home" && (
                <div className="space-y-8 animate-fadeIn" id="home-view">
                  
                  {/* Elegant Hero Banner */}
                  <div className="bg-gradient-to-br from-royal-900 via-royal-950 to-royal-900 rounded-3xl p-6 md:p-10 text-white relative overflow-hidden shadow-md border border-royal-800 flex flex-col lg:flex-row items-center gap-8">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-royal-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />

                    <div className="flex-1 space-y-6 z-10 text-left">
                      <div className="inline-flex items-center space-x-1 px-3 py-1 bg-royal-850/60 rounded-full border border-royal-700/55 select-none text-[10px] font-black text-amber-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>CÔNG CỤ QUẢN TRỊ CƠ HẠM ĐỘI DOANH NGHIỆP</span>
                      </div>
                      
                      <h1 className="font-display font-medium text-3xl md:text-4xl leading-tight tracking-tight">
                        Tối Ưu Hoá Quản Lý <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-royal-300 via-amber-200 to-royal-400 font-black">
                          Hành Trình & Nhiên Liệu
                        </span> Xe Đội Bộ
                      </h1>

                      <p className="text-xs text-royal-200 leading-relaxed max-w-lg">
                        Ghi nhớ số liệu Odo, đăng kiểm, theo dõi nhiên liệu đổ đầy bình, nhắc nhở thay dầu bôi trơn kỹ thuật định dặm và trả lời chuẩn định lỗi xe 24/7 từ trí tuệ AI.
                      </p>

                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          onClick={() => { setTargetVehicle(null); setActiveTab("booking"); }}
                          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 font-bold text-royal-950 text-xs rounded-xl transition cursor-pointer select-none"
                        >
                          + Ghi Số KM Mới
                        </button>
                        <button
                          onClick={() => setActiveTab("ai-assistant")}
                          className="px-5 py-2.5 bg-royal-850 hover:bg-royal-800 font-bold text-white text-xs rounded-xl transition border border-royal-700 cursor-pointer select-none"
                        >
                          Hỏi Trợ Lý AI Co-Pilot
                        </button>
                      </div>
                    </div>

                    <div className="w-full lg:w-9/12 max-w-sm z-10 shrink-0">
                      <div className="relative rounded-2xl overflow-hidden border border-royal-700 shadow-xl aspect-[4/3] bg-slate-800">
                        <img 
                          src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=600" 
                          alt="Premium dashboard control visualizer" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-royal-950 via-transparent to-transparent" />
                      </div>
                    </div>
                  </div>

                  {/* General statistics metrics block */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-banner">
                    {[
                      { 
                        count: `${vehicles.length} chiếc`, 
                        label: "Hồ sơ đội xe", 
                        icon: <Car className="text-royal-600 w-4 h-4" />,
                      },
                      { 
                        count: `+${totalKmDriven.toLocaleString("vi-VN")} km`, 
                        label: "Lộ trình đi được", 
                        icon: <Compass className="text-royal-650 w-4 h-4" />,
                      },
                      { 
                        count: `${totalFuelVolume.toLocaleString("vi-VN")} Lít`, 
                        label: "Thể tích Đổ xăng", 
                        icon: <Fuel className="text-emerald-600 w-4 h-4" />,
                      },
                      { 
                        count: `${totalCostEstimate.toLocaleString("vi-VN")} đ`, 
                        label: "Ngân sách chi", 
                        icon: <Wrench className="text-orange-600 w-4 h-4" />,
                      }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white p-4 rounded-2xl border border-royal-105 shadow-sm flex items-center space-x-3.5 select-none">
                        <div className="p-3 bg-royal-50 rounded-xl shrink-0 border border-royal-100">
                          {stat.icon}
                        </div>
                        <div>
                          <h3 className="font-display font-black text-base text-royal-950 leading-none">{stat.count}</h3>
                          <p className="text-[10px] text-royal-400 font-bold uppercase tracking-wider mt-1.5">{stat.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Overdue Warnings Center Section */}
                  {vehiclesWithOverdueMaint.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row items-start justify-between gap-4 select-none">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-amber-950 uppercase tracking-wide">Nhắc nhở kỹ thuật dặm bảo dưỡng</p>
                          <p className="text-xs text-amber-900 mt-1">
                            Phát hiện <strong>{vehiclesWithOverdueMaint.length} xe</strong> đã vượt quá giới hạn dặm cần bảo hành thay xe nhớt dằm ({vehiclesWithOverdueMaint.map(v => v.plateNumber).join(", ")}). Khuyên sửa ngay!
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab("health-tips")}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer transition shrink-0"
                      >
                        Bảo trì định kỳ
                      </button>
                    </div>
                  )}

                  {/* Quick Vehicle Section */}
                  <div className="space-y-4 text-left">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Đội hình</span>
                        <h2 className="font-display text-xl font-bold tracking-tight text-royal-950">Phạm vi hạm đội công nghiệp</h2>
                      </div>
                      <button onClick={() => setActiveTab("caregivers")} className="text-xs font-bold text-royal-600 hover:text-royal-800 cursor-pointer">
                        Xem tất cả xe ({vehicles.length}) →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {vehicles.slice(0, 4).map((vehicle) => (
                        <VehicleCard 
                          key={vehicle.id}
                          vehicle={vehicle}
                          onSelectTrip={handleShortcutTrip}
                          onSelectFuel={handleShortcutFuel}
                          onSelectMaint={handleShortcutMaint}
                          onEdit={(veh) => {
                            setEditingVehicle(veh);
                            setActiveTab("caregivers");
                          }}
                          onDelete={handleDeleteVehicle}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Recents */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 text-left">
                    <div className="flex justify-between items-center pb-2 border-b border-royal-55">
                      <h3 className="font-display font-medium text-sm text-royal-950">Lộ hành trình xe mới đi</h3>
                      <button onClick={() => setActiveTab("history")} className="text-xs font-bold text-royal-600 hover:text-royal-800 cursor-pointer">
                        Sổ Km lộ trình đầy đủ →
                      </button>
                    </div>
                    {trips.length === 0 ? (
                      <p className="py-4 text-center text-xs text-slate-400 select-none">Chưa có hành trình chuyến đi nào được lưu.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {trips.slice(0, 3).map((trip) => (
                          <div key={trip.id} className="p-3.5 bg-slate-50 rounded-xl flex justify-between items-center text-xs hover:bg-slate-100/50 transition">
                            <div className="space-y-1">
                              <p className="font-black text-slate-800">{trip.driverName} lái {trip.vehicleName}</p>
                              <p className="text-[10px] text-slate-400">📅 Ngày: {trip.date} • Tuyến: {trip.startingPoint} → {trip.destination}</p>
                            </div>
                            <span className="font-mono font-black text-royal-650">+{trip.distance} km</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 2: TRIP LOGGER (Ghi Số KM) */}
              {activeTab === "booking" && (
                <div className="space-y-6">
                  <TripLoggerForm 
                    initialVehicle={targetVehicle} 
                    vehiclesList={vehicles}
                    driversList={drivers}
                    departmentsList={departments}
                    onSuccess={handleTripSuccess}
                    onCancel={() => { setTargetVehicle(null); setActiveTab("home"); }}
                  />
                </div>
              )}

              {/* TAB 3: VEHICLE REGISTRY list (Danh sách xe) */}
              {activeTab === "caregivers" && (
                <div className="space-y-6 animate-fadeIn text-left" id="caregivers-view">
                  
                  {/* Title and top header triggers */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="font-display text-2xl font-black mt-1 tracking-tight text-royal-950">
                        Danh Sách Xe Hồ Sơ Đăng Kiểm
                      </h2>
                      <p className="text-xs text-royal-500 font-sans mt-0.5">
                        Quản lý định mức, cập nhật Odometer hiện tại, cảnh báo mốc sửa phanh thay nhớt động cơ trên từng xe.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingVehicle(null);
                        setShowAddVehicleModal(!showAddVehicleModal);
                      }}
                      className="px-5 py-2.5 bg-royal-600 hover:bg-royal-700 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-sm flex items-center space-x-1.5 border border-royal-700"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm xe mới</span>
                    </button>
                  </div>

                  {/* Form 1: Add New Vehicle Modal OVERLAY */}
                  {showAddVehicleModal && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow space-y-4 max-w-2xl">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <h4 className="font-extrabold text-xs text-royal-950 uppercase tracking-wider">Đăng kiểm thêm xe công vụ mới</h4>
                        <button onClick={() => setShowAddVehicleModal(false)} className="text-xs text-slate-400 font-bold hover:text-slate-600 cursor-pointer">✕ Đóng</button>
                      </div>

                      <p className="text-[10px] text-slate-400 mt-1">Các trường thông tin kĩ thuật nâng cao dưới đây không bắt buộc nhập, có mốc tiêu chuẩn tự động.</p>
                      {vehError && <p className="text-xs font-bold text-red-650">{vehError}</p>}

                      <form onSubmit={handleCreateVehicle} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">Tên xe / Model *</label>
                          <input
                            type="text"
                            placeholder="VD: Toyota Camry 2.5Q"
                            value={newVehName}
                            onChange={(e) => setNewVehName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-royal-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">Biển kiểm soát *</label>
                          <input
                            type="text"
                            placeholder="VD: 30K-123.45"
                            value={newVehPlate}
                            onChange={(e) => setNewVehPlate(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-royal-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Loại truyền động (Tuỳ chọn)</label>
                          <select
                            value={newVehType}
                            onChange={(e) => setNewVehType(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer text-slate-800"
                          >
                            <option value="Xăng">Moteur Xăng</option>
                            <option value="Dầu">Moteur Diesel</option>
                            <option value="Điện">Động cơ Điện</option>
                            <option value="Bán tải">Bán tải Thể thao</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Số KM Odometer hiện hành (Tuỳ chọn)</label>
                          <input
                            type="number"
                            placeholder="Mặc định: 0"
                            value={newVehOdo}
                            onChange={(e) => setNewVehOdo(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Định mức tiêu hao / 100km (Tuỳ chọn)</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Mặc định: 7.5L"
                            value={newVehConsumption}
                            onChange={(e) => setNewVehConsumption(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Khoảng cách mốc thay nhớt (Tuỳ chọn)</label>
                          <input
                            type="number"
                            placeholder="Mặc định: 5000 km"
                            value={newVehInterval}
                            onChange={(e) => setNewVehInterval(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Năm sản xuất (Tuỳ chọn)</label>
                          <input
                            type="number"
                            placeholder="Mặc định: 2024"
                            value={newVehYear}
                            onChange={(e) => setNewVehYear(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Hạn dán bảo hiểm xe (Tuỳ chọn)</label>
                          <input
                            type="text"
                            placeholder="VD: 31/12/2026"
                            value={newVehInsurance}
                            onChange={(e) => setNewVehInsurance(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                          />
                        </div>

                        <div className="md:col-span-2 pt-2 border-t border-slate-50 flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setShowAddVehicleModal(false)}
                            className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-royal-600 hover:bg-royal-700 text-white font-extrabold rounded-lg cursor-pointer"
                          >
                            Đăng kiểm xe
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Form 2: EDIT Vehicle Form (Inline overlay) */}
                  {editingVehicle && (
                    <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow space-y-4 max-w-2xl animate-slideDown">
                      <div className="flex justify-between items-center border-b border-amber-100 pb-2">
                        <h4 className="font-bold text-xs text-royal-950 uppercase tracking-wider flex items-center">
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          <span>Hiệu chỉnh thông tin xe: {editingVehicle.name}</span>
                        </h4>
                        <button onClick={() => setEditingVehicle(null)} className="text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕ Đóng</button>
                      </div>

                      <p className="text-[10px] text-amber-850">Lưu ý: Bạn có thể cập nhật các trường kỹ thuật. Để trống các trường không bắt buộc.</p>

                      <form onSubmit={handleUpdateVehicle} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                        <div>
                          <label className="block text-[10px] uppercase font-black text-slate-505 mb-1 text-slate-605">Tên xe / Model *</label>
                          <input
                            type="text"
                            value={editingVehicle.name}
                            onChange={(e) => setEditingVehicle({ ...editingVehicle, name: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-slate-800"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-black text-slate-505 mb-1 text-slate-605">Biển số xe *</label>
                          <input
                            type="text"
                            value={editingVehicle.plateNumber}
                            onChange={(e) => setEditingVehicle({ ...editingVehicle, plateNumber: e.target.value.toUpperCase() })}
                            className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-slate-800"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase text-slate-400 mb-1">Số Odometer hiện hành (km)</label>
                          <input
                            type="number"
                            value={editingVehicle.odometer}
                            onChange={(e) => setEditingVehicle({ ...editingVehicle, odometer: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg font-mono text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase text-slate-400 mb-1">Mốc bảo dưỡng dầu nhớt tiếp theo (km)</label>
                          <input
                            type="number"
                            value={editingVehicle.oilChangeInterval}
                            onChange={(e) => setEditingVehicle({ ...editingVehicle, oilChangeInterval: parseInt(e.target.value) || 5000 })}
                            className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg font-mono text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase text-slate-400 mb-1">Tiêu hao dặm trung bình / 100km</label>
                          <input
                            type="number"
                            step="0.1"
                            value={editingVehicle.averageConsumption}
                            onChange={(e) => setEditingVehicle({ ...editingVehicle, averageConsumption: parseFloat(e.target.value) || 7.5 })}
                            className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg font-mono text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase text-slate-400 mb-1">Hạn hết dịch bảo hiểm</label>
                          <input
                            type="text"
                            value={editingVehicle.insuranceExpiry}
                            onChange={(e) => setEditingVehicle({ ...editingVehicle, insuranceExpiry: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-slate-800"
                          />
                        </div>

                        <div className="md:col-span-2 pt-3 border-t border-amber-200/50 flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setEditingVehicle(null)}
                            className="px-4 py-2 bg-slate-250 text-slate-700 font-bold rounded-lg cursor-pointer text-xs"
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg cursor-pointer text-xs"
                          >
                            Cập nhật xe
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Fleet Cards Registry */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {vehicles.map((cg) => (
                      <VehicleCard 
                        key={cg.id}
                        vehicle={cg}
                        onSelectTrip={handleShortcutTrip}
                        onSelectFuel={handleShortcutFuel}
                        onSelectMaint={handleShortcutMaint}
                        onEdit={(veh) => {
                          setEditingVehicle(veh);
                          // Scroll to top or form position
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        onDelete={handleDeleteVehicle}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: TRIP MILEAGE HISTORY LOG (Sổ Lộ Trình) */}
              {activeTab === "history" && (
                <div className="space-y-8 animate-fadeIn" id="history-view">
                  <TripHistoryList 
                    trips={trips} 
                    loading={loading} 
                    onDeleteTrip={handleDeleteTrip}
                    onDeleteAllTrips={handleDeleteAllTrips}
                  />
                </div>
              )}

              {/* TAB 5: AI CHAT ASSISTANT */}
              {activeTab === "ai-assistant" && (
                <div className="space-y-6">
                  <AiChatAssistant />
                </div>
              )}

              {/* TAB 6: FUELS & CARE TIMELINE */}
              {activeTab === "health-tips" && (
                <div className="space-y-8">
                  <FuelMaintenanceTracker 
                    fuels={fuels}
                    maintenances={maintenances}
                    vehicles={vehicles}
                    onAddFuel={handleAddFuelLog}
                    onAddMaint={handleAddMaintLog}
                    onDeleteFuel={handleDeleteFuel}
                    onDeleteAllFuels={handleDeleteAllFuels}
                    onDeleteMaint={handleDeleteMaint}
                    onDeleteAllMaints={handleDeleteAllMaints}
                  />
                </div>
              )}

              {/* NEW TAB 7: DRIVERS DIRECTORY (Nhân Viên Lái Xe) */}
              {activeTab === "drivers" && (
                <div className="space-y-6 animate-fadeIn text-left">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="font-display text-2xl font-black mt-1 tracking-tight text-royal-950">
                        Danh Sách Nhân Viên Lái Xe
                      </h2>
                      <p className="text-xs text-royal-500 font-sans mt-0.5">
                        Quản lý định danh tài xế vận hành, mốc số điện thoại liên lạc, thông tin hạng giấy phép lái xe ô tô.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingDriver(null);
                        setDrvName("");
                        setDrvPhone("");
                        setDrvLicense("");
                        setShowAddDriverForm(!showAddDriverForm);
                      }}
                      className="px-5 py-2.5 bg-royal-600 hover:bg-royal-700 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-sm flex items-center space-x-1.5 border border-royal-700"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm lái xe mới</span>
                    </button>
                  </div>

                  {/* Form add / edit driver overlay */}
                  {showAddDriverForm && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow space-y-4 max-w-xl animate-slideDown">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <h4 className="font-black text-xs text-royal-950 uppercase tracking-wider">
                          {editingDriver ? "Hiệu Chỉnh Hồ Sơ Tài Xế" : "Khai Báo Lái Xe Công Vụ"}
                        </h4>
                        <button onClick={() => setShowAddDriverForm(false)} className="text-xs text-slate-400 font-bold hover:text-slate-600 cursor-pointer">✕ Đóng</button>
                      </div>

                      {drvError && <p className="text-xs font-bold text-red-650">{drvError}</p>}

                      <form onSubmit={handleDriverSubmit} className="space-y-4 text-xs font-medium">
                        <div>
                          <label className="block text-[10px] uppercase font-black text-slate-500 mb-1">Họ và Tên Tài Xế *</label>
                          <input
                            type="text"
                            placeholder="VD: Nguyễn Văn A"
                            value={drvName}
                            onChange={(e) => setDrvName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-405 mb-1 text-slate-400">Số Điện Thoại (Tuỳ chọn)</label>
                            <input
                              type="tel"
                              placeholder="VD: 0912345678"
                              value={drvPhone}
                              onChange={(e) => setDrvPhone(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-405 mb-1 text-slate-400">GPLX / Hạng Bằng Lái (Tuỳ chọn)</label>
                            <input
                              type="text"
                              placeholder="VD: B2 GD781293"
                              value={drvLicense}
                              onChange={(e) => setDrvLicense(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                            />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setShowAddDriverForm(false)}
                            className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-royal-600 text-white font-extrabold rounded-lg cursor-pointer"
                          >
                            {editingDriver ? "Cập nhật tài xế" : "Lưu hồ sơ"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Table lists of active drivers */}
                  {drivers.length === 0 ? (
                    <div className="p-16 border-2 border-dashed border-slate-100 bg-white rounded-2xl text-center text-xs text-slate-400 select-none">
                      Chưa có hồ sơ nhân viên lái xe nào trên hệ thống. Ấn nút trên để thêm mới!
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                      <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
                        <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                          <tr>
                            <th className="px-5 py-4">Họ và Tên</th>
                            <th className="px-5 py-4">Số Điện Thoại</th>
                            <th className="px-5 py-4">Hạng / Số Bằng Lái</th>
                            <th className="px-5 py-4 text-center">Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {drivers.map((driver) => (
                            <tr key={driver.id} className="hover:bg-slate-50/50">
                              <td className="px-5 py-4 font-bold text-slate-900 flex items-center space-x-2">
                                <div className="p-1.5 bg-royal-50 rounded-full text-slate-500">
                                  <User className="w-4 h-4" />
                                </div>
                                <span>{driver.name}</span>
                              </td>
                              <td className="px-5 py-4 text-slate-650 font-mono">
                                {driver.phoneNumber || <span className="text-slate-300">Chuẩn bị bổ sung</span>}
                              </td>
                              <td className="px-5 py-4">
                                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-extrabold rounded">
                                  {driver.licenseNumber || "Hạng B2 (Tiêu chuẩn)"}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <div className="inline-flex space-x-2">
                                  <button
                                    onClick={() => startEditDriver(driver)}
                                    className="p-1 px-2.5 hover:bg-slate-100 text-slate-500 hover:text-royal-650 rounded-lg transition-colors cursor-pointer"
                                    title="Hiệu chỉnh"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDriver(driver.id)}
                                    className="p-1 px-2.5 hover:bg-red-50 text-slate-400 hover:text-red-650 rounded-lg transition-colors cursor-pointer"
                                    title="Xóa tài xế"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              )}

              {/* NEW TAB 8: DEPARTMENTS DIRECTORY (Phòng Ban Đặt Xe) */}
              {activeTab === "departments" && (
                <div className="space-y-6 animate-fadeIn text-left">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="font-display text-2xl font-black mt-1 tracking-tight text-royal-950">
                        Danh Mục Phòng Ban / Đơn Vị Đặt Xe
                      </h2>
                      <p className="text-xs text-royal-500 font-sans mt-0.5">
                        Quản lý cơ cấu phòng ban, cá nhân uỷ quyền liên hệ đại diện đặt xe, số mốc điện thoại văn phòng công vụ.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingDept(null);
                        setDeptNameState("");
                        setDeptContact("");
                        setDeptPhone("");
                        setShowAddDeptForm(!showAddDeptForm);
                      }}
                      className="px-5 py-2.5 bg-royal-600 hover:bg-royal-700 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-sm flex items-center space-x-1.5 border border-royal-700"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm phòng ban mới</span>
                    </button>
                  </div>

                  {/* Form add / edit department overlay */}
                  {showAddDeptForm && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow space-y-4 max-w-xl animate-slideDown">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <h4 className="font-black text-xs text-royal-950 uppercase tracking-wider">
                          {editingDept ? "Hiệu Chỉnh Phòng Ban Đặt Xe" : "Khai Báo Đơn Vị Công Tác Mới"}
                        </h4>
                        <button onClick={() => setShowAddDeptForm(false)} className="text-xs text-slate-400 font-bold hover:text-slate-600 cursor-pointer">✕ Đóng</button>
                      </div>

                      {deptError && <p className="text-xs font-bold text-red-650">{deptError}</p>}

                      <form onSubmit={handleDeptSubmit} className="space-y-4 text-xs font-medium">
                        <div>
                          <label className="block text-[10px] uppercase font-black text-slate-505 mb-1">Tên Phòng Ban / Đơn Vị Đặt Xe *</label>
                          <input
                            type="text"
                            placeholder="VD: Phòng Hành chính nhân sự"
                            value={deptNameState}
                            onChange={(e) => setDeptNameState(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Người Đại Diện Liên Hệ (Tuỳ chọn)</label>
                            <input
                              type="text"
                              placeholder="VD: Bà Trần Thị B"
                              value={deptContact}
                              onChange={(e) => setDeptContact(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Số Hotline Liên Hệ (Tuỳ chọn)</label>
                            <input
                              type="text"
                              placeholder="VD: 024-3388-9999"
                              value={deptPhone}
                              onChange={(e) => setDeptPhone(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                            />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setShowAddDeptForm(false)}
                            className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-royal-600 text-white font-extrabold rounded-lg cursor-pointer"
                          >
                            {editingDept ? "Cập nhật phòng ban" : "Lưu thông tin"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Table lists of active departments */}
                  {departments.length === 0 ? (
                    <div className="p-16 border-2 border-dashed border-slate-105 bg-white rounded-2xl text-center text-xs text-slate-400 select-none">
                      Chưa có danh mục phòng ban nào được tạo lập đặt xe. Ấn nút trên để cấu hình mới!
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                      <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
                        <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                          <tr>
                            <th className="px-5 py-4">Tên Phòng Ban / Đơn Vị</th>
                            <th className="px-5 py-4">Người Đại Diện</th>
                            <th className="px-5 py-4">Số Điện Thoại Nội Bộ</th>
                            <th className="px-5 py-4 text-center">Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {departments.map((dept) => (
                            <tr key={dept.id} className="hover:bg-slate-50/50">
                              <td className="px-5 py-4 font-bold text-royal-950 flex items-center space-x-2">
                                <div className="p-1.5 bg-royal-50 rounded-full text-royal-650">
                                  <Building className="w-4 h-4" />
                                </div>
                                <span className="font-extrabold">{dept.name}</span>
                              </td>
                              <td className="px-5 py-4 font-semibold text-slate-700">
                                {dept.contactPerson || <span className="text-slate-350 font-normal italic">Chưa giao quyền</span>}
                              </td>
                              <td className="px-5 py-4 text-slate-650 font-mono">
                                {dept.phoneNumber || <span className="text-slate-300">Hỗ trợ hotline tổng</span>}
                              </td>
                              <td className="px-5 py-4 text-center">
                                <div className="inline-flex space-x-2">
                                  <button
                                    onClick={() => startEditDept(dept)}
                                    className="p-1 px-2.5 hover:bg-slate-100 text-slate-500 hover:text-royal-650 rounded-lg transition-colors cursor-pointer"
                                    title="Hiệu chỉnh"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDept(dept.id)}
                                    className="p-1 px-2.5 hover:bg-red-50 text-slate-400 hover:text-red-650 rounded-lg transition-colors cursor-pointer"
                                    title="Xóa phòng ban"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              )}

            </>
          )}

        </main>

        {/* Footer section */}
        <footer className="bg-royal-950 text-royal-200 border-t border-royal-900 mt-16 py-10" id="royal-footer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-royal-650 text-white rounded-lg">
                  <Car className="w-5 h-5 fill-white/10 stroke-white" />
                </div>
                <span className="font-display font-medium text-lg text-white">ROYALAUTO FLEET VIỆT NAM</span>
              </div>
              <p className="text-xs text-royal-400 leading-relaxed font-sans">
                Hệ thống tối ưu chỉ số odometer, quản trị xăng xe dặm dài chuyên nghiệp chuẩn đồng bộ đám mây cho doanh nghiệp.
              </p>
            </div>

            <div className="text-xs space-y-2">
              <p className="font-bold text-white uppercase tracking-wider text-[10px]">Trụ Sở Trung Tâm Điều Hành</p>
              <p className="text-royal-400">📍 Toà nhà Royal Auto Plaza, Khu Đô Thị Mới Phú Mỹ Hưng, Quận 7, TP. Hồ Chí Minh.</p>
              <p className="text-royal-400">📞 Hỗ trợ trực tiếp: 1900-1009 | Email: contact@royalauto.vn</p>
            </div>

            <div className="text-xs space-y-3">
              <p className="font-bold text-white uppercase tracking-wider text-[10px]">Đặc Quyền Đồng Bộ</p>
              <div className="flex space-x-1.5 font-sans">
                <span className="px-2.5 py-1 bg-royal-900 border border-royal-800 text-[10px] rounded font-bold text-yellow-500">✓ CHỨNG CHỈ QUẢN LÝ ISO 27001</span>
                <span className="px-2.5 py-1 bg-royal-900 border border-royal-800 text-[10px] rounded font-bold text-yellow-500">✓ ĐỒNG BỘ CLOUD</span>
              </div>
              <p className="text-[10px] text-royal-500 font-mono">© 2026 RoyalAuto. All vehicle tracking modules are cryptographically verified.</p>
            </div>

          </div>
        </footer>

      </div>

    </div>
  );
}
