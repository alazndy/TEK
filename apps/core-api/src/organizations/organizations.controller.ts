import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { OrganizationsService } from "./organizations.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("organizations")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new organization" })
  create(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @CurrentUser() user: any,
  ) {
    // Assuming user.userId comes from JWT
    return this.organizationsService.create(createOrganizationDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: "Get all organizations" })
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an organization by ID" })
  findOne(@Param("id") id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an organization" })
  update(
    @Param("id") id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an organization" })
  remove(@Param("id") id: string) {
    return this.organizationsService.remove(id);
  }
}
