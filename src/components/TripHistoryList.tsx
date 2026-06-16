import React, { useState } from "react";
import { TripLog } from "../types";
import { Search, MapPin, Compass, Landmark, User, FileSpreadsheet, Trash2 } from "lucide-react";

interface TripHistoryListProps {
  trips: TripLog[];
  loading?: boolean;
  onDeleteTrip?: (id: string) => void;
  onDeleteAllTrips?: () => void;
}

export default function TripHistoryList({ trips, loading, onDeleteTrip, onDeleteAllTrips }: TripHistoryListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPurpose, setFilterPurpose] = useState("");

  // Filtering criteria
  const filteredTrips = trips.filter(trip => {
    const matchesSearch = 
      trip.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      trip.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.startingPoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPurpose = filterPurpose === "" || trip.purpose === filterPurpose;

    return matchesSearch && matchesPurpose;
  });

  // Calculate sum metric properties
  const totalKm = filteredTrips.reduce((acc, t) => acc + t.distance, 0);
  const totalToll = filteredTrips.reduce((acc, t) => acc + t.tollFee, 0);

  return (
    <div className="bg-white border border-royal-105 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn" id="trip-history-root">
      
      {/* Header filter options */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-royal-55 pb-5">
        <div>
          <h3 className="font-display font-medium text-lg text-royal-950 flex items-center space-x-2">
            <span className="p-1 bg-royal-100 text-royal-650 rounded-lg">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
            <span>Nhật Ký Hành Trình Chuyến Đi ({filteredTrips.length})</span>
          </h3>
          <p className="text-[11px] text-royal-400 mt-0.5 select-none">
            Danh sách lưu giữ mốc số km hành trình dặm xe cơ quan và cá nhân phục vụ tính toán hao phí công tác.
          </p>
        </div>

        {/* Search controls + Delete Action */}
        <div className="w-full md:w-auto flex flex-wrap gap-2 pt-1 md:pt-0 items-center">
          {onDeleteAllTrips && trips.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Bạn có chắc chắn muốn XÓA TẤT CẢ lộ trình chuyến đi trong hệ thống?")) {
                  onDeleteAllTrips();
                }
              }}
              className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs rounded-xl cursor-pointer transition flex items-center space-x-1.5 border border-red-200 select-none shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa tất cả</span>
            </button>
          )}

          <div className="relative flex-1 md:w-64 min-w-[170px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo xe, biển số, tài xế..."
              className="w-full pl-9 pr-4 py-2.5 bg-royal-50/50 border border-royal-200 rounded-xl text-xs focus:outline-none focus:border-royal-500"
            />
          </div>

          <div className="relative">
            <select
              value={filterPurpose}
              onChange={(e) => setFilterPurpose(e.target.value)}
              className="px-4 py-2.5 bg-royal-50/50 border border-royal-200 rounded-xl text-xs font-semibold focus:outline-none select-none cursor-pointer"
            >
              <option value="">-- Tất cả mục đích --</option>
              <option value="Công tác">Công tác</option>
              <option value="Đưa đón Sếp">Đưa đón Sếp</option>
              <option value="Giao hàng">Giao hàng</option>
              <option value="Ngoại giao">Ngoại giao</option>
              <option value="Cá nhân">Cá nhân</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI counters filtered summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-1 select-none">
        <div className="bg-royal-50/50 p-4 rounded-2xl border border-royal-100">
          <p className="text-[9px] font-bold text-royal-500 uppercase">Tổng số chuyến lọc</p>
          <p className="text-xl font-black text-royal-950 font-mono mt-1">{filteredTrips.length} chuyến</p>
        </div>
        
        <div className="bg-royal-50/50 p-4 rounded-2xl border border-royal-100">
          <p className="text-[9px] font-bold text-royal-500 uppercase">Tổng hành trình di chuyển</p>
          <p className="text-xl font-black text-royal-950 font-mono mt-1">+{totalKm.toLocaleString("vi-VN")} km</p>
        </div>

        <div className="bg-royal-50/50 p-4 rounded-2xl border border-royal-100">
          <p className="text-[9px] font-bold text-royal-500 uppercase">Tổng phí cầu đường</p>
          <p className="text-xl font-black text-emerald-800 font-mono mt-1">{totalToll.toLocaleString("vi-VN")}đ</p>
        </div>

        <div className="bg-royal-50/50 p-4 rounded-2xl border border-royal-100">
          <p className="text-[9px] font-bold text-royal-500 uppercase">Hao phí xăng ước tính</p>
          <p className="text-xl font-black text-orange-800 font-mono mt-1">
            ~{Math.round(totalKm * 0.08 * 22850).toLocaleString("vi-VN")}đ
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500 font-medium">
          <span className="inline-block animate-spin mr-2 border-2 border-slate-300 border-t-royal-650 w-5 h-5 rounded-full" />
          Đang tải dữ liệu số km...
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="p-16 border-2 border-dashed border-royal-100 rounded-2xl text-center text-xs text-royal-400 select-none">
          Không tìm thấy sổ lộ trình đi phù hợp với từ khóa lọc của bạn.
        </div>
      ) : (
        /* Responsive Table list */
        <div className="overflow-x-auto rounded-xl border border-slate-100 min-h-[300px]">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/70 text-[10px] text-slate-500 uppercase font-black tracking-wider">
              <tr>
                <th className="px-5 py-4 text-left">Phương Tiện</th>
                <th className="px-5 py-4 text-left">Tài Xế</th>
                <th className="px-5 py-4 text-center">Hành Trình Odo</th>
                <th className="px-5 py-4 text-center">Quãng Đường</th>
                <th className="px-5 py-4 text-left">Địa Điểm Đi & Đến</th>
                <th className="px-5 py-4 text-right">Chi phí cầu</th>
                <th className="px-5 py-4 text-left">Ghi chú</th>
                {onDeleteTrip && <th className="px-5 py-4 text-center">Xóa</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs text-slate-700 bg-white">
              {filteredTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors" id={`trip-row-${trip.id}`}>
                  
                  {/* Vehicle column */}
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-bold text-royal-950">{trip.vehicleName}</p>
                      <p className="font-mono text-[10px] font-black text-slate-500 mt-0.5">{trip.vehiclePlate}</p>
                    </div>
                  </td>

                  {/* Driver Column */}
                  <td className="px-5 py-4 font-semibold text-slate-800">
                    <div className="flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{trip.driverName}</span>
                    </div>
                  </td>

                  {/* Trip Odometer Column */}
                  <td className="px-5 py-4 text-center font-mono">
                    <div className="inline-flex items-center space-x-1 bg-slate-100 px-2 py-1 rounded text-[10px] text-slate-600">
                      <span>{trip.startingOdo.toLocaleString()}</span>
                      <span>→</span>
                      <span className="font-extrabold text-slate-800">{trip.endingOdo.toLocaleString()}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1">{trip.date}</p>
                  </td>

                  {/* Distance Column */}
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center space-x-0.5 px-2.5 py-0.5 bg-royal-100 text-royal-800 text-[10px] font-black rounded-full border border-royal-155">
                      <Compass className="w-3 h-3 text-royal-600 mr-0.5" />
                      +{trip.distance} km
                    </span>
                    <span className="block text-[8px] uppercase tracking-wide font-extrabold text-amber-600 bg-amber-50 px-1 py-0.5 rounded border border-amber-100 mt-1 max-w-[80px] mx-auto truncate text-center select-none">
                      {trip.purpose}
                    </span>
                  </td>

                  {/* Location endpoints */}
                  <td className="px-5 py-4 max-w-[200px]">
                    <div className="space-y-1">
                      <div className="flex items-center text-[10.5px] text-slate-600">
                        <MapPin className="w-3 h-3 text-red-500 mr-1 shrink-0" />
                        <span className="truncate">{trip.startingPoint}</span>
                      </div>
                      <div className="flex items-center text-[10.5px] text-slate-800 font-bold">
                        <MapPin className="w-3 h-3 text-emerald-500 mr-1 shrink-0" />
                        <span className="truncate">{trip.destination}</span>
                      </div>
                    </div>
                  </td>

                  {/* Costs */}
                  <td className="px-5 py-4 text-right font-mono font-bold text-emerald-700">
                    {trip.tollFee > 0 ? (
                      <span className="flex items-center justify-end text-[11px]">
                        <Landmark className="w-3 h-3 mr-0.5 text-emerald-500" />
                        {trip.tollFee.toLocaleString("vi-VN")}đ
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">0đ</span>
                    )}
                  </td>

                  {/* Notes */}
                  <td className="px-5 py-4 text-slate-500 text-[11px] max-w-[200px] truncate" title={trip.notes}>
                    {trip.notes || <span className="text-slate-350 italic">Không có ghi chú</span>}
                  </td>

                  {onDeleteTrip && (
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm("Bạn có chắc chắn muốn xóa lộ trình này?")) {
                            onDeleteTrip(trip.id);
                          }
                        }}
                        className="p-1 px-2 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded transition cursor-pointer"
                        title="Xóa lộ trình"
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
  );
}
