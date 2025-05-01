import { NextRequest, NextResponse } from 'next/server';
import { BaseController } from './BaseController';
import { AuditorModel } from '../models/AuditorModel';
import { AuditorService } from '../services/AuditorService';
import { requireValidId, isValidId } from '../utils/ParamUtils';

export class AuditorController extends BaseController<AuditorModel> {
    private auditorService: AuditorService;

    constructor(auditorService: AuditorService) {
        super(auditorService);
        this.auditorService = auditorService;
    }

    async login(req: NextRequest): Promise<NextResponse> {
        try {
            const data = await req.json();
            const { email, password } = data;

            if (!email || !password) {
                return NextResponse.json(
                    { message: 'Email and password are required' },
                    { status: 400 }
                );
            }

            const result = await this.auditorService.login(email, password);

            if (!result) {
                return NextResponse.json(
                    { message: 'Invalid email or password' },
                    { status: 401 }
                );
            }

            const { auditor, token } = result;

            // Remove sensitive data before returning
            const auditorJson = auditor.toJSON();

            return NextResponse.json({ auditor: auditorJson, token }, { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    async registerAuditor(req: NextRequest): Promise<NextResponse> {
        try {
            const data = await req.json();
            const {
                email, password, namePrefix, firstName, lastName
            } = data;

            // Basic validation
            if (!email || !password || !firstName || !lastName) {
                return NextResponse.json(
                    { message: 'Required fields missing' },
                    { status: 400 }
                );
            }

            const auditor = await this.auditorService.registerAuditor({
                email,
                password,
                namePrefix: namePrefix || '',
                firstName,
                lastName
            });

            // Remove sensitive data before returning
            const auditorJson = auditor.toJSON();

            return NextResponse.json(auditorJson, { status: 201 });
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

    async getAuditorProfile(req: NextRequest, { params }: { params: { userId: string } }): Promise<NextResponse> {
        try {
            // แปลง userId จาก string เป็น number
            let userId: number;
            try {
                userId = requireValidId(params.userId, 'userId');
            } catch (error: any) {
                return NextResponse.json(
                    { message: error.message },
                    { status: 400 }
                );
            }

            const auditor = await this.auditorService.getAuditorByUserId(userId);

            if (!auditor) {
                return NextResponse.json(
                    { message: 'Auditor profile not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json(auditor.toJSON(), { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    async updateAuditorProfile(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
        try {
            // แปลง auditorId จาก string เป็น number
            let auditorId: number;
            try {
                auditorId = requireValidId(params.id, 'auditorId');
            } catch (error: any) {
                return NextResponse.json(
                    { message: error.message },
                    { status: 400 }
                );
            }

            const data = await req.json();

            const updatedAuditor = await this.auditorService.updateAuditorProfile(auditorId, data);

            if (!updatedAuditor) {
                return NextResponse.json(
                    { message: 'Auditor not found or update failed' },
                    { status: 404 }
                );
            }

            return NextResponse.json(updatedAuditor.toJSON(), { status: 200 });
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

    async assignAuditorToRegion(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
        try {
            // แปลง auditorId จาก string เป็น number
            let auditorId: number;
            try {
                auditorId = requireValidId(params.id, 'auditorId');
            } catch (error: any) {
                return NextResponse.json(
                    { message: error.message },
                    { status: 400 }
                );
            }

            const data = await req.json();
            const { region } = data;

            if (!region) {
                return NextResponse.json(
                    { message: 'Region is required' },
                    { status: 400 }
                );
            }

            const success = await this.auditorService.assignAuditorToRegion(auditorId, region);

            if (!success) {
                return NextResponse.json(
                    { message: 'Failed to assign auditor to region' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                message: `Auditor successfully assigned to region ${region}`
            }, { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    async getAuditorAssignments(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
        try {
            // แปลง auditorId จาก string เป็น number
            let auditorId: number;
            try {
                auditorId = requireValidId(params.id, 'auditorId');
            } catch (error: any) {
                return NextResponse.json(
                    { message: error.message },
                    { status: 400 }
                );
            }

            const assignments = await this.auditorService.getAuditorAssignments(auditorId);

            return NextResponse.json({ assignments }, { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    protected async createModel(data: any): Promise<AuditorModel> {
        return AuditorModel.createAuditor(
            data.email,
            data.password,
            data.namePrefix || '',
            data.firstName,
            data.lastName
        );
    }
}