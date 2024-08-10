// import { Module } from '@nestjs/common';
// import { CoffeesController } from './coffees.controller';
// import { CoffeesService } from './coffees.service';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Coffee } from './entities/coffee.entity';
// import { Flavor } from './entities/flavour.entity';

// @Module(
//   {
//     imports:[TypeOrmModule.forFeature([Coffee, Flavor, Event])],
//     controllers: [CoffeesController],
//     providers: [CoffeesService],
//   })
// export class CoffeesModule {}



import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavour.entity';
import { Event } from 'src/events/entities/event.entity/event.entity';
import { ConfigModule } from '@nestjs/config';
import { LoggingMiddleware } from 'src/common/middleware/logging/logging.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Coffee, Flavor, Event]), ConfigModule],
  controllers: [CoffeesController],
  providers: [CoffeesService],
  exports: [CoffeesService]
})
export class CoffeesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
