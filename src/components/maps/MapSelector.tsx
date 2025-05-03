import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
  Popup,
  Polygon,
  Rectangle,
  Circle,
  Polyline,
  FeatureGroup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// Import GeoSearch components
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { GeoSearchControl } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
// Import Leaflet Draw
import "leaflet-draw/dist/leaflet.draw.css";
import { EditControl } from "react-leaflet-draw";
// แก้ไขการ import ESRI Geocoder - ใช้ as any
import * as EsriLeafletGeocoder from "esri-leaflet-geocoder";
import "esri-leaflet-geocoder/dist/esri-leaflet-geocoder.css";

// กำหนด type ให้ชัดเจน
type LatLngPosition = [number, number]; // [latitude, longitude]
type GeoJSONGeometry =
  | { type: "Point"; coordinates: [number, number] }
  | { type: "LineString"; coordinates: [number, number][] }
  | { type: "Polygon"; coordinates: [number, number][][] }
  | { type: "MultiPolygon"; coordinates: [number, number][][][] };

interface MapSelectorProps {
  location: GeoJSONGeometry;
  onChange: (location: GeoJSONGeometry) => void;
  height?: string;
}

// Component for the search control
const SearchField: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    // กำหนดตัวเลือกโดยปิดการแสดง marker แต่ให้อัปเดตตำแหน่งแผนที่
    const searchControl = new (GeoSearchControl as any)({
      provider,
      style: "bar",
      showMarker: false, // ปิดการแสดง marker
      showPopup: false, // ไม่แสดง popup
      autoClose: true,
      retainZoomLevel: false, // อนุญาตให้เปลี่ยนระดับการซูม
      animateZoom: true, // อนุญาตให้มีการเคลื่อนไหวแบบ animate
      autoComplete: true,
      autoCompleteDelay: 250,
      keepResult: true, // เก็บผลลัพธ์ไว้ในช่องค้นหา
      updateMap: true, // อนุญาตให้อัปเดตแผนที่อัตโนมัติ - สำคัญสำหรับการเลื่อนไปยังตำแหน่ง
      searchLabel: "ค้นหาสถานที่",
      position: "topright",
    });

    // เพิ่ม control
    map.addControl(searchControl);

    // ใช้ event ของ map เพื่อลบ marker ที่อาจถูกสร้างขึ้น
    map.on("geosearch/showlocation", (e: any) => {
      // ลบ marker ที่อาจถูกสร้างโดย geosearch
      // (โดยปกติจะไม่มี เพราะเราตั้งค่า showMarker: false แล้ว แต่เพื่อความปลอดภัย)
      if (e.marker) {
        map.removeLayer(e.marker);
      }
    });

    return () => {
      // ลบ event listener เมื่อ component unmount
      map.off("geosearch/showlocation");
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
};
// Convert Leaflet LatLng to GeoJSON [lng, lat]
const toGeoJSONCoordinates = (latlng: L.LatLng): [number, number] => [
  latlng.lng,
  latlng.lat,
];

// Convert Leaflet LatLngs to GeoJSON coordinates
const latLngsToCoordinates = (latLngs: L.LatLng[]): [number, number][] => {
  return latLngs.map(toGeoJSONCoordinates);
};

// แปลง array จาก LatLng เป็น coordinates สำหรับ Polygon
const polygonLatLngsToCoordinates = (
  latLngs: L.LatLng[][]
): [number, number][][] => {
  return latLngs.map((ring) => ring.map(toGeoJSONCoordinates));
};

// Component หลัก
const MapSelector: React.FC<MapSelectorProps> = ({
  location,
  onChange,
  height = "400px",
}) => {
  const [mapMode, setMapMode] = useState<"point" | "draw">("point");
  const [selectedShape, setSelectedShape] = useState<string>("Point");
  const mapRef = useRef<L.Map | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const editableFG = useRef<any>(null);

  // Initial position for the map center
  const defaultPosition: LatLngPosition = [13.736717, 100.523186]; // Bangkok
  const [position, setPosition] = useState<LatLngPosition>(
    location.type === "Point"
      ? [location.coordinates[1], location.coordinates[0]]
      : defaultPosition
  );

  // แก้ไขปัญหาไอคอน marker ที่หายไป
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

  // อัพเดทค่า map ref เมื่อ map ready
  const onMapReady = (map: L.Map) => {
    // เพิ่ม FeatureGroup สำหรับ draw
    const featureGroup = new L.FeatureGroup();
    featureGroupRef.current = featureGroup;
    map.addLayer(featureGroup);

    // นำเข้า existing shapes ถ้ามี
    if (location.type !== "Point") {
      try {
        if (location.type === "LineString" && location.coordinates.length > 1) {
          // สร้าง polyline
          const latLngs = location.coordinates.map(([lng, lat]) =>
            L.latLng(lat, lng)
          );
          const polyline = L.polyline(latLngs);
          featureGroup.addLayer(polyline);

          // ปรับมุมมองให้พอดีกับเส้นที่วาด
          map.fitBounds(polyline.getBounds());
        } else if (
          location.type === "Polygon" &&
          location.coordinates.length > 0
        ) {
          // สร้าง polygon
          const latLngs = location.coordinates[0].map(([lng, lat]) =>
            L.latLng(lat, lng)
          );
          const polygon = L.polygon(latLngs);
          featureGroup.addLayer(polygon);

          // ปรับมุมมองให้พอดีกับพื้นที่ที่วาด
          map.fitBounds(polygon.getBounds());
        }
      } catch (error) {
        console.error("Error loading existing shape:", error);
      }
    }
  };

  // MapView component เพื่อป้องกันการกลับไปที่ตำแหน่งเริ่มต้น
  const MapView: React.FC = () => {
    const map = useMap();
    const isFirstLoad = useRef<boolean>(true);

    useEffect(() => {
      // ตั้งค่าการซูมและตำแหน่งแผนที่เฉพาะครั้งแรกเท่านั้น
      // และเฉพาะกรณีที่ไม่มีการตั้งค่า bounds อื่นๆ แล้ว
      if (isFirstLoad.current) {
        isFirstLoad.current = false;

        // ตรวจสอบว่ามีการกำหนด fitBounds หรือยัง
        setTimeout(() => {
          // ถ้าไม่มีการเปลี่ยนแปลงตำแหน่งหรือการซูม ให้ใช้ค่าเริ่มต้น
          // ในกรณีที่มีการวาดรูปร่างหรือมีการค้นหา ค่าเหล่านี้จะถูกเปลี่ยนแปลงแล้ว
        }, 100);
      }
    }, [map]);

    return null;
  };

  // อัพเดทค่า position เมื่อ click
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (mapMode === "point") {
      const newPosition: LatLngPosition = [e.latlng.lat, e.latlng.lng];
      setPosition(newPosition);
      onChange({
        type: "Point",
        coordinates: [e.latlng.lng, e.latlng.lat], // [lng, lat] for GeoJSON
      });
    }
  };

  // จัดการเมื่อมีการสร้าง shape ใหม่
  const handleCreated = (e: any) => {
    const { layerType, layer } = e;

    if (layerType === "marker") {
      const latlng = layer.getLatLng();
      onChange({
        type: "Point",
        coordinates: [latlng.lng, latlng.lat],
      });
    } else if (layerType === "polyline") {
      const latLngs = layer.getLatLngs();
      onChange({
        type: "LineString",
        coordinates: latLngsToCoordinates(latLngs),
      });
    } else if (layerType === "polygon") {
      const latLngs = layer.getLatLngs();
      // ตรวจสอบโครงสร้างของ latLngs
      if (Array.isArray(latLngs) && latLngs.length > 0) {
        if (Array.isArray(latLngs[0])) {
          // กรณี nested arrays (multi-ring polygon)
          onChange({
            type: "Polygon",
            coordinates: polygonLatLngsToCoordinates(latLngs as L.LatLng[][]),
          });
        } else {
          // กรณี single array (simple polygon)
          onChange({
            type: "Polygon",
            coordinates: [latLngsToCoordinates(latLngs as L.LatLng[])],
          });
        }
      }
    } else if (layerType === "rectangle") {
      const latLngs = layer.getLatLngs();
      if (Array.isArray(latLngs) && latLngs.length > 0) {
        if (Array.isArray(latLngs[0])) {
          onChange({
            type: "Polygon",
            coordinates: polygonLatLngsToCoordinates(latLngs as L.LatLng[][]),
          });
        } else {
          onChange({
            type: "Polygon",
            coordinates: [latLngsToCoordinates(latLngs as L.LatLng[])],
          });
        }
      }
    } else if (layerType === "circle") {
      // สำหรับวงกลม เราจะสร้าง polygon ที่ประมาณเป็นวงกลม
      const center = layer.getLatLng();
      const radius = layer.getRadius();

      // สร้าง polygon ที่เป็นวงกลมโดยประมาณ
      const points = 64; // จำนวนจุดรอบวงกลม
      const deg2rad = Math.PI / 180;
      const coordinates: [number, number][] = [];

      for (let i = 0; i < points; i++) {
        const angle = (i / points) * 360 * deg2rad;
        const x =
          center.lng +
          ((radius / 111320) * Math.cos(angle)) /
            Math.cos(center.lat * deg2rad);
        const y = center.lat + (radius / 111320) * Math.sin(angle);
        coordinates.push([x, y]);
      }

      // เพิ่มจุดแรกกลับมาเป็นจุดสุดท้ายเพื่อปิดวงกลม
      coordinates.push(coordinates[0]);

      onChange({
        type: "Polygon",
        coordinates: [coordinates],
      });
    }

    // เก็บเฉพาะ layer ล่าสุด
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
      featureGroupRef.current.addLayer(layer);
    }
  };

  // จัดการเมื่อมีการแก้ไข shape
  const handleEdited = (e: any) => {
    const layers = e.layers;
    layers.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        const latlng = layer.getLatLng();
        onChange({
          type: "Point",
          coordinates: [latlng.lng, latlng.lat],
        });
      } else if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
        const latLngs = layer.getLatLngs();
        if (Array.isArray(latLngs) && !Array.isArray(latLngs[0])) {
          onChange({
            type: "LineString",
            coordinates: latLngsToCoordinates(latLngs as L.LatLng[]),
          });
        }
      } else if (layer instanceof L.Polygon) {
        const latLngs = layer.getLatLngs();
        if (Array.isArray(latLngs) && latLngs.length > 0) {
          if (Array.isArray(latLngs[0])) {
            onChange({
              type: "Polygon",
              coordinates: polygonLatLngsToCoordinates(latLngs as L.LatLng[][]),
            });
          } else {
            onChange({
              type: "Polygon",
              coordinates: [latLngsToCoordinates(latLngs as L.LatLng[])],
            });
          }
        }
      }
    });
  };

  // จัดการเมื่อมีการลบ shape
  const handleDeleted = () => {
    onChange({
      type: "Point",
      coordinates: [position[1], position[0]],
    });
    setMapMode("point");
  };

  // อัพเดท shape tool ที่เลือก
  const handleModeChange = (mode: "point" | "draw") => {
    setMapMode(mode);

    if (mapRef.current && featureGroupRef.current) {
      // ล้าง layers ทั้งหมดเมื่อเปลี่ยนโหมด
      featureGroupRef.current.clearLayers();
    }
  };

  // สำหรับ FeatureGroup ref callback
  const onFeatureGroupReady = (ref: any) => {
    editableFG.current = ref;
  };

  return (
    <div className="mt-2 flex flex-col w-full px-0">
      {/* เครื่องมือควบคุม */}
      <div className="flex flex-wrap gap-2 mb-2 w-full">
        <div className="flex items-center">
          <span className="text-sm mr-2">โหมด:</span>
          <button
            type="button"
            onClick={() => handleModeChange("point")}
            className={`px-3 py-1 text-sm rounded ${
              mapMode === "point"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            จุดเดียว
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("draw")}
            className={`px-3 py-1 text-sm rounded ml-1 ${
              mapMode === "draw"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            วาดรูปร่าง
          </button>
        </div>

        {mapMode === "draw" && (
          <div className="flex items-center">
            <span className="text-sm mr-2">รูปร่าง:</span>
            <select
              value={selectedShape}
              onChange={(e) => setSelectedShape(e.target.value)}
              className="px-2 py-1 text-sm border rounded"
            >
              <option value="Point">จุด</option>
              <option value="LineString">เส้น</option>
              <option value="Polygon">รูปหลายเหลี่ยม</option>
              <option value="Rectangle">สี่เหลี่ยม</option>
              <option value="Circle">วงกลม</option>
            </select>
          </div>
        )}
      </div>

      {/* แผนที่ */}
      <div
        className="w-full h-96 md:h-[500px] relative border rounded overflow-hidden"
        style={{ margin: 0, padding: 0 }}
      >
        <MapContainer
          center={
            position && position[0] !== 0 ? position : [13.736717, 100.523186]
          }
          zoom={13}
          style={{ height: "100%", width: "100%", margin: 0, padding: 0 }}
          scrollWheelZoom={true}
          ref={(map) => {
            if (map) {
              mapRef.current = map;
              onMapReady(map);
            }
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* แสดง marker เมื่ออยู่ในโหมด point */}
          {mapMode === "point" && (
            <Marker position={position}>
              <Popup>
                ละติจูด: {position[0].toFixed(6)}, ลองจิจูด:{" "}
                {position[1].toFixed(6)}
              </Popup>
            </Marker>
          )}

          {/* เพิ่ม event handler สำหรับการคลิก */}
          {mapMode === "point" && <ClickHandler onClick={handleMapClick} />}

          {/* เพิ่ม search control */}
          <SearchField />

          {/* เพิ่ม draw control เมื่ออยู่ในโหมด draw */}
          {mapMode === "draw" && (
            <FeatureGroup ref={onFeatureGroupReady}>
              <EditControl
                position="topright"
                onCreated={handleCreated}
                onEdited={handleEdited}
                onDeleted={handleDeleted}
                draw={{
                  polyline: selectedShape === "LineString",
                  polygon: selectedShape === "Polygon",
                  rectangle: selectedShape === "Rectangle",
                  circle: selectedShape === "Circle",
                  marker: selectedShape === "Point",
                  circlemarker: false,
                }}
              />
            </FeatureGroup>
          )}
        </MapContainer>
      </div>

      {/* แสดงข้อมูลตำแหน่ง */}
      <div className="mt-2 text-sm text-gray-600">
        {mapMode === "point" ? (
          <p>
            คลิกบนแผนที่เพื่อเลือกตำแหน่ง | ละติจูด: {position[0].toFixed(6)},
            ลองจิจูด: {position[1].toFixed(6)}
          </p>
        ) : (
          <p>เลือกเครื่องมือจากแถบด้านขวาบนของแผนที่เพื่อวาดรูปร่าง</p>
        )}
      </div>
    </div>
  );
};

// Component สำหรับ handle click event
const ClickHandler: React.FC<{ onClick: (e: L.LeafletMouseEvent) => void }> = ({
  onClick,
}) => {
  useMapEvents({
    click: onClick,
  });

  return null;
};

export default MapSelector;
