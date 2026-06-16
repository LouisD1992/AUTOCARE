import React, { useState, useEffect } from "react";
import { Vehicle, Driver, Department } from "../types";
import { Gauge, Compass, MapPin, Landmark, PenTool, CheckCircle2, AlertCircle, User, Building } from "lucide-react";

interface TripLoggerFormProps {
  initialVehicle?: Vehicle | null;
  vehiclesList: Vehicle[];
  driversList: Driver[];
  departmentsList: Department[];
  onSuccess: (newTrip: any) => void;
  onCancel?: () => void;
}

export default function TripLoggerForm({ 
  initialVehicle, 
  vehiclesList, 
  driversList = [], 
  departmentsList = [], 
  onSuccess, 
  onCancel 
}: TripLoggerFormProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicle?.id || "");
  const [driverName, setDriverName] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startingOdo, setStartingOdo] = useState<number>(0);
  const [endingOdo, setEndingOdo] = useState<number>(0);
  const [purpose, setPurpose] = useState<string>("Công tác");
  const [startingPoint, setStartingPoint] = useState("");
  const [destination, setDestination] = useState("");
  const [tollFee, setTollFee] = useState<number>(0);
  const [notes, setNotes] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Auto load vehicle starting odo when vehicle selection changes
  useEffect(() => {
    if (selectedVehicleId) {
      const match = vehiclesList.find(v => v.id === selectedVehicleId);
      if (match) {
        setStartingOdo(match.odometer);
        setEndingOdo(match.odometer + 10); // preset slightly ahead
      }
    }
  }, [selectedVehicleId, vehiclesList]);

  // Sync if initial vehicle provided
  useEffect(() => {
    if (initialVehicle) {
      setSelectedVehicleId(initialVehicle.id);
    } else if (vehiclesList.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehiclesList[0].id);
    }
  }, [initialVehicle, vehiclesList]);

  // If a driver is selected from dropdown, update driverName text field or vice versa
  useEffect(() => {
    if (selectedDriverId) {
      const matched = driversList.find(d => d.id === selectedDriverId);
      if (matched) {
        setDriverName(matched.name);
      }
    }
  }, [selectedDriverId, driversList]);

  const activeVehicle = vehiclesList.find(v => v.id === selectedVehicleId);
  const calculatedDistance = endingOdo > startingOdo ? endingOdo - startingOdo : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);

    // Validation checks
    if (!selectedVehicleId) {
      setErrorText("Vui lòng lựa chọn xe thực hiện chuyến đi.");
      return;
    }

    let finalDriverName = driverName;
    if (selectedDriverId) {
      const matched = driversList.find(d => d.id === selectedDriverId);
      if (matched) {
        finalDriverName = matched.name;
      }
    }

    if (!finalDriverName.trim()) {
      setErrorText("Vui lòng chọn hoặc nhập tên tài xế vận hành.");
      return;
    }

    if (endingOdo <= startingOdo) {
      setErrorText("Số KM kết thúc bắt buộc phải lớn hơn số KM bắt đầu hành trình.");
      return;
    }
    if (!startingPoint.trim() || !destination.trim()) {
      setErrorText("Vui lòng ghi nhận điểm đi và điểm đến.");
      return;
    }

    setIsSubmitting(true);

    // If department chosen, attach prefix to notes
    let finalNotes = notes;
    if (selectedDepartmentId) {
      const matchedDept = departmentsList.find(dept => dept.id === selectedDepartmentId);
      if (matchedDept) {
        finalNotes = `[${matchedDept.name}] ${notes}`;
      }
    }

    try {
      const payload = {
        vehicleId: selectedVehicleId,
        driverName: finalDriverName.trim(),
        date,
        startingOdo,
        endingOdo,
        purpose,
        startingPoint: startingPoint.trim(),
        destination: destination.trim(),
        tollFee,
        notes: finalNotes.trim()
      };

      const response = await fetch("/api/mileage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (data.success) {
        onSuccess(data.data);
      } else {
        setErrorText(data.error || "Gặp lỗi trong quá trình lưu hành trình.");
      }
    } catch (err) {
      console.error(err);
      setErrorText("Không thể lưu kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-royal-105 rounded-3xl p-6 md:p-8 shadow-sm max-w-3xl mx-auto animate-fadeIn" id="trip-logger-root">
      {/* Form Header */}
      <div className="border-b border-royal-55 pb-4 mb-6">
        <h2 className="font-display font-medium text-2xl text-royal-950 flex items-center space-x-2.5">
          <span className="p-1.5 bg-royal-100 text-royal-650 rounded-lg">
            <Gauge className="w-5 h-5" />
          </span>
          <span>Ghi Nhận Lộ Trình / Số KM Xe Ô Tô</span>
        </h2>
        <p className="text-xs text-royal-500 mt-1 select-none">
          Số liệu km kết thúc sẽ được tự động đồng bộ hóa làm mốc chỉ số hiện tại cho phương tiện, giúp cảnh báo bảo dưỡng dầu bôi trơn dặm xe.
        </p>
      </div>

      {errorText && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-center space-x-2.5 select-none" id="trip-form-error">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorText}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Vehicle & Driver Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-royal-750 uppercase tracking-wider mb-2">Chọn xe đăng ký chuyến đi *</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full px-4 py-3 bg-royal-50/50 border border-royal-200 rounded-xl text-xs focus:outline-none focus:border-royal-500 focus:bg-white transition-colors cursor-pointer text-slate-800"
              required
            >
              <option value="">-- Click để chọn xe --</option>
              {vehiclesList.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.plateNumber}) - ODO: {v.odometer.toLocaleString("vi-VN")} km
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-royal-750 uppercase tracking-wider mb-2 flex items-center">
              <User className="w-3.5 h-3.5 mr-1 text-slate-400" /> Chọn nhân viên lái xe *
            </label>
            {driversList.length > 0 ? (
              <div className="flex gap-2">
                <select
                  value={selectedDriverId}
                  onChange={(e) => {
                    setSelectedDriverId(e.target.value);
                    if (e.target.value === "other") {
                      setDriverName("");
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-royal-50/50 border border-royal-200 rounded-xl text-xs focus:outline-none focus:border-royal-500 focus:bg-white transition-colors cursor-pointer text-slate-800"
                >
                  <option value="">-- Chọn lái xe --</option>
                  {driversList.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.phoneNumber ? `(${d.phoneNumber})` : ''} ({d.licenseNumber || 'Có bằng'})
                    </option>
                  ))}
                  <option value="other">-- Nhập tên khác --</option>
                </select>
                {selectedDriverId === "other" && (
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Nhập tên lái xe..."
                    className="flex-1 px-4 py-3 bg-royal-50/50 border border-royal-200 rounded-xl text-xs focus:outline-none focus:border-royal-500 focus:bg-white transition-colors text-slate-800"
                    required
                  />
                )}
              </div>
            ) : (
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className="w-full px-4 py-3 bg-royal-50/50 border border-royal-200 rounded-xl text-xs focus:outline-none focus:border-royal-500 focus:bg-white transition-colors text-slate-800"
                required
              />
            )}
          </div>
        </div>

        {/* Row 2: Date & Booking Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-royal-750 uppercase tracking-wider mb-2">Ngày thực hiện chuyến đi *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-royal-50/50 border border-royal-200 rounded-xl text-xs focus:outline-none focus:border-royal-500 focus:bg-white transition-colors font-mono text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-royal-750 uppercase tracking-wider mb-2 flex items-center">
              <Building className="w-3.5 h-3.5 mr-1 text-slate-400" /> Phòng ban / Đơn vị đặt xe
            </label>
            <select
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              className="w-full px-4 py-3 bg-royal-50/50 border border-royal-200 rounded-xl text-xs focus:outline-none focus:border-royal-500 focus:bg-white transition-colors cursor-pointer text-slate-800"
            >
              <option value="">-- Để trống / Không yêu cầu --</option>
              {departmentsList.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Odometer readings */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
              <Gauge className="w-3.5 h-3.5 mr-1 text-slate-400" /> KM Bắt đầu *
            </label>
            <input
              type="number"
              value={startingOdo}
              onChange={(e) => setStartingOdo(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-royal-500 text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
              <Compass className="w-3.5 h-3.5 mr-1 text-slate-400" /> KM Kết thúc *
            </label>
            <input
              type="number"
              value={endingOdo}
              onChange={(e) => setEndingOdo(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-royal-500 text-slate-800"
              required
            />
          </div>

          <div className="text-center md:text-right pt-4 md:pt-0 select-none">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Quãng đường đã đi</span>
            <span className="text-2xl font-black text-royal-600 font-mono">
              +{calculatedDistance.toLocaleString("vi-VN")} <span className="text-xs">km</span>
            </span>
          </div>
        </div>

        {/* Row 4: Route Locations & Toll Fees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-royal-750 uppercase tracking-wider mb-2 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-royal-500" /> Điểm khởi hành *
            </label>
            <input
              type="text"
              value={startingPoint}
              onChange={(e) => setStartingPoint(e.target.value)}
              placeholder="VD: Văn phòng Cầu Giấy"
              className="w-full px-4 py-3 bg-royal-50/50 border border-royal-200 rounded-xl text-xs focus:outline-none focus:border-royal-500 focus:bg-white transition-colors text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-royal-750 uppercase tracking-wider mb-2 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-royal-500" /> Điểm kết thúc *
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="VD: Nhà máy Hưng Yên"
              className="w-full px-4 py-3 bg-royal-50/50 border border-royal-200 rounded-xl text-xs focus:outline-none focus:border-royal-500 focus:bg-white transition-colors text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-royal-750 uppercase tracking-wider mb-2 flex items-center">
              <Landmark className="w-3.5 h-3.5 mr-1 text-royal-500" /> Phí cầu đường (VNĐ)
            </label>
            <input
              type="number"
              step="5000"
              value={tollFee === 0 ? "" : tollFee}
              onChange={(e) => setTollFee(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="Mặc định: 0đ"
              className="w-full px-4 py-3 bg-royal-50/50 border border-royal-200 rounded-xl text-xs font-mono focus:outline-none focus:border-royal-500 focus:bg-white transition-colors text-slate-800"
            />
          </div>
        </div>

        {/* Purpose selector input */}
        <div>
          <label className="block text-xs font-bold text-royal-750 uppercase tracking-wider mb-2">Mục đích chuyến đi *</label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full px-4 py-3 bg-royal-50/50 border border-royal-200 rounded-xl text-xs focus:outline-none focus:border-royal-500 focus:bg-white transition-colors cursor-pointer text-slate-800"
            required
          >
            <option value="Công tác">Công tác</option>
            <option value="Đưa đón Sếp">Đưa đón Ban lãnh đạo</option>
            <option value="Giao hàng">Giao hàng / Chuyển khoản kho</option>
            <option value="Ngoại giao">Ngoại giao / Gặp đại lý</option>
            <option value="Cá nhân">Cá nhân</option>
          </select>
        </div>

        {/* Notes input */}
        <div>
          <label className="block text-xs font-bold text-royal-750 uppercase tracking-wider mb-2 flex items-center">
            <PenTool className="w-3.5 h-3.5 mr-1 text-royal-500" /> Ghi chú nội dung công việc chuyến đi
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Ghi nhận thành viên tham gia, trạng thái phương tiện hoặc phụ lục chi phí khẩn cấp dẹp đường kẹt xe..."
            className="w-full px-4 py-3 bg-royal-50/50 border border-royal-200 rounded-xl text-xs focus:outline-none focus:border-royal-500 focus:bg-white transition-colors text-slate-800"
          />
        </div>

        {/* CTA Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-royal-55 select-none">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition duration-200 cursor-pointer select-none"
            >
              Hủy bỏ
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-royal-600 hover:bg-royal-700 disabled:bg-royal-300 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-royal-650/10 cursor-pointer transition duration-200 flex items-center space-x-1.5"
          >
            {isSubmitting ? (
              <span>Đang đồng bộ...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Đồng bộ & Lưu Số KM</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
