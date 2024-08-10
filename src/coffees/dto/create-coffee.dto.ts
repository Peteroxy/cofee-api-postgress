
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, ArrayNotEmpty, IsNotEmpty, isNumber } from 'class-validator';

export class CreateCoffeeDto {
  

  @ApiProperty({ description: 'The name of the coffee'})
  @IsNotEmpty()
  @IsString() 
  readonly name: string;

  @ApiProperty({ description: 'The brand of the coffee'})
  @IsString()
  @IsNotEmpty()
  readonly brand: string;

  @ApiProperty({example: []})
  @IsString({ each: true })
  @IsArray()
  @ArrayNotEmpty()
  readonly flavors: string[];
}
