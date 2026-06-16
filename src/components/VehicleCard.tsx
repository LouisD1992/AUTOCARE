import React from "react";
import { Vehicle } from "../types";
import { Gauge, Wrench, Edit2, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";

interface VehicleCardProps {
  key?: any;
  vehicle: Vehicle;
  onSelectTrip?: (vehicle: Vehicle) => void;
  onSelectFuel?: (vehicle: Vehicle) => void;
  onSelectMaint?: (vehicle: Vehicle) => void;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
}

export default function VehicleCard({ 
  vehicle, 
  onSelectTrip, 
  onSelectFuel, 
  onSelectMaint,
  onEdit,
  onDelete 
}: VehicleCardProps) {
  const kmSinceLastMaint = vehicle.odometer - vehicle.lastMaintenanceOdo;
  const isOverdue = kmSinceLastMaint >= vehicle.oilChangeInterval;
  const isApproaching = !isOverdue && (vehicle.oilChangeInterval - kmSinceLastMaint) <= 1000;

  let alertBadge = null;
  if (isOverdue) {
    alertBadge = (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-red-100 text-red-800 text-[10px] font-extrabold rounded-md border border-red-200 animate-pulse">
        <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
        <span>Quá hạn ({kmSinceLastMaint - vehicle.oilChangeInterval} km)</span>
      </span>
    );
  } else if (isApproaching) {
    alertBadge = (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-md border border-amber-200">
        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
        <span>Sắp đến hạn ({vehicle.oilChangeInterval - kmSinceLastMaint} km)</span>
      </span>
    );
  } else {
    alertBadge = (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-green-100 text-green-800 text-[10px] font-extrabold rounded-md border border-green-200">
        <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" />
        <span>Tình trạng tốt ({vehicle.oilChangeInterval - kmSinceLastMaint} km nữa)</span>
      </span>
    );
  }

  return (
    <div className="bg-white border hover:border-royal-400 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between space-y-4" id={`vehicle-card-${vehicle.id}`}>
      <div className="space-y-3">
        {/* Header: Name, Plate & Edit/Delete buttons */}
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-display font-bold text-base text-royal-950 truncate max-w-[150px]" title={vehicle.name}>
              {vehicle.name}
            </h3>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-royal-100 border border-royal-200 text-royal-955 font-mono font-extrabold text-xs rounded">
              {vehicle.plateNumber}
            </span>
          </div>
          <div className="flex items-center space-x-1 shrink-0">
            {onEdit && (
              <button 
                onClick={() => onEdit(vehicle)}
                className="p-1 px-1.5 hover:bg-slate-100 text-slate-500 hover:text-royal-650 rounded-lg transition cursor-pointer"
                title="Chỉnh sửa xe"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(vehicle)}
                className="p-1 px-1.5 hover:bg-red-50 text-slate-400 hover:text-red-650 rounded-lg transition cursor-pointer"
                title="Xoá xe"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Section: Odometer and Maintenance Only */}
        <div className="space-y-2.5 pt-2 border-t border-slate-50">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs">Odometer:</span>
            <span className="font-mono text-xs font-black text-slate-800">{vehicle.odometer.toLocaleString("vi-VN")} km</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs text-left">Hạn bảo dưỡng:</span>
            <div className="text-right">
              {alertBadge}
            </div>
          </div>
        </div>
      </div>

      {/* Mini CTA footer utilities */}
      <div className="pt-3 border-t border-slate-50 flex items-center justify-between gap-1.5 shrink-0">
        {onSelectTrip && (
          <button
            onClick={() => onSelectTrip(vehicle)}
            className="flex-1 py-1.5 bg-royal-600 hover:bg-royal-700 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer text-center select-none"
          >
            + Chuyến đi
          </button>
        )}
        {onSelectFuel && (
          <button
            onClick={() => onSelectFuel(vehicle)}
            className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[10px] rounded-lg transition-colors border border-slate-200 cursor-pointer text-center select-none"
          >
            + Xăng dầu
          </button>
        )}
        {onSelectMaint && (
          <button
            onClick={() => onSelectMaint(vehicle)}
            className="flex-1 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-900 font-bold text-[10px] rounded-lg transition-colors border border-orange-200 cursor-pointer text-center select-none"
          >
            + Phanh/Dầu
          </button>
        )}
      </div>
    </div>
  );
}
