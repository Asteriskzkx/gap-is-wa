import { NextRequest, NextResponse } from 'next/server';
import { BaseModel } from '../models/BaseModel';
import { BaseService } from '../services/BaseService';

export abstract class BaseController<T extends BaseModel> {
    protected service: BaseService<T>;

    constructor(service: BaseService<T>) {
        this.service = service;
    }

    async getAll(req: NextRequest): Promise<NextResponse> {
        try {
            const items = await this.service.getAll();
            return NextResponse.json(items, { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    async getById(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
        try {
            const id = parseInt(params.id, 10); // แปลง string เป็น number
            if (isNaN(id)) {
                return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
            }

            const item = await this.service.getById(id);

            if (!item) {
                return NextResponse.json({ message: 'Item not found' }, { status: 404 });
            }

            return NextResponse.json(item, { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    async create(req: NextRequest): Promise<NextResponse> {
        try {
            const data = await req.json();
            const item = await this.createModel(data);
            const createdItem = await this.service.create(item);
            return NextResponse.json(createdItem, { status: 201 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    async update(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
        try {
            const id = parseInt(params.id, 10); // แปลง string เป็น number
            if (isNaN(id)) {
                return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
            }

            const data = await req.json();
            const updatedItem = await this.service.update(id, data);

            if (!updatedItem) {
                return NextResponse.json({ message: 'Item not found' }, { status: 404 });
            }

            return NextResponse.json(updatedItem, { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    async delete(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
        try {
            const id = parseInt(params.id, 10); // แปลง string เป็น number
            if (isNaN(id)) {
                return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
            }

            const isDeleted = await this.service.delete(id);

            if (!isDeleted) {
                return NextResponse.json({ message: 'Item not found or could not be deleted' }, { status: 404 });
            }

            return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
        } catch (error) {
            return this.handleControllerError(error);
        }
    }

    protected handleControllerError(error: any): NextResponse {
        console.error('Controller operation failed:', error);
        return NextResponse.json(
            { message: 'An error occurred', error: error.message },
            { status: 500 }
        );
    }

    protected abstract createModel(data: any): Promise<T>;
}