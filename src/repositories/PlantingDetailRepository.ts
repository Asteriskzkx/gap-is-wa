import { PrismaClient, PlantingDetail as PrismaPlantingDetail } from '@prisma/client';
import { BaseRepository } from './BaseRepository';
import { PlantingDetailModel } from '../models/PlantingDetailModel';

export class PlantingDetailRepository extends BaseRepository<PlantingDetailModel> {

    async create(model: PlantingDetailModel): Promise<PlantingDetailModel> {
        try {
            const plantingDetail = await this.prisma.plantingDetail.create({
                data: {
                    rubberFarmId: model.rubberFarmId,
                    specie: model.specie,
                    areaOfPlot: model.areaOfPlot,
                    numberOfRubber: model.numberOfRubber,
                    numberOfTapping: model.numberOfTapping,
                    ageOfRubber: model.ageOfRubber,
                    yearOfTapping: model.yearOfTapping,
                    monthOfTapping: model.monthOfTapping,
                    totalProduction: model.totalProduction
                }
            });

            return this.mapToModel(plantingDetail);
        } catch (error) {
            return this.handleDatabaseError(error);
        }
    }

    async createMany(models: PlantingDetailModel[]): Promise<PlantingDetailModel[]> {
        try {
            const data = models.map(model => ({
                rubberFarmId: model.rubberFarmId,
                specie: model.specie,
                areaOfPlot: model.areaOfPlot,
                numberOfRubber: model.numberOfRubber,
                numberOfTapping: model.numberOfTapping,
                ageOfRubber: model.ageOfRubber,
                yearOfTapping: model.yearOfTapping,
                monthOfTapping: model.monthOfTapping,
                totalProduction: model.totalProduction
            }));

            // Since createMany doesn't return the created records,
            // we need to create them one by one to return the models
            const createdDetails: PlantingDetailModel[] = [];
            for (const item of data) {
                const detail = await this.prisma.plantingDetail.create({
                    data: item
                });
                createdDetails.push(this.mapToModel(detail));
            }

            return createdDetails;
        } catch (error) {
            console.error('Error creating many planting details:', error);
            throw error;
        }
    }

    async findById(id: number): Promise<PlantingDetailModel | null> {
        try {
            const plantingDetail = await this.prisma.plantingDetail.findUnique({
                where: { plantingDetailId: id }
            });

            return plantingDetail ? this.mapToModel(plantingDetail) : null;
        } catch (error) {
            console.error('Error finding planting detail by ID:', error);
            return null;
        }
    }

    async findByRubberFarmId(rubberFarmId: number): Promise<PlantingDetailModel[]> {
        try {
            const plantingDetails = await this.prisma.plantingDetail.findMany({
                where: { rubberFarmId }
            });

            return plantingDetails.map(detail => this.mapToModel(detail));
        } catch (error) {
            console.error('Error finding planting details by rubber farm ID:', error);
            return [];
        }
    }

    async findAll(): Promise<PlantingDetailModel[]> {
        try {
            const plantingDetails = await this.prisma.plantingDetail.findMany();
            return plantingDetails.map(detail => this.mapToModel(detail));
        } catch (error) {
            console.error('Error finding all planting details:', error);
            return [];
        }
    }

    async update(id: number, data: Partial<PlantingDetailModel>): Promise<PlantingDetailModel | null> {
        try {
            const updatedPlantingDetail = await this.prisma.plantingDetail.update({
                where: { plantingDetailId: id },
                data: {
                    specie: data.specie,
                    areaOfPlot: data.areaOfPlot,
                    numberOfRubber: data.numberOfRubber,
                    numberOfTapping: data.numberOfTapping,
                    ageOfRubber: data.ageOfRubber,
                    yearOfTapping: data.yearOfTapping,
                    monthOfTapping: data.monthOfTapping,
                    totalProduction: data.totalProduction,
                    updatedAt: new Date()
                }
            });

            return this.mapToModel(updatedPlantingDetail);
        } catch (error) {
            console.error('Error updating planting detail:', error);
            return null;
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            await this.prisma.plantingDetail.delete({
                where: { plantingDetailId: id }
            });

            return true;
        } catch (error) {
            console.error('Error deleting planting detail:', error);
            return false;
        }
    }

    private mapToModel(prismaPlantingDetail: PrismaPlantingDetail): PlantingDetailModel {
        return new PlantingDetailModel(
            prismaPlantingDetail.plantingDetailId,
            prismaPlantingDetail.rubberFarmId,
            prismaPlantingDetail.specie,
            prismaPlantingDetail.areaOfPlot,
            prismaPlantingDetail.numberOfRubber,
            prismaPlantingDetail.numberOfTapping,
            prismaPlantingDetail.ageOfRubber,
            prismaPlantingDetail.yearOfTapping,
            prismaPlantingDetail.monthOfTapping,
            prismaPlantingDetail.totalProduction,
            prismaPlantingDetail.createdAt,
            prismaPlantingDetail.updatedAt
        );
    }
}