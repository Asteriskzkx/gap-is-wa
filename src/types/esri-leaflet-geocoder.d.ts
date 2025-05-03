// Type definitions for esri-leaflet-geocoder
declare module 'esri-leaflet-geocoder' {
    import * as L from 'leaflet';
    import * as EsriLeaflet from 'esri-leaflet';

    // สำหรับผลลัพธ์การค้นหา
    export interface GeosearchObject {
        text: string;
        bounds: L.LatLngBounds;
        latlng: L.LatLng;
        properties: any;
    }

    // ตัวเลือกสำหรับ Geosearch
    export interface GeosearchOptions {
        providers?: any[];
        useMapBounds?: boolean | number;
        searchBounds?: L.LatLngBounds[];
        zoomToResult?: boolean;
        allowMultipleResults?: boolean;
        placeholder?: string;
        title?: string;
        expanded?: boolean;
        collapseAfterResult?: boolean;
        attribution?: string;
    }

    // ตัวเลือกสำหรับการแนะนำ
    export interface SuggestOptions {
        providers?: any[];
        useMapBounds?: boolean | number;
        searchBounds?: L.LatLngBounds[];
    }

    // Class สำหรับ Geocoder Control
    // แก้ไข: เปลี่ยนชื่อเป็น GeocodeControl แทน Geocoder เพื่อหลีกเลี่ยงปัญหาการ export
    export class GeocodeControl extends L.Control {
        constructor(options?: GeosearchOptions);
        clear(): void;
        clearSuggestions(): void;
        disable(): void;
        enable(): void;
        on(event: string, callback: Function): this;
        setPosition(position: string): this;
    }

    export class GeosearchCore { }

    export class Geosearch {
        constructor(options?: GeosearchOptions);
        clear(): void;
        disable(): void;
        enable(): void;
        on(event: string, callback: Function): this;
        suggest(text: string, options?: SuggestOptions): Promise<GeosearchObject[]>;
    }

    // รองรับ providers ต่างๆ
    export class FeatureLayerProvider { }
    export class MapServiceProvider { }
    export class GeocodeServiceProvider { }
    export class ArcgisOnlineProvider { }
    export class GeoLookupControl { }

    // สร้าง namespace สำหรับการใช้งาน
    export namespace Geocoding {
        export function geocode(options: any): any;
        export function suggest(options: any): any;
        export function reverse(options: any): any;
    }
}