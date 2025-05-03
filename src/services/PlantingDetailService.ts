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
        yearOfTapping: Date;
        monthOfTapping: Date;
        totalProduction: number;
    }): Promise<PlantingDetailModel> {
        try {
            const plantingDetailModel = PlantingDetailModel.create(
                detailData.rubberFarmId,
                detailData.specie,
                detailData.areaOfPlot,
                detailData.numberOfRubber,
                detailData.numberOfTapping,
                detailData.ageOfRubber,
                detailData.yearOfTapping,
                detailData.monthOfTapping,
                detailData.totalProduction
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