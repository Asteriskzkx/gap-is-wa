import { BaseService } from './BaseService';
import { PlantingDetailModel } from '../models/PlantingDetailModel';
import { PlantingDetailRepository } from '../repositories/PlantingDetailRepository';

export class PlantingDetailService extends BaseService<PlantingDetailModel> {
    private plantingDetailRepository: PlantingDetailRepository;

    constructor(plantingDetailRepository: PlantingDetailRepository) {
        super(plantingDetailRepository);
        this.plantingDetailRepository = plantingDetailRepository;
    }

    async createPlantingDetail(detailData: {
        rubberFarmId: number;
        specie: string;
        areaOfPlot: number;
        numberOfRubber: number;
        numberOfTapping: number;
        ageOfRubber: number;
        yearOfTapping: Date | string;
        monthOfTapping: Date | string;
        totalProduction: number;
    }): Promise<PlantingDetailModel> {
        try {
            // ตรวจสอบและแปลงค่าทุกชนิดให้ถูกต้อง
            const yearOfTapping = detailData.yearOfTapping instanceof Date
                ? detailData.yearOfTapping
                : new Date(detailData.yearOfTapping || new Date());

            const monthOfTapping = detailData.monthOfTapping instanceof Date
                ? detailData.monthOfTapping
                : new Date(detailData.monthOfTapping || new Date());

            // เพิ่ม logs เพื่อ debug
            console.log("Creating planting detail with validated data:", {
                rubberFarmId: detailData.rubberFarmId,
                specie: detailData.specie,
                areaOfPlot: detailData.areaOfPlot,
                numberOfRubber: detailData.numberOfRubber,
                numberOfTapping: detailData.numberOfTapping,
                ageOfRubber: detailData.ageOfRubber,
                yearOfTapping,
                monthOfTapping,
                totalProduction: detailData.totalProduction
            });

            const plantingDetailModel = PlantingDetailModel.create(
                Number(detailData.rubberFarmId),
                String(detailData.specie).trim(),
                Number(detailData.areaOfPlot),
                Number(detailData.numberOfRubber),
                Number(detailData.numberOfTapping),
                Number(detailData.ageOfRubber),
                yearOfTapping,
                monthOfTapping,
                Number(detailData.totalProduction)
            );

            return await this.create(plantingDetailModel);
        } catch (error) {
            this.handleServiceError(error);
            throw error;
        }
    }

    async getPlantingDetailsByRubberFarmId(rubberFarmId: number): Promise<PlantingDetailModel[]> {
        try {
            return await this.plantingDetailRepository.findByRubberFarmId(rubberFarmId);
        } catch (error) {
            this.handleServiceError(error);
            return [];
        }
    }

    async updatePlantingDetail(
        plantingDetailId: number,
        detailData: Partial<PlantingDetailModel>
    ): Promise<PlantingDetailModel | null> {
        try {
            return await this.update(plantingDetailId, detailData);
        } catch (error) {
            this.handleServiceError(error);
            return null;
        }
    }
}