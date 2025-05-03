import { BaseService } from './BaseService';
import { RubberFarmModel } from '../models/RubberFarmModel';
import { PlantingDetailModel } from '../models/PlantingDetailModel';
import { RubberFarmRepository } from '../repositories/RubberFarmRepository';
import { PlantingDetailRepository } from '../repositories/PlantingDetailRepository';

export class RubberFarmService extends BaseService<RubberFarmModel> {
    private rubberFarmRepository: RubberFarmRepository;
    private plantingDetailRepository: PlantingDetailRepository;

    constructor(
        rubberFarmRepository: RubberFarmRepository,
        plantingDetailRepository: PlantingDetailRepository
    ) {
        super(rubberFarmRepository);
        this.rubberFarmRepository = rubberFarmRepository;
        this.plantingDetailRepository = plantingDetailRepository;
    }

    async createRubberFarmWithDetails(
        farmData: {
            farmerId: number;
            villageName: string;
            moo: number;
            road: string;
            alley: string;
            subDistrict: string;
            district: string;
            province: string;
            location: any;
        },
        plantingDetailsData: Array<{
            specie: string;
            areaOfPlot: number;
            numberOfRubber: number;
            numberOfTapping: number;
            ageOfRubber: number;
            yearOfTapping: Date;
            monthOfTapping: Date;
            totalProduction: number;
        }>
    ): Promise<RubberFarmModel> {
        try {
            // Create the rubber farm first
            const rubberFarmModel = RubberFarmModel.create(
                farmData.farmerId,
                farmData.villageName,
                farmData.moo,
                farmData.road,
                farmData.alley,
                farmData.subDistrict,
                farmData.district,
                farmData.province,
                farmData.location
            );

            const createdFarm = await this.create(rubberFarmModel);

            // Create the planting details
            if (plantingDetailsData && plantingDetailsData.length > 0) {
                const plantingDetailModels = plantingDetailsData.map(detail =>
                    PlantingDetailModel.create(
                        createdFarm.rubberFarmId,
                        detail.specie,
                        detail.areaOfPlot,
                        detail.numberOfRubber,
                        detail.numberOfTapping,
                        detail.ageOfRubber,
                        detail.yearOfTapping,
                        detail.monthOfTapping,
                        detail.totalProduction
                    )
                );

                const createdDetails = await this.plantingDetailRepository.createMany(plantingDetailModels);

                // Add the created details to the farm
                createdFarm.plantingDetails = createdDetails;
            }

            return createdFarm;
        } catch (error) {
            this.handleServiceError(error);
            throw error;
        }
    }

    async getRubberFarmsByFarmerId(farmerId: number): Promise<RubberFarmModel[]> {
        try {
            return await this.rubberFarmRepository.findByFarmerId(farmerId);
        } catch (error) {
            this.handleServiceError(error);
            return [];
        }
    }

    async getRubberFarmWithDetails(rubberFarmId: number): Promise<RubberFarmModel | null> {
        try {
            const farm = await this.rubberFarmRepository.findById(rubberFarmId);
            if (!farm) {
                return null;
            }

            const details = await this.plantingDetailRepository.findByRubberFarmId(rubberFarmId);
            farm.plantingDetails = details;

            return farm;
        } catch (error) {
            this.handleServiceError(error);
            return null;
        }
    }

    async updateRubberFarm(
        rubberFarmId: number,
        farmData: Partial<RubberFarmModel>
    ): Promise<RubberFarmModel | null> {
        try {
            return await this.update(rubberFarmId, farmData);
        } catch (error) {
            this.handleServiceError(error);
            return null;
        }
    }

    async deleteRubberFarm(rubberFarmId: number): Promise<boolean> {
        try {
            // Check if the farm exists
            const farm = await this.getById(rubberFarmId);
            if (!farm) {
                return false;
            }

            // Delete all planting details first
            const details = await this.plantingDetailRepository.findByRubberFarmId(rubberFarmId);
            for (const detail of details) {
                await this.plantingDetailRepository.delete(detail.plantingDetailId);
            }

            // Then delete the farm
            return await this.delete(rubberFarmId);
        } catch (error) {
            this.handleServiceError(error);
            return false;
        }
    }
}