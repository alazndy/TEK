import { IsString, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateOrganizationDto {
  @ApiProperty({ example: "Acme Corp" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "acme-corp" })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logoURL?: string;
}
