import { Shipment } from "@fullstack-logistic-wrk/prisma";

export class VehicleShipmentAssignationDto {
    vehicles: {
        vehicleNumber: number;
        shipments: Pick<Shipment, "id" | "weight">[];
        totalWeight: number;
        remainingCapacity: number;
    }[];
    totalVechiclesUsed: number;
    totalWeight: number;
}
