import { NextRequest, NextResponse } from 'next/server';
import { rubberFarmController } from '@/utils/dependencyInjections';

// Route handler for updating a rubber farm certification
export async function POST(req: NextRequest) {
    try {
        // Get authorization header to validate user
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: 'Authorization required' },
                { status: 401 }
            );
        }

        // Extract data from request
        const data = await req.json();
        const { farmData, plantingDetailsData } = data;

        // Validation
        if (!farmData || !farmData.rubberFarmId || !plantingDetailsData) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Call controller method to process the update
        const result = await rubberFarmController.updateCertification(req);

        return NextResponse.json(
            { message: 'Certification update request submitted successfully', data: result },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error updating certification:', error);
        return NextResponse.json(
            { message: error.message || 'Failed to process certification update' },
            { status: 500 }
        );
    }
}