import { NextRequest, NextResponse } from 'next/server';
import { BaseController } from './BaseController';
import { CommitteeModel } from '../models/CommitteeModel';
import { CommitteeService } from '../services/CommitteeService';
import { requireValidId, isValidId } from '../utils/ParamUtils';

export class CommitteeController extends BaseController<CommitteeModel> {
    private committeeService: CommitteeService;

    constructor(committeeService: CommitteeService) {
        super(committeeService);
        this.committeeService = committeeService;
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

            const result = await this.committeeService.login(email, password);

            if (!result) {
                return NextResponse.json(
                    { message: 'Invalid email or password' },
                    { status: 401 }
                );
            }

            const { committee, token } = result;

            // Remove sensitive data before returning
            const committeeJson = committee.toJSON();

            return NextResponse.json({ committee: committeeJson, token }, { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    async registerCommittee(req: NextRequest): Promise<NextResponse> {
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

            const committee = await this.committeeService.registerCommittee({
                email,
                password,
                namePrefix: namePrefix || '',
                firstName,
                lastName
            });

            // Remove sensitive data before returning
            const committeeJson = committee.toJSON();

            return NextResponse.json(committeeJson, { status: 201 });
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

    async getCommitteeProfile(req: NextRequest, { params }: { params: { userId: string } }): Promise<NextResponse> {
        try {
            // Convert userId from string to number
            let userId: number;
            try {
                userId = requireValidId(params.userId, 'userId');
            } catch (error: any) {
                return NextResponse.json(
                    { message: error.message },
                    { status: 400 }
                );
            }

            const committee = await this.committeeService.getCommitteeByUserId(userId);

            if (!committee) {
                return NextResponse.json(
                    { message: 'Committee profile not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json(committee.toJSON(), { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    async updateCommitteeProfile(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
        try {
            // Convert committeeId from string to number
            let committeeId: number;
            try {
                committeeId = requireValidId(params.id, 'committeeId');
            } catch (error: any) {
                return NextResponse.json(
                    { message: error.message },
                    { status: 400 }
                );
            }

            const data = await req.json();

            const updatedCommittee = await this.committeeService.updateCommitteeProfile(committeeId, data);

            if (!updatedCommittee) {
                return NextResponse.json(
                    { message: 'Committee not found or update failed' },
                    { status: 404 }
                );
            }

            return NextResponse.json(updatedCommittee.toJSON(), { status: 200 });
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

    async reviewAudit(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
        try {
            // Convert committeeId from string to number
            let committeeId: number;
            try {
                committeeId = requireValidId(params.id, 'committeeId');
            } catch (error: any) {
                return NextResponse.json(
                    { message: error.message },
                    { status: 400 }
                );
            }

            const data = await req.json();
            const { auditId, decision, comments } = data;

            if (!auditId || !decision) {
                return NextResponse.json(
                    { message: 'Audit ID and decision are required' },
                    { status: 400 }
                );
            }

            // Convert auditId from string to number if needed
            let auditIdNum: number;
            try {
                auditIdNum = requireValidId(auditId, 'auditId');
            } catch (error: any) {
                return NextResponse.json(
                    { message: error.message },
                    { status: 400 }
                );
            }

            const success = await this.committeeService.reviewAudit(auditIdNum, committeeId, decision, comments || '');

            if (!success) {
                return NextResponse.json(
                    { message: 'Failed to submit audit review' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                message: `Audit review submitted successfully`
            }, { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    async approveCertification(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
        try {
            // Convert committeeId from string to number
            let committeeId: number;
            try {
                committeeId = requireValidId(params.id, 'committeeId');
            } catch (error: any) {
                return NextResponse.json(
                    { message: error.message },
                    { status: 400 }
                );
            }

            const data = await req.json();
            const { applicationId } = data;

            if (!applicationId) {
                return NextResponse.json(
                    { message: 'Application ID is required' },
                    { status: 400 }
                );
            }

            // Convert applicationId from string to number if needed
            let applicationIdNum: number;
            try {
                applicationIdNum = requireValidId(applicationId, 'applicationId');
            } catch (error: any) {
                return NextResponse.json(
                    { message: error.message },
                    { status: 400 }
                );
            }

            const success = await this.committeeService.approveCertification(applicationIdNum, committeeId);

            if (!success) {
                return NextResponse.json(
                    { message: 'Failed to approve certification' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                message: `Certification approved successfully`
            }, { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    protected async createModel(data: any): Promise<CommitteeModel> {
        return CommitteeModel.createCommittee(
            data.email,
            data.password,
            data.namePrefix || '',
            data.firstName,
            data.lastName
        );
    }

}