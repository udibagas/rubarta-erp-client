export interface Material {
  id: number;
  partNumber: string;
  name: string;
  description?: string | null;
  category?: string | null;
  supplierId?: number | null;
  unit?: string | null;
  unitPrice?: number | null;
  currentStock?: number | null;
  minStock?: number | null;
  leadTimeDays?: number | null;
  isActive: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  Supplier?: {
    id: number;
    name: string;
  } | null;
}

export interface CreateMaterialDto {
  partNumber: string;
  name: string;
  description?: string;
  category?: string;
  supplierId?: number;
  unit?: string;
  unitPrice?: number;
  currentStock?: number;
  minStock?: number;
  leadTimeDays?: number;
  isActive?: boolean;
}

export interface UpdateMaterialDto {
  partNumber?: string;
  name?: string;
  description?: string;
  category?: string;
  supplierId?: number;
  unit?: string;
  unitPrice?: number;
  currentStock?: number;
  minStock?: number;
  leadTimeDays?: number;
  isActive?: boolean;
}

export interface QueryMaterialDto {
  keyword?: string;
  category?: string;
  supplierId?: number;
  isActive?: boolean;
  lowStock?: boolean;
}
