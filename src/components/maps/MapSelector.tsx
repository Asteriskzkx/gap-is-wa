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
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import regNesdb from "@/data/reg_nesdb.geojson";
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
  width?: string;
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
  width = "100%",
}) => {
  // ตำแหน่งเริ่มต้น (กรุงเทพฯ)
  const defaultPosition: LatLngPosition = [13.736717, 100.523186];

  // สถานะสำหรับเก็บประเภทที่เลือก
  const [shapeType, setShapeType] = useState<string>(location.type || "Point");

  // สถานะสำหรับจุด
  const [pointPosition, setPointPosition] = useState<LatLngPosition>(() => {
    // ถ้ามีพิกัดที่ valid ให้ใช้พิกัดนั้นเป็นตำแหน่งเริ่มต้น
    if (
      location.type === "Point" &&
      Array.isArray(location.coordinates) &&
      location.coordinates.length === 2
    ) {
      const [lng, lat] = location.coordinates;
      if (
        typeof lat === "number" &&
        typeof lng === "number" &&
        !Number.isNaN(lat) &&
        !Number.isNaN(lng) &&
        Number.isFinite(lat) &&
        Number.isFinite(lng)
      ) {
        return [lat, lng];
      }
    }
    // หากไม่มีพิกัดที่ valid ให้ใช้ค่าเริ่มต้นเพื่อเป็นตำแหน่งมุมมอง
    return defaultPosition; // ใช้กรุงเทพฯเป็นค่าเริ่มต้นมุมมอง
  });

  // บอกว่า user ได้เลือกจุดแล้วหรือยัง (ตรวจสอบว่ามีพิกัดที่ valid)
  const [isPointSelected, setIsPointSelected] = useState<boolean>(() => {
    if (
      location.type === "Point" &&
      Array.isArray(location.coordinates) &&
      location.coordinates.length === 2
    ) {
      const [lng, lat] = location.coordinates;
      return (
        typeof lat === "number" &&
        typeof lng === "number" &&
        !Number.isNaN(lat) &&
        !Number.isNaN(lng) &&
        Number.isFinite(lat) &&
        Number.isFinite(lng)
      );
    }
    return false;
  });

  // สถานะสำหรับวงกลม
  const [circleCenter, setCircleCenter] = useState<LatLngPosition>(() => {
    if (
      location.type === "Point" &&
      Array.isArray(location.coordinates) &&
      location.coordinates.length === 2
    ) {
      const [lng, lat] = location.coordinates;
      if (
        typeof lat === "number" &&
        typeof lng === "number" &&
        !Number.isNaN(lat) &&
        !Number.isNaN(lng) &&
        Number.isFinite(lat) &&
        Number.isFinite(lng)
      ) {
        return [lat, lng];
      }
    }
    return defaultPosition;
  });
  const [circleRadius, setCircleRadius] = useState<number>(100);
  const [isSettingCircle, setIsSettingCircle] = useState<boolean>(false);

  // สถานะสำหรับสี่เหลี่ยม
  const [rectangleStart, setRectangleStart] = useState<LatLngPosition | null>(
    null
  );
  const [rectangleEnd, setRectangleEnd] = useState<LatLngPosition | null>(null);
  const [isDrawingRectangle, setIsDrawingRectangle] = useState<boolean>(false);

  // ข้อความ error เมื่อเลือกตำแหน่งนอกประเทศไทย
  const [locationError, setLocationError] = useState<string | null>(null);

  // ใช้ GeoJSON ที่มาจากไฟล์ `src/data/reg_nesdb.geojson` (FeatureCollection)
  // ตรวจว่า point อยู่ใน any feature ของ FeatureCollection
  const isPointInThailand = (lat: number, lng: number) => {
    try {
      const pt = {
        type: "Feature",
        properties: {},
        geometry: { type: "Point", coordinates: [lng, lat] },
      } as any;

      if (regNesdb && Array.isArray((regNesdb as any).features)) {
        for (const feat of (regNesdb as any).features) {
          if (booleanPointInPolygon(pt, feat as any)) return true;
        }
        return false;
      }

      // fallback: allow
      return true;
    } catch (err) {
      console.error("Error checking point-in-polygon:", err);
      return true;
    }
  };

  // ตรวจว่า polygon (array of [lng, lat]) อยู่ทั้งหมดในประเทศไทย
  const isPolygonInsideThailand = (coords: [number, number][]) => {
    try {
      for (const coord of coords) {
        const lng = coord[0];
        const lat = coord[1];
        if (!isPointInThailand(lat, lng)) return false;
      }
      return true;
    } catch (err) {
      console.error("Error checking polygon-in-polygon:", err);
      return true; // fail-open: allow if check fails unexpectedly
    }
  };

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

  // จัดการคลิกบนแผนที่ with safety checks
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    try {
      const latlng: LatLngPosition = [e.latlng.lat, e.latlng.lng];

      // ป้องกันการเลือกนอกประเทศไทย (ใช้ GeoJSON + turf)
      if (!isPointInThailand(latlng[0], latlng[1])) {
        setLocationError("ตำแหน่งอยู่นอกประเทศไทย กรุณาเลือกภายในประเทศไทย");
        return;
      }
      setLocationError(null);

      switch (shapeType) {
        case "Point":
          // กรณีจุด: วางจุดได้เลย
          setPointPosition(latlng);
          setIsPointSelected(true);
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

            // สร้าง GeoJSON แบบตรวจสอบก่อน ถ้าไม่ผ่านจะไม่ปิดการตั้งค่าวงกลม
            const ok = createCircleGeoJSON(circleCenter, radius);
            if (ok) {
              setCircleRadius(radius);
              setIsSettingCircle(false);
            }
          }
          break;

        case "Rectangle":
          if (!isDrawingRectangle) {
            // กำหนดจุดเริ่มต้น
            setRectangleStart(latlng);
            setIsDrawingRectangle(true);
          } else {
            // พยายามสร้างสี่เหลี่ยมและตรวจสอบก่อน
            if (rectangleStart) {
              const ok = createRectangleGeoJSON(rectangleStart, latlng);
              if (ok) {
                setRectangleEnd(latlng);
                setIsDrawingRectangle(false);
              }
            } else {
              // ถ้าไม่มี start ให้รีเซ็ตเป็นกรณีผิดพลาด
              setRectangleStart(null);
              setRectangleEnd(null);
              setIsDrawingRectangle(false);
            }
          }
          break;
      }
    } catch (error) {
      console.error("Error handling map click:", error);
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
    // only emit change if generated polygon is fully inside the country
    const ok = createCircleGeoJSON(circleCenter, newRadius);
    if (!ok) {
      // keep the error message set by createCircleGeoJSON
    }
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

    // ตรวจสอบว่า polygon ทั้งหมดอยู่ในประเทศไทย
    // note: coordinates are [lng, lat]
    if (!isPolygonInsideThailand(coordinates)) {
      setLocationError(
        "วงกลมนี้ข้ามนอกประเทศไทย หรืออยู่บางส่วนอยู่นอกประเทศ กรุณาย่อขนาดหรือย้ายจุดศูนย์กลาง"
      );
      return false;
    }

    // ถ้า OK ให้เคลียร์ error และส่งข้อมูล
    setLocationError(null);
    onChange({
      type: "Polygon",
      coordinates: [coordinates],
    });

    return true;
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

    // ตรวจสอบว่า polygon ทั้งหมดอยู่ในประเทศไทย
    if (!isPolygonInsideThailand(rectPoints)) {
      setLocationError(
        "สี่เหลี่ยมนี้ข้ามนอกประเทศไทย หรืออยู่บางส่วนอยู่นอกประเทศ กรุณาเลือกใหม่"
      );
      return false;
    }

    setLocationError(null);
    onChange({
      type: "Polygon",
      coordinates: [rectPoints],
    });

    return true;
  };

  // Component จัดการคลิกบนแผนที่
  const MapClickHandler = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  // Component สำหรับจัดการ map reference และ resize
  const MapSetup = () => {
    const map = useMap();

    useEffect(() => {
      mapRef.current = map;

      // แค่ force invalidate ครั้งเดียว
      setTimeout(() => {
        try {
          if (map && typeof map.invalidateSize === "function") {
            map.invalidateSize();
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }, 1000);
    }, [map]);

    return null;
  };

  // Component to auto-fit map bounds to polygon/shape
  const AutoFitBounds: React.FC<{ coords: [number, number][] }> = ({
    coords,
  }) => {
    const map = useMap();
    useEffect(() => {
      if (!coords || coords.length === 0) return;
      // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
      const latlngs = coords.map((c) => [c[1], c[0]] as [number, number]);
      map.fitBounds(latlngs as any, { padding: [50, 50] });
    }, [map, coords]);
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
    <div className="w-full">
      {/* ส่วนควบคุม - Mobile responsive */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 p-3 bg-gray-50 border-b border-gray-300">
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-sm font-medium whitespace-nowrap">
            รูปแบบพื้นที่:
          </span>
          <select
            value={shapeType}
            onChange={(e) => setShapeType(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="Point">หมุดพิกัด</option>
            <option value="Circle">วงกลม</option>
            <option value="Rectangle">สี่เหลี่ยม</option>
          </select>
        </div>

        {/* ควบคุมเพิ่มเติมสำหรับวงกลม */}
        {shapeType === "Circle" && (
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-sm font-medium whitespace-nowrap">
              รัศมี (เมตร):
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={circleRadius}
                onChange={(e) =>
                  handleCircleRadiusChange(
                    Number.parseFloat(e.target.value) || 100
                  )
                }
                min="10"
                max="10000"
                step="10"
                className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={() =>
                  handleCircleRadiusChange(Math.max(10, circleRadius - 10))
                }
                className="px-2 py-1.5 text-sm rounded-md bg-gray-200 hover:bg-gray-300 transition-colors"
                disabled={circleRadius <= 10}
              >
                -
              </button>
              <button
                type="button"
                onClick={() => handleCircleRadiusChange(circleRadius + 10)}
                className="px-2 py-1.5 text-sm rounded-md bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center ml-auto">
          <button
            type="button"
            onClick={resetShape}
            className="px-3 py-1.5 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors whitespace-nowrap"
          >
            ล้างพื้นที่
          </button>
        </div>
      </div>

      {/* แผนที่ */}
      <div className="w-full bg-gray-100">
        <div
          style={{
            height: height || "400px",
            width: "100%",
          }}
        >
          <MapContainer
            center={pointPosition}
            zoom={13}
            style={{
              height: "100%",
              width: "100%",
              maxWidth: "100%",
              zIndex: 1,
            }}
            scrollWheelZoom={true}
          >
            {/* แผนที่พื้นฐาน */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* ส่วนค้นหา */}
            <SearchField />

            {/* จัดการ map setup และ resize */}
            <MapSetup />

            {/* จัดการคลิกบนแผนที่ */}
            <MapClickHandler />

            {/* แสดงรูปร่าง */}
            {shapeType === "Point" && isPointSelected && (
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

            {/* แสดง Polygon ที่มีอยู่แล้วจาก location prop (เมื่อไม่ได้กำลังวาดรูปใหม่) */}
            {location.type === "Polygon" &&
              location.coordinates &&
              Array.isArray(location.coordinates) &&
              location.coordinates.length > 0 &&
              !isSettingCircle &&
              !isDrawingRectangle && (
                <>
                  <Polygon
                    positions={location.coordinates[0].map(
                      (coord: [number, number]) => [coord[1], coord[0]]
                    )}
                    color="blue"
                    fillColor="blue"
                    fillOpacity={0.2}
                    weight={2}
                  />
                  <AutoFitBounds coords={location.coordinates[0]} />
                </>
              )}
          </MapContainer>
        </div>
      </div>

      {/* คำแนะนำและข้อมูลพิกัด */}
      <div className="p-3 bg-gray-50 border-t border-gray-300">
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
          <i className="pi pi-info-circle text-blue-500"></i>
          <p className="font-medium">{getInstructions()}</p>
        </div>

        {/* ข้อความ error เมื่อเลือกนอกประเทศไทย */}
        {locationError && (
          <div className="text-sm text-red-600 mb-2 flex items-start gap-2">
            <i className="pi pi-exclamation-triangle"></i>
            <p>{locationError}</p>
          </div>
        )}

        {/* ข้อมูลพิกัด */}
        {shapeType === "Point" && (
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <i className="pi pi-map-marker text-green-600"></i>
            <p>
              พิกัด: {pointPosition[0].toFixed(6)},{" "}
              {pointPosition[1].toFixed(6)}
            </p>
          </div>
        )}

        {shapeType === "Circle" && !isSettingCircle && (
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-2 mb-1">
              <i className="pi pi-circle text-blue-600"></i>
              <p>
                ศูนย์กลาง: {circleCenter[0].toFixed(6)},{" "}
                {circleCenter[1].toFixed(6)}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-6">
              <p>รัศมี: {circleRadius.toFixed(2)} เมตร</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapSelector;
