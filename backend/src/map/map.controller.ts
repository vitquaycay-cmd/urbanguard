import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { skipAllThrottles } from '../common/throttle-skip';
import { MapService } from './map.service';

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @SkipThrottle(skipAllThrottles)
  @Get()
  placeholder() {
    return this.mapService.getModuleInfo();
  }
}
