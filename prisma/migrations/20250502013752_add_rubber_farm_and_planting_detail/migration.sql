-- CreateTable
CREATE TABLE "RubberFarm" (
    "rubberFarmId" SERIAL NOT NULL,
    "farmerId" INTEGER NOT NULL,
    "villageName" TEXT NOT NULL,
    "moo" INTEGER NOT NULL,
    "road" TEXT NOT NULL,
    "alley" TEXT NOT NULL,
    "subDistrict" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "location" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RubberFarm_pkey" PRIMARY KEY ("rubberFarmId")
);

-- CreateTable
CREATE TABLE "PlantingDetail" (
    "plantingDetailId" SERIAL NOT NULL,
    "rubberFarmId" INTEGER NOT NULL,
    "specie" TEXT NOT NULL,
    "areaOfPlot" DOUBLE PRECISION NOT NULL,
    "numberOfRubber" INTEGER NOT NULL,
    "numberOfTapping" INTEGER NOT NULL,
    "ageOfRubber" INTEGER NOT NULL,
    "yearOfTapping" TIMESTAMP(3) NOT NULL,
    "monthOfTapping" TIMESTAMP(3) NOT NULL,
    "totalProduction" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantingDetail_pkey" PRIMARY KEY ("plantingDetailId")
);

-- AddForeignKey
ALTER TABLE "RubberFarm" ADD CONSTRAINT "RubberFarm_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("farmerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantingDetail" ADD CONSTRAINT "PlantingDetail_rubberFarmId_fkey" FOREIGN KEY ("rubberFarmId") REFERENCES "RubberFarm"("rubberFarmId") ON DELETE CASCADE ON UPDATE CASCADE;
