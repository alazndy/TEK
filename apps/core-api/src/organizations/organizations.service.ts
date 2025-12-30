import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

// Define interface locally if not in core-types yet
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoURL?: string;
  ownerId: string;
  members: string[]; // User IDs
}

@Injectable()
export class OrganizationsService {
  private organizations: Organization[] = [
    {
       id: 'org_1',
       name: 'Acme Corp',
       slug: 'acme-corp',
       ownerId: '123',
       members: ['123'],
       logoURL: 'https://via.placeholder.com/150'
    }
  ];

  create(createOrganizationDto: CreateOrganizationDto, ownerId: string) {
    const newOrganization: Organization = {
      id: `org_${Math.random().toString(36).substring(7)}`,
      name: createOrganizationDto.name,
      slug: createOrganizationDto.slug,
      logoURL: createOrganizationDto.logoURL,
      ownerId,
      members: [ownerId],
    };
    this.organizations.push(newOrganization);
    return newOrganization;
  }

  findAll() {
    return this.organizations;
  }

  findOne(id: string) {
    const org = this.organizations.find(o => o.id === id);
    if (!org) throw new NotFoundException(`Organization #${id} not found`);
    return org;
  }

  update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    const index = this.organizations.findIndex(o => o.id === id);
    if (index === -1) throw new NotFoundException(`Organization #${id} not found`);
    
    const updatedOrg = { ...this.organizations[index], ...updateOrganizationDto };
    this.organizations[index] = updatedOrg;
    return updatedOrg;
  }

  remove(id: string) {
    const index = this.organizations.findIndex(o => o.id === id);
    if (index === -1) throw new NotFoundException(`Organization #${id} not found`);
    this.organizations.splice(index, 1);
    return { deleted: true };
  }
}
