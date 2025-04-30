import { NextRequest, NextResponse } from 'next/server';
import { BaseController } from './BaseController';
import { FarmerModel } from '../models/FarmerModel';
import { FarmerService } from '../services/FarmerService';

export class FarmerController extends BaseController<FarmerModel> {
    private farmerService: FarmerService;

    constructor(farmerService: FarmerService) {
        super(farmerService);
        this.farmerService = farmerService;
    }

    async registerFarmer(req: NextRequest): Promise<NextResponse> {
        try {
            const data = await req.json();
            const {
                email, password, namePrefix, firstName, lastName,
                identificationNumber, birthDate, gender, houseNo,
                villageName, moo, road, alley, subDistrict,
                district, provinceName, zipCode, phoneNumber, mobilePhoneNumber
            } = data;

            // Basic validation
            if (!email || !password || !firstName || !lastName || !identificationNumber) {
                return NextResponse.json(
                    { message: 'Required fields missing' },
                    { status: 400 }
                );
            }

            // Validate identification number
            const isValidID = await this.farmerService.validateIdentificationNumber(identificationNumber);
            if (!isValidID) {
                return NextResponse.json(
                    { message: 'Invalid identification number' },
                    { status: 400 }
                );
            }

            // Convert string date to Date object if needed
            const parsedBirthDate = birthDate ? new Date(birthDate) : new Date();

            const farmer = await this.farmerService.registerFarmer({
                email,
                password,
                namePrefix: namePrefix || '',
                firstName,
                lastName,
                identificationNumber,
                birthDate: parsedBirthDate,
                gender: gender || '',
                houseNo: houseNo || '',
                villageName: villageName || '',
                moo: Number(moo) || 0,
                road: road || '',
                alley: alley || '',
                subDistrict,
                district,
                provinceName,
                zipCode,
                phoneNumber: phoneNumber || '',
                mobilePhoneNumber
            });

            // Remove sensitive data before returning
            const farmerJson = farmer.toJSON();

            return NextResponse.json(farmerJson, { status: 201 });
        } catch (error: any) {
            if (error.message.includes('already exists')) {
                return NextResponse.json(
                    { message: error.message },
                    { status: 409 }
                );
            }
            return this.handleControllerError(error);
        }
    }

    async getFarmerProfile(req: NextRequest, { params }: { params: { userId: string } }): Promise<NextResponse> {
        try {
            const userId = params.userId;
            const farmer = await this.farmerService.getFarmerByUserId(userId);

            if (!farmer) {
                return NextResponse.json(
                    { message: 'Farmer profile not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json(farmer.toJSON(), { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    async updateFarmerProfile(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
        try {
            const farmerId = params.id;
            const data = await req.json();

            // If updating ID number, validate it
            if (data.identificationNumber) {
                const isValidID = await this.farmerService.validateIdentificationNumber(data.identificationNumber);
                if (!isValidID) {
                    return NextResponse.json(
                        { message: 'Invalid identification number' },
                        { status: 400 }
                    );
                }
            }

            const updatedFarmer = await this.farmerService.updateFarmerProfile(farmerId, data);

            if (!updatedFarmer) {
                return NextResponse.json(
                    { message: 'Farmer not found or update failed' },
                    { status: 404 }
                );
            }

            return NextResponse.json(updatedFarmer.toJSON(), { status: 200 });
        } catch (error: any) {
            if (error.message.includes('already in use')) {
                return NextResponse.json(
                    { message: error.message },
                    { status: 409 }
                );
            }
            return this.handleControllerError(error);
        }
    }

    async getFarmersByDistrict(req: NextRequest): Promise<NextResponse> {
        try {
            const { searchParams } = new URL(req.url);
            const district = searchParams.get('district');

            if (!district) {
                return NextResponse.json(
                    { message: 'District parameter is required' },
                    { status: 400 }
                );
            }

            const farmers = await this.farmerService.getFarmersByDistrict(district);
            const farmersJson = farmers.map(farmer => farmer.toJSON());

            return NextResponse.json(farmersJson, { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    async getFarmersByProvince(req: NextRequest): Promise<NextResponse> {
        try {
            const { searchParams } = new URL(req.url);
            const province = searchParams.get('province');

            if (!province) {
                return NextResponse.json(
                    { message: 'Province parameter is required' },
                    { status: 400 }
                );
            }

            const farmers = await this.farmerService.getFarmersByProvince(province);
            const farmersJson = farmers.map(farmer => farmer.toJSON());

            return NextResponse.json(farmersJson, { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    protected async createModel(data: any): Promise<FarmerModel> {
        const birthDate = data.birthDate ? new Date(data.birthDate) : new Date();

        return FarmerModel.createFarmer(
            data.email,
            data.password,
            data.namePrefix || '',
            data.firstName,
            data.lastName,
            data.identificationNumber,
            birthDate,
            data.gender || '',
            data.houseNo || '',
            data.villageName || '',
            Number(data.moo) || 0,
            data.road || '',
            data.alley || '',
            data.subDistrict,
            data.district,
            data.provinceName,
            data.zipCode,
            data.phoneNumber || '',
            data.mobilePhoneNumber
        );
    }
}