
import { IsString, IsNumber, IsOptional, IsArray, ArrayNotEmpty, IsNotEmpty } from 'class-validator';

export class CreateCoffeeDto {
  @IsNumber()
  readonly id: number;  
  
  @IsNotEmpty()
  @IsString() 
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly brand: string;

  @IsString({ each: true })
  @IsArray()
  @ArrayNotEmpty()
  readonly flavors: string[];

  @IsNumber()
  @IsOptional()
  readonly price?: number;
}
