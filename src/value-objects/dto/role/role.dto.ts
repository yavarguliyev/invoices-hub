import { Expose } from 'class-transformer';

import { Roles } from 'value-objects/enums/roles.enum';

export class RoleDto {
  @Expose()
  id: number;

  @Expose()
  name: Roles;
}
