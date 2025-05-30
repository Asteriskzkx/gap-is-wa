import { BaseModel } from "./BaseModel";

export class DataRecordModel extends BaseModel {
  dataRecordId: number;
  inspectionId: number;
  species: any; // JSON data
  waterSystem: any; // JSON data
  fertilizers: any; // JSON data
  previouslyCultivated: any; // JSON data
  plantDisease: any; // JSON data
  relatedPlants: any; // JSON data
  moreInfo: string;
  map: any; // JSON data for GeoJSON

  constructor(
    dataRecordId: number,
    inspectionId: number,
    species: any,
    waterSystem: any,
    fertilizers: any,
    previouslyCultivated: any,
    plantDisease: any,
    relatedPlants: any,
    moreInfo: string,
    map: any,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super(dataRecordId, createdAt, updatedAt);
    this.dataRecordId = dataRecordId;
    this.inspectionId = inspectionId;
    this.species = species;
    this.waterSystem = waterSystem;
    this.fertilizers = fertilizers;
    this.previouslyCultivated = previouslyCultivated;
    this.plantDisease = plantDisease;
    this.relatedPlants = relatedPlants;
    this.moreInfo = moreInfo;
    this.map = map;
  }

  static create(
    inspectionId: number,
    species: any,
    waterSystem: any,
    fertilizers: any,
    previouslyCultivated: any,
    plantDisease: any,
    relatedPlants: any,
    moreInfo: string,
    map: any
  ): DataRecordModel {
    return new DataRecordModel(
      0, // dataRecordId will be generated by the database
      inspectionId,
      species,
      waterSystem,
      fertilizers,
      previouslyCultivated,
      plantDisease,
      relatedPlants,
      moreInfo,
      map
    );
  }

  validate(): boolean {
    return (
      this.inspectionId > 0 &&
      this.species !== null &&
      this.waterSystem !== null &&
      this.fertilizers !== null &&
      this.previouslyCultivated !== null &&
      this.plantDisease !== null &&
      this.relatedPlants !== null &&
      this.moreInfo.trim().length > 0 &&
      this.map !== null
    );
  }

  toJSON(): Record<string, any> {
    return {
      dataRecordId: this.dataRecordId,
      inspectionId: this.inspectionId,
      species: this.species,
      waterSystem: this.waterSystem,
      fertilizers: this.fertilizers,
      previouslyCultivated: this.previouslyCultivated,
      plantDisease: this.plantDisease,
      relatedPlants: this.relatedPlants,
      moreInfo: this.moreInfo,
      map: this.map,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
