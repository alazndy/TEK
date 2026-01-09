import { IsString, IsIn } from "class-validator";

export class AddJobDto {
  @IsString()
  fileName: string;

  @IsString()
  fileUrl: string;

  @IsString()
  @IsIn(["2d", "3d", "cad"])
  fileType: "2d" | "3d" | "cad";
}
