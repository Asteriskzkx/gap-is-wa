import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
  Circle,
  Polygon,
  Rectangle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { GeoSearchControl } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";

// กำหนด types
type LatLngPosition = [number, number]; // [latitude, longitude]
type GeoJSONGeometry =
  | { type: "Point"; coordinates: [number, number] }
  | { type: "LineString"; coordinates: [number, number][] }
  | { type: "Polygon"; coordinates: [number, number][][] };

interface MapSelectorProps {
  location: GeoJSONGeometry;
  onChange: (location: GeoJSONGeometry) => void;
  height?: string;
}

// Component for the search control
const SearchField = () => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new (GeoSearchControl as any)({
      provider,
      style: "bar",
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      autoComplete: true,
      autoCompleteDelay: 250,
      keepResult: true,
      updateMap: true,
      searchLabel: "ค้นหาสถานที่หรือที่อยู่",
      position: "topright",
    });

    map.addControl(searchControl);

    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
};

// Component หลัก
const MapSelector: React.FC<MapSelectorProps> = ({
  location,
  onChange,
  height = "500px",
}) => {
  // ตำแหน่งเริ่มต้น (กรุงเทพฯ)
  const defaultPosition: LatLngPosition = [13.736717, 100.523186];

  // สถานะสำหรับเก็บประเภทที่เลือก
  const [shapeType, setShapeType] = useState<string>(location.type || "Point");

  // สถานะสำหรับจุด
  const [pointPosition, setPointPosition] = useState<LatLngPosition>(() => {
    // ตรวจสอบว่ามีพิกัดที่ถูกต้องหรือไม่
    if (
      location.type === "Point" &&
      location.coordinates &&
      location.coordinates[0] !== 0 &&
      location.coordinates[1] !== 0
    ) {
      return [location.coordinates[1], location.coordinates[0]];
    }
    return defaultPosition; // ใช้กรุงเทพฯเป็นค่าเริ่มต้น
  });

  // สถานะสำหรับวงกลม
  const [circleCenter, setCircleCenter] = useState<LatLngPosition>(
    location.type === "Point"
      ? [location.coordinates[1], location.coordinates[0]]
      : defaultPosition
  );
  const [circleRadius, setCircleRadius] = useState<number>(100);
  const [isSettingCircle, setIsSettingCircle] = useState<boolean>(false);

  // สถานะสำหรับสี่เหลี่ยม
  const [rectangleStart, setRectangleStart] = useState<LatLngPosition | null>(
    null
  );
  const [rectangleEnd, setRectangleEnd] = useState<LatLngPosition | null>(null);
  const [isDrawingRectangle, setIsDrawingRectangle] = useState<boolean>(false);

  // Refs
  const mapRef = useRef<L.Map | null>(null);

  // แก้ไขปัญหา marker icon
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  // ฟังก์ชั่นรีเซ็ต
  const resetShape = useCallback(() => {
    switch (shapeType) {
      case "Point":
        // ไม่ต้องทำอะไร จะให้ผู้ใช้คลิกใหม่
        break;
      case "Circle":
        setIsSettingCircle(false);
        setCircleRadius(100);
        break;
      case "Rectangle":
        setRectangleStart(null);
        setRectangleEnd(null);
        setIsDrawingRectangle(false);
        break;
      default:
        break;
    }
  }, [shapeType]);

  // เมื่อเปลี่ยนประเภทให้รีเซ็ตข้อมูล
  useEffect(() => {
    resetShape();
  }, [resetShape]);

  // จัดการคลิกบนแผนที่
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const latlng: LatLngPosition = [e.latlng.lat, e.latlng.lng];

    switch (shapeType) {
      case "Point":
        // กรณีจุด: วางจุดได้เลย
        setPointPosition(latlng);
        onChange({
          type: "Point",
          coordinates: [latlng[1], latlng[0]],
        });
        break;

      case "Circle":
        if (!isSettingCircle) {
          // กำหนดจุดศูนย์กลาง
          setCircleCenter(latlng);
          setIsSettingCircle(true);
        } else {
          // คำนวณรัศมีจากจุดศูนย์กลางถึงจุดที่คลิก
          const radius = calculateDistance(circleCenter, latlng);
          setCircleRadius(radius);
          setIsSettingCircle(false);

          // สร้าง GeoJSON
          createCircleGeoJSON(circleCenter, radius);
        }
        break;

      case "Rectangle":
        if (!isDrawingRectangle) {
          // กำหนดจุดเริ่มต้น
          setRectangleStart(latlng);
          setIsDrawingRectangle(true);
        } else {
          // กำหนดจุดสิ้นสุด
          setRectangleEnd(latlng);
          setIsDrawingRectangle(false);

          // สร้าง GeoJSON
          if (rectangleStart) {
            createRectangleGeoJSON(rectangleStart, latlng);
          }
        }
        break;
    }
  };

  // คำนวณระยะทางระหว่างจุด (เมตร)
  const calculateDistance = (
    point1: LatLngPosition,
    point2: LatLngPosition
  ): number => {
    if (!mapRef.current) return 100; // ค่าเริ่มต้น

    const latlng1 = L.latLng(point1[0], point1[1]);
    const latlng2 = L.latLng(point2[0], point2[1]);

    return latlng1.distanceTo(latlng2);
  };

  // เพิ่ม/ลดรัศมีวงกลม
  const handleCircleRadiusChange = (newRadius: number) => {
    setCircleRadius(newRadius);
    createCircleGeoJSON(circleCenter, newRadius);
  };

  // สร้าง GeoJSON สำหรับวงกลม
  const createCircleGeoJSON = (center: LatLngPosition, radius: number) => {
    // แปลงวงกลมเป็น polygon
    const points = 64;
    const deg2rad = Math.PI / 180;
    const coordinates: [number, number][] = [];

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 360 * deg2rad;
      const x =
        center[1] +
        ((radius / 111320) * Math.cos(angle)) / Math.cos(center[0] * deg2rad);
      const y = center[0] + (radius / 111320) * Math.sin(angle);
      coordinates.push([x, y]);
    }

    // ปิดวง
    coordinates.push(coordinates[0]);

    onChange({
      type: "Polygon",
      coordinates: [coordinates],
    });
  };

  // สร้าง GeoJSON สำหรับสี่เหลี่ยม
  const createRectangleGeoJSON = (
    start: LatLngPosition,
    end: LatLngPosition
  ) => {
    // สร้างจุดของสี่เหลี่ยม
    const rectPoints: [number, number][] = [
      [start[1], start[0]],
      [end[1], start[0]],
      [end[1], end[0]],
      [start[1], end[0]],
      [start[1], start[0]], // ปิดวง
    ];

    onChange({
      type: "Polygon",
      coordinates: [rectPoints],
    });
  };

  // Component จัดการคลิกบนแผนที่
  const MapClickHandler = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  // แสดงคำแนะนำตามสถานะปัจจุบัน
  const getInstructions = () => {
    switch (shapeType) {
      case "Point":
        return "คลิกที่แผนที่เพื่อวางหมุดพิกัด";
      case "Circle":
        return isSettingCircle
          ? "คลิกอีกครั้งเพื่อกำหนดขนาดวงกลม"
          : "คลิกที่แผนที่เพื่อวางจุดศูนย์กลางวงกลม";
      case "Rectangle":
        return isDrawingRectangle
          ? "คลิกอีกครั้งเพื่อกำหนดมุมสี่เหลี่ยม"
          : "คลิกที่แผนที่เพื่อวางจุดเริ่มต้นสี่เหลี่ยม";
      default:
        return "";
    }
  };

  return (
    <div className="mt-2 flex flex-col w-full">
      {/* ส่วนควบคุม */}
      <div className="flex flex-wrap gap-2 mb-2">
        <div className="flex items-center">
          <span className="text-sm mr-2">รูปแบบพื้นที่:</span>
          <select
            value={shapeType}
            onChange={(e) => setShapeType(e.target.value)}
            className="px-2 py-1 text-sm border rounded"
          >
            <option value="Point">หมุดพิกัด</option>
            <option value="Circle">วงกลม</option>
            <option value="Rectangle">สี่เหลี่ยม</option>
          </select>
        </div>

        {/* ควบคุมเพิ่มเติมสำหรับวงกลม */}
        {shapeType === "Circle" && (
          <div className="flex items-center ml-4">
            <span className="text-sm mr-2">รัศมี (เมตร):</span>
            <input
              type="number"
              value={circleRadius}
              onChange={(e) =>
                handleCircleRadiusChange(parseFloat(e.target.value) || 100)
              }
              min="10"
              max="10000"
              step="10"
              className="w-20 px-2 py-1 text-sm border rounded"
            />
            <button
              type="button"
              onClick={() => handleCircleRadiusChange(circleRadius - 10)}
              className="px-2 py-1 ml-1 text-sm rounded bg-gray-200"
              disabled={circleRadius <= 0.1}
            >
              -
            </button>
            <button
              type="button"
              onClick={() => handleCircleRadiusChange(circleRadius + 10)}
              className="px-2 py-1 ml-1 text-sm rounded bg-gray-200"
            >
              +
            </button>
          </div>
        )}

        <div className="flex items-center ml-2">
          <button
            type="button"
            onClick={resetShape}
            className="px-3 py-1 text-sm rounded bg-red-500 text-white"
          >
            ล้างพื้นที่
          </button>
        </div>
      </div>

      {/* แผนที่ */}
      <div className="w-full h-96 md:h-[500px] border rounded overflow-hidden relative">
        <MapContainer
          center={pointPosition}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
          ref={(map) => {
            mapRef.current = map || null;
          }}
        >
          {/* แผนที่พื้นฐาน */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* ส่วนค้นหา */}
          <SearchField />

          {/* จัดการคลิกบนแผนที่ */}
          <MapClickHandler />

          {/* แสดงรูปร่าง */}
          {shapeType === "Point" && (
            <Marker position={pointPosition}>
              <Popup>
                ละติจูด: {pointPosition[0].toFixed(6)}, ลองจิจูด:{" "}
                {pointPosition[1].toFixed(6)}
              </Popup>
            </Marker>
          )}

          {shapeType === "Circle" && (
            <>
              {/* แสดงจุดศูนย์กลาง */}
              <Marker position={circleCenter}>
                <Popup>จุดศูนย์กลางวงกลม</Popup>
              </Marker>

              {/* แสดงวงกลม */}
              <Circle
                center={circleCenter}
                radius={circleRadius}
                color="red"
                fillColor="red"
                fillOpacity={0.2}
              />
            </>
          )}

          {shapeType === "Rectangle" && rectangleStart && rectangleEnd && (
            <>
              {/* แสดงมุมทั้งสอง */}
              <Marker position={rectangleStart}>
                <Popup>มุมที่ 1</Popup>
              </Marker>
              <Marker position={rectangleEnd}>
                <Popup>มุมที่ 2</Popup>
              </Marker>

              {/* แสดงสี่เหลี่ยม */}
              <Rectangle
                bounds={[rectangleStart, rectangleEnd]}
                color="blue"
                fillColor="blue"
                fillOpacity={0.2}
              />
            </>
          )}
        </MapContainer>
      </div>

      {/* คำแนะนำ */}
      <div className="mt-2">
        <div className="text-sm text-gray-600">
          <p>{getInstructions()}</p>
        </div>

        {/* ข้อมูลพิกัด */}
        {shapeType === "Point" && (
          <div className="mt-1 text-sm">
            <p>
              พิกัด: ละติจูด {pointPosition[0].toFixed(6)}, ลองจิจูด{" "}
              {pointPosition[1].toFixed(6)}
            </p>
          </div>
        )}

        {shapeType === "Circle" && !isSettingCircle && (
          <div className="mt-1 text-sm">
            <p>
              ศูนย์กลาง: ละติจูด {circleCenter[0].toFixed(6)}, ลองจิจูด{" "}
              {circleCenter[1].toFixed(6)}
              <br />
              รัศมี: {circleRadius.toFixed(2)} เมตร
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapSelector;
