export class CreateProductDto {
  name: string;
  barcode: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  manufacturer?: string;
}
