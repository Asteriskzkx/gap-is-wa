import { NextRequest, NextResponse } from 'next/server';
import { FarmerController } from '@/controllers/FarmerController';
import { FarmerService } from '@/services/FarmerService';
import { FarmerRepository } from '@/repositories/FarmerRepository';
import { UserService } from '@/services/UserService';
import { UserRepository } from '@/repositories/UserRepository';

// Initialize the dependency chain
const farmerRepository = new FarmerRepository();
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const farmerService = new FarmerService(farmerRepository, userService);
const farmerController = new FarmerController(farmerService);

// Route handlers for a specific farmer by ID
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return farmerController.getById(req, { params });
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return farmerController.updateFarmerProfile(req, { params });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return farmerController.delete(req, { params });
}