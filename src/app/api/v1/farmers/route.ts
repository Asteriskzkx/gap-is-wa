import { NextRequest, NextResponse } from 'next/server';
import { farmerController } from '@/utils/dependencyInjections';

// Route handlers
export async function GET(req: NextRequest) {
    // Check if it's a filtered request
    const url = new URL(req.url);

    if (url.searchParams.has('district')) {
        return farmerController.getFarmersByDistrict(req);
    } else if (url.searchParams.has('province')) {
        return farmerController.getFarmersByProvince(req);
    }

    // Otherwise return all farmers
    return farmerController.getAll(req);
}

export async function POST(req: NextRequest) {
    // For farmer registration
    const path = req.nextUrl.pathname;

    if (path.endsWith('/register')) {
        return farmerController.registerFarmer(req);
    }

    // Default to create a new farmer
    return farmerController.create(req);
}