import React, { useState } from "react";
import { FuelLog, MaintenanceLog, Vehicle } from "../types";
import { Fuel, Wrench, Plus, Landmark, AlertTriangle, CheckCircle2, BadgeAlert, Coins, Sparkles, MapPin, Trash2 } from "lucide-react";

interface FuelMaintenanceTrackerProps {
  fuels: FuelLog[];
  maintenances: MaintenanceLog[];
  vehicles: Vehicle[];
  onAddFuel: (payload: any) => Promise<boolean>;
  onAddMaint: (payload: any) => Promise<boolean>;
  onDeleteFuel?: (id: string) => void;
  onDeleteAllFuels?: () => void;
  onDeleteMaint?: (id: string) => void;
  onDeleteAllMaints?: () => void;
}

export default function FuelMaintenanceTracker({ 
  fuels, 
  maintenances, 
  vehicles, 
  onAddFuel, 
  onAddMaint,
  onDeleteFuel,
  onDeleteAllFuels,
  onDeleteMaint,
  onDeleteAllMaints
}: FuelMaintenanceTrackerProps) {
  const [activeSubTab, setActiveSubTab] = useState<"fuels" | "maintenances">("fuels");
  
  // Fuel state variables
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [fuelVehicleId, setFuelVehicleId] = useState("");
  const [fuelDate, setFuelDate] = useState(new Date().toISOString().split('T')[0]);
  const [fuelLiters, setFuelLiters] = useState("");
  const [fuelPrice, setFuelPrice] = useState("22850"); // Petrolimex RON 95-III default
  const [fuelOdometer, setFuelOdometer] = useState("");
  const [fuelStation, setFuelStation] = useState("Cửa hàng Petrolimex");
  const [fuelIsFull, setFuelIsFull] = useState(true);
  const [fuelError, setFuelError] = useState<string | null>(null);

  // Maintenance state variables
  const [showMaintForm, setShowMaintForm] = useState(false);
  const [maintVehicleId, setMaintVehicleId] = useState("");
  const [maintTitle, setMaintTitle] = useState("Bảo dưỡng cấp 1: Thay dầu nhớt động cơ & lọc nhớt");
  const [maintDate, setMaintDate] = useState(new Date().toISOString().split('T')[0]);
  const [maintOdom, setMaintOdom] = useState("");
  const [maintCost, setMaintCost] = useState("");
  const [maintGarage, setMaintGarage] = useState("");
  const [maintNotes, setMaintNotes] = useState("");
  const [maintStatus, setMaintStatus] = useState<"Đã hoàn thành" | "Sắp đến hạn" | "Cần thực hiện ngay">("Đã hoàn thành");
  const [maintError, setMaintError] = useState<string | null>(null);

  // Submit fuel
  const handleFuelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFuelError(null);

    if (!fuelVehicleId) {
      setFuelError("Vui lòng chọn xe đổ xăng.");
      return;
    }
    const liters = parseFloat(fuelLiters);
    if (isNaN(liters) || liters <= 0) {
      setFuelError("Số lít xăng nhập không hợp lệ.");
      return;
    }
    const price = parseInt(fuelPrice);
    if (isNaN(price) || price <= 0) {
      setFuelError("Đơn giá xăng không hợp lệ.");
      return;
    }

    const matchVehicle = vehicles.find(v => v.id === fuelVehicleId);
    const odo = fuelOdometer ? parseInt(fuelOdometer) : (matchVehicle?.odometer || 0);

    const payload = {
      vehicleId: fuelVehicleId,
      date: fuelDate,
      liters,
      pricePerLiter: price,
      odometer: odo,
      gasStation: fuelStation.trim(),
      isFullTank: fuelIsFull
    };

    const success = await onAddFuel(payload);
    if (success) {
      setShowFuelForm(false);
      setFuelLiters("");
      setFuelOdometer("");
    } else {
      setFuelError("Không thể lưu thông tin đổ xăng dằm. Vui lòng kiểm tra lại số liệu.");
    }
  };

  // Submit maintenance
  const handleMaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMaintError(null);

    if (!maintVehicleId) {
      setMaintError("Vui lòng chọn xe bảo dưỡng.");
      return;
    }
    if (!maintTitle.trim()) {
      setMaintError("Vui lòng nhập hạng mục bảo dưỡng.");
      return;
    }
    const cost = parseInt(maintCost);
    if (isNaN(cost) || cost < 0) {
      setMaintError("Chi phí phát sinh bảo dưỡng không hợp lệ.");
      return;
    }

    const matchVehicle = vehicles.find(v => v.id === maintVehicleId);
    const odo = maintOdom ? parseInt(maintOdom) : (matchVehicle?.odometer || 0);

    const payload = {
      vehicleId: maintVehicleId,
      title: maintTitle.trim(),
      date: maintDate,
      odometer: odo,
      cost,
      garage: maintGarage.trim() || "Garage ủy quyền chính hãng",
      notes: maintNotes.trim(),
      status: maintStatus
    };

    const success = await onAddMaint(payload);
    if (success) {
      setShowMaintForm(false);
      setMaintCost("");
      setMaintOdom("");
      setMaintNotes("");
      setMaintGarage("");
    } else {
      setMaintError("Lỗi hệ thống khi lưu lịch trình chăm sóc bảo dưỡng.");
    }
  };

  // Helper values for calculations
  const totalLiters = fuels.reduce((acc, f) => acc + f.liters, 0);
  const totalFuelCost = fuels.reduce((acc, f) => acc + f.totalAmount, 0);
  const totalMaintCost = maintenances.reduce((acc, m) => acc + m.cost, 0);

  return (
    <div className="bg-white border border-royal-105 rounded-3xl p-6 shadow-sm space-y-6" id="tracker-root-view">
      
      {/* Tab select head */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-royal-55 pb-4">
        <div className="flex space-x-1.5 p-1 bg-royal-50 rounded-xl border border-royal-100">
          <button
            onClick={() => setActiveSubTab("fuels")}
            className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center space-x-1.5 ${
              activeSubTab === "fuels" ? "bg-white text-royal-950 shadow" : "text-royal-550 hover:text-royal-950"
            }`}
          >
            <Fuel className="w-3.5 h-3.5 text-royal-650" />
            <span>Nhật ký Đổ xăng ({fuels.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab("maintenances")}
            className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center space-x-1.5 ${
              activeSubTab === "maintenances" ? "bg-white text-royal-950 shadow" : "text-royal-550 hover:text-royal-950"
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-orange-600" />
            <span>Lịch trình Bảo dưỡng ({maintenances.length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          {activeSubTab === "fuels" ? (
            <>
              {onDeleteAllFuels && fuels.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm("Cảnh báo: Bạn có chắc muốn XÓA TOÀN BỘ lịch sử phiếu nạp xăng dầu?")) {
                      onDeleteAllFuels();
                    }
                  }}
                  className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-[11px] rounded-lg cursor-pointer flex items-center space-x-1 border border-red-200 select-none animate-fadeIn"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  <span>Xóa tất cả</span>
                </button>
              )}
              <button
                onClick={() => { setShowFuelForm(!showFuelForm); setShowMaintForm(false); }}
                className="py-1.5 px-3 bg-royal-600 hover:bg-royal-700 text-white font-extrabold text-[11px] rounded-lg cursor-pointer flex items-center space-x-1 border border-royal-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ghi nhận Đổ xăng</span>
              </button>
            </>
          ) : (
            <>
              {onDeleteAllMaints && maintenances.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm("Cảnh báo: Bạn có chắc muốn XÓA TOÀN BỘ lịch trình sửa chữa bảo tài?")) {
                      onDeleteAllMaints();
                    }
                  }}
                  className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-[11px] rounded-lg cursor-pointer flex items-center space-x-1 border border-red-200 select-none animate-fadeIn"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  <span>Xóa tất cả</span>
                </button>
              )}
              <button
                onClick={() => { setShowMaintForm(!showMaintForm); setShowFuelForm(false); }}
                className="py-1.5 px-3 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[11px] rounded-lg cursor-pointer flex items-center space-x-1 border border-orange-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ghi nhận Bảo dưỡng</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* SUBTAB 1: OIL & FUELS EXPENSES */}
      {activeSubTab === "fuels" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-slate-100 p-2 select-none">
            <div className="bg-royal-50/50 p-4 rounded-xl border border-royal-100 flex items-center space-x-3">
              <div className="p-2 bg-royal-100 rounded-lg"><Fuel className="w-5 h-5 text-royal-700" /></div>
              <div>
                <p className="text-[9px] font-bold text-royal-500 uppercase">Tổng thể tích tiếp nhận</p>
                <p className="text-lg font-black text-royal-950 font-mono">{totalLiters.toLocaleString("vi-VN")} Lít</p>
              </div>
            </div>

            <div className="bg-royal-50/50 p-4 rounded-xl border border-royal-100 flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg"><Coins className="w-5 h-5 text-emerald-700" /></div>
              <div>
                <p className="text-[9px] font-bold text-royal-500 uppercase">Tổng chi phí xăng dầu</p>
                <p className="text-lg font-black text-royal-950 font-mono">{totalFuelCost.toLocaleString("vi-VN")} VNĐ</p>
              </div>
            </div>

            <div className="bg-royal-50/50 p-4 rounded-xl border border-royal-100 flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg"><Sparkles className="w-5 h-5 text-amber-750 animate-pulse" /></div>
              <div>
                <p className="text-[9px] font-bold text-royal-500 uppercase">Đơn giá RON 95 hiện hành</p>
                <p className="text-lg font-black text-royal-950 font-mono">~22.850 đ/L</p>
              </div>
            </div>
          </div>

          {/* Add Fuel form overlay */}
          {showFuelForm && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-slideDown">
              <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-1">
                <Fuel className="w-4 h-4 text-royal-650" />
                <span>Ghi Nhận Hóa Đơn Đổ Xăng</span>
              </h4>
              <p className="text-[10px] text-slate-500 mt-1">Đường dữ liệu sẽ được lưu tự động để cộng dồn hao phí tài chính hạm đội.</p>

              {fuelError && <p className="text-xs font-semibold text-red-700">{fuelError}</p>}
              
              <form onSubmit={handleFuelSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Chọn xe đổ xăng *</label>
                  <select
                    value={fuelVehicleId}
                    onChange={(e) => setFuelVehicleId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs cursor-pointer text-slate-800"
                    required
                  >
                    <option value="">-- Xe --</option>
                    {vehicles.filter(v => v.type !== "Điện").map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.plateNumber})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Số Lít Petrol *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    placeholder="VD: 45.5"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Mốc Odometer lúc đổ (km)</label>
                  <input
                    type="number"
                    value={fuelOdometer}
                    onChange={(e) => setFuelOdometer(e.target.value)}
                    placeholder="Để trống lấy mốc hiện tại"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Cửa hàng xăng dầu</label>
                  <input
                    type="text"
                    value={fuelStation}
                    onChange={(e) => setFuelStation(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Ngày đổ xăng</label>
                  <input
                    type="date"
                    value={fuelDate}
                    onChange={(e) => setFuelDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="isFull"
                    checked={fuelIsFull}
                    onChange={(e) => setFuelIsFull(e.target.checked)}
                    className="w-4 h-4 text-royal-600 rounded"
                  />
                  <label htmlFor="isFull" className="text-[11px] text-slate-700 font-bold select-none cursor-pointer">Đổ đầy bình xăng</label>
                </div>

                <div className="flex space-x-2 pt-4 justify-end md:col-span-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowFuelForm(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-royal-600 text-white font-extrabold text-[10px] rounded-lg cursor-pointer"
                  >
                    Lưu hóa đơn
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Fuels Table lists */}
          {fuels.length === 0 ? (
            <p className="text-center py-10 text-xs text-slate-400 select-none">Chưa có hóa đơn xăng dầu nào được đặt lưu dường.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
              <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Xe nhận xăng</th>
                    <th className="px-4 py-3">Ngày</th>
                    <th className="px-4 py-3">Odometer</th>
                    <th className="px-4 py-3 text-right">Thể tích đổ</th>
                    <th className="px-4 py-3 text-right">Tổng thanh toán (đ)</th>
                    <th className="px-4 py-3">Trạm xăng</th>
                    <th className="px-4 py-3">Bình xăng</th>
                    {onDeleteFuel && <th className="px-4 py-3 text-center">Hành động</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {fuels.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-bold text-slate-800">{item.vehicleName}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono">{item.date}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-700">{item.odometer.toLocaleString()} km</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">{item.liters} L</td>
                      <td className="px-4 py-3 text-right font-mono font-black text-emerald-800">{item.totalAmount.toLocaleString()}đ</td>
                      <td className="px-4 py-3 text-slate-600">
                        <span className="flex items-center text-slate-600 truncate max-w-[150px]">
                          <MapPin className="w-3 h-3 text-red-500 mr-0.5 shrink-0" />
                          {item.gasStation}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold ${item.isFullTank ? "bg-emerald-105 text-emerald-805" : "bg-slate-100 text-slate-600"}`}>
                          {item.isFullTank ? "Đầy bình" : "Đổ lẻ"}
                        </span>
                      </td>
                      {onDeleteFuel && (
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => {
                              if (confirm("Bạn có chắc chắn muốn xóa hóa đơn đổ xăng này?")) {
                                onDeleteFuel(item.id);
                              }
                            }}
                            className="p-1 px-2 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded transition cursor-pointer"
                            title="Xóa đổ xăng"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* SUBTAB 2: MAINTENANCE timeline */}
      {activeSubTab === "maintenances" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Statistics summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-slate-100 p-2 select-none">
            <div className="bg-royal-50/50 p-4 rounded-xl border border-royal-100 flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg"><Wrench className="w-5 h-5 text-orange-750" /></div>
              <div>
                <p className="text-[9px] font-bold text-royal-500 uppercase">Hạng mục bảo bảo trì cơ hạm đội</p>
                <p className="text-lg font-black text-royal-950 font-mono">{maintenances.length} Biên tự kiểm định</p>
              </div>
            </div>

            <div className="bg-royal-50/50 p-4 rounded-xl border border-royal-100 flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg"><Coins className="w-5 h-5 text-emerald-700" /></div>
              <div>
                <p className="text-[9px] font-bold text-royal-500 uppercase">Tổng chi phí hãm mốc sửa chữa</p>
                 <p className="text-lg font-black text-royal-950 font-mono">{totalMaintCost.toLocaleString("vi-VN")} VNĐ</p>
              </div>
            </div>
          </div>

          {/* Add maintenance overlay */}
          {showMaintForm && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-slideDown">
              <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-1">
                <Wrench className="w-4 h-4 text-orange-600" />
                <span>Ghi Nhận Bảo dưỡng / Thay thế thế phụ tùng</span>
              </h4>

              {maintError && <p className="text-xs font-semibold text-red-700">{maintError}</p>}
              
              <form onSubmit={handleMaintSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Chọn xe bảo dưỡng *</label>
                  <select
                    value={maintVehicleId}
                    onChange={(e) => setMaintVehicleId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs cursor-pointer text-slate-800"
                    required
                  >
                    <option value="">-- Xe --</option>
                    {vehicles.map(v => (
                       <option key={v.id} value={v.id}>{v.name} ({v.plateNumber})</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Hạng mục bảo dưỡng *</label>
                  <input
                    type="text"
                    value={maintTitle}
                    onChange={(e) => setMaintTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                    placeholder="VD: Thay dầu máy mốc 15.000km"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Số Odoo lúc bảo dưỡng (km)</label>
                  <input
                    type="number"
                    value={maintOdom}
                    onChange={(e) => setMaintOdom(e.target.value)}
                    placeholder="Mốc km bảo hành"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Chi phí (VNĐ) *</label>
                  <input
                    type="number"
                    step="1000"
                    value={maintCost}
                    onChange={(e) => setMaintCost(e.target.value)}
                    placeholder="VD: 550000"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Garage bảo dưỡng</label>
                  <input
                    type="text"
                    value={maintGarage}
                    onChange={(e) => setMaintGarage(e.target.value)}
                    placeholder="VD: Toyota Mỹ Đình"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Ngày bảo dưỡng</label>
                  <input
                    type="date"
                    value={maintDate}
                    onChange={(e) => setMaintDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Trạng thái bảo trì</label>
                  <select
                    value={maintStatus}
                    onChange={(e: any) => setMaintStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none cursor-pointer text-slate-800"
                    required
                  >
                    <option value="Đã hoàn thành">Đã hoàn thành</option>
                    <option value="Sắp đến hạn">Sắp đến hạn</option>
                    <option value="Cần thực hiện ngay">Cần thực hiện gấp</option>
                  </select>
                </div>

                <div className="md:col-span-4">
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5">Chi tiết ghi chú kỹ thuật</label>
                  <textarea
                    value={maintNotes}
                    onChange={(e) => setMaintNotes(e.target.value)}
                    rows={2}
                    placeholder="Lưu lại cấu hình bugi thay, nhớt hãng dặm phanh dộ dày bao nhiêu..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                  />
                </div>

                <div className="flex space-x-2 pt-4 justify-end md:col-span-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowMaintForm(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-600 text-white font-extrabold text-[10px] rounded-lg cursor-pointer"
                  >
                    Đồng bộ biên dạng
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Maintenance list feed */}
          {maintenances.length === 0 ? (
            <p className="text-center py-10 text-xs text-slate-400 select-none">Chưa ghi nhận sự kiện kiểm định bảo trì định kỳ nào của hạm đội.</p>
          ) : (
            <div className="space-y-4">
              {maintenances.map((m) => (
                <div key={m.id} className="p-4 border border-slate-100 rounded-2xl hover:border-royal-200 transition-colors bg-slate-50/40 flex flex-col md:flex-row justify-between gap-4 relative">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900">{m.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                        m.status === "Đã hoàn thành" ? "bg-green-150 text-green-805" :
                        m.status === "Sắp đến hạn" ? "bg-yellow-105 text-yellow-850" : "bg-red-105 text-red-805"
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <p className="text-[11px] font-bold text-royal-750 flex items-center">
                      <Sparkles className="w-3.5 h-3.5 text-royal-500 mr-1 shrink-0" />
                      <span>Xe: {m.vehicleName} tại mốc {m.odometer.toLocaleString()} km</span>
                    </p>

                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">{m.notes || "Kiểm tra định kỳ mốc dặm xe ô tô."}</p>

                    <div className="flex items-center text-[10.5px] text-slate-400 space-x-3 pt-1">
                      <span>📍 Địa điểm: <strong>{m.garage}</strong></span>
                      <span>•</span>
                      <span>📅 Ngày: <strong>{m.date}</strong></span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col justify-center items-end shrink-0">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Phí kiểm chi</span>
                    <span className="text-lg font-black text-orange-600 font-mono">{m.cost.toLocaleString("vi-VN")} đ</span>
                    
                    {onDeleteMaint && (
                      <button
                        onClick={() => {
                          if (confirm("Bạn có chắc chắn muốn xóa lịch trình bảo dưỡng này?")) {
                            onDeleteMaint(m.id);
                          }
                        }}
                        className="mt-2.5 p-1 px-2 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold rounded-lg transition-colors border border-red-200 cursor-pointer flex items-center space-x-1"
                        title="Xóa bảo dưỡng"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                        <span>Xóa</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
