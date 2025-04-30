import { NextRequest, NextResponse } from 'next/server';
import { BaseController } from './BaseController';
import { UserModel } from '../models/UserModel';
import { UserService } from '../services/UserService';

export class UserController extends BaseController<UserModel> {
    private userService: UserService;

    constructor(userService: UserService) {
        super(userService);
        this.userService = userService;
    }

    async register(req: NextRequest): Promise<NextResponse> {
        try {
            const data = await req.json();
            const { email, password, name, role } = data;

            if (!email || !password || !name) {
                return NextResponse.json(
                    { message: 'Email, password, and name are required' },
                    { status: 400 }
                );
            }

            const user = await this.userService.register({ email, password, name, role });

            // Remove sensitive data before returning
            const userJson = user.toJSON();

            return NextResponse.json(userJson, { status: 201 });
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

            const result = await this.userService.login(email, password);

            if (!result) {
                return NextResponse.json(
                    { message: 'Invalid email or password' },
                    { status: 401 }
                );
            }

            const { user, token } = result;

            // Remove sensitive data before returning
            const userJson = user.toJSON();

            return NextResponse.json({ user: userJson, token }, { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    async changePassword(req: NextRequest): Promise<NextResponse> {
        try {
            const data = await req.json();
            const { userId, currentPassword, newPassword } = data;

            if (!userId || !currentPassword || !newPassword) {
                return NextResponse.json(
                    { message: 'User ID, current password, and new password are required' },
                    { status: 400 }
                );
            }

            const success = await this.userService.changePassword(userId, currentPassword, newPassword);

            if (!success) {
                return NextResponse.json(
                    { message: 'Invalid user ID or current password' },
                    { status: 401 }
                );
            }

            return NextResponse.json({ message: 'Password changed successfully' }, { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    async getCurrentUser(req: NextRequest): Promise<NextResponse> {
        try {
            const authHeader = req.headers.get('Authorization');

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return NextResponse.json(
                    { message: 'No authentication token provided' },
                    { status: 401 }
                );
            }

            const token = authHeader.split(' ')[1];
            const decoded = this.userService.verifyToken(token);

            if (!decoded) {
                return NextResponse.json(
                    { message: 'Invalid or expired token' },
                    { status: 401 }
                );
            }

            const user = await this.userService.getById(decoded.userId);

            if (!user) {
                return NextResponse.json(
                    { message: 'User not found' },
                    { status: 404 }
                );
            }

            // Remove sensitive data before returning
            const userJson = user.toJSON();

            return NextResponse.json(userJson, { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    protected async createModel(data: any): Promise<UserModel> {
        return UserModel.create(
            data.email,
            data.password,
            data.name,
            data.role
        );
    }
}