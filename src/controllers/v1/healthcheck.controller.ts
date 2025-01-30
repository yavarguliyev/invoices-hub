import { JsonController, Get, Authorized } from 'routing-controllers';

import { createVersionedRoute } from 'helpers/utility-functions.helper';
import { IHealthcheckService } from 'services/healthcheck.service';
import { ContainerHelper } from 'ioc/helpers/container.helper';
import { ContainerItems } from 'ioc/static/container-items';
import { Roles } from 'value-objects/enums/roles.enum';

@Authorized([Roles.GlobalAdmin, Roles.Admin])
@JsonController(createVersionedRoute('/healthcheck', 'v1'))
export class HealthcheckController {
  private healthCheckService: IHealthcheckService;

  constructor () {
    this.healthCheckService = ContainerHelper.get<IHealthcheckService>(ContainerItems.IHealthcheckService);
  }

  @Get('/')
  async healthcheck () {
    return await this.healthCheckService.healthcheck();
  }
}
