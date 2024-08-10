// import { Injectable, NotFoundException } from '@nestjs/common';
// import { Coffee } from './entities/coffee.entity';
// import { CreateCoffeeDto } from './dto/create-coffee.dto';
// import { UpdateCoffeeDto } from './dto/update-coffee.dto';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Connection, Repository } from 'typeorm';
// import { Flavor } from './entities/flavour.entity';
// import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';

// @Injectable()
// export class CoffeesService {
//   constructor(
//     @InjectRepository(Coffee)
//     private readonly coffeeRepository: Repository<Coffee>,

//     @InjectRepository(Flavor)
//     private readonly flavorRepository: Repository<Flavor>,

//     private readonly connection:Connection
//   ){}

//   findAll(paginationQuery: PaginationQueryDto) {
//     const {limit, offset} = paginationQuery
//     return this.coffeeRepository.find({
//       relations: ['flavors'],
//       skip: offset,
//       take: limit
//     });
//   }

//   async findOne(id: number): Promise<Coffee> {
//     const coffee = await this.coffeeRepository.findOne({ where: { id }, relations: ['flavors']});
//     if (!coffee) {
//       throw new NotFoundException(`Coffee #${id} was not found`);
//     }
//     return coffee;
//   }

//   async create(createCoffeeDto: CreateCoffeeDto): Promise<Coffee> {
//     const flavors = await Promise.all(
//       createCoffeeDto.flavors.map(name => this.preloadFlavorByName(name))
//     )
//     const coffee = this.coffeeRepository.create({
//       ...createCoffeeDto,
//       flavors
//     });
//     return this.coffeeRepository.save(coffee);

    
//   }

//   async update(id: number, updateCoffeeDto: UpdateCoffeeDto): Promise<Coffee> {
//     const flavors = updateCoffeeDto.flavors && (await Promise.all(updateCoffeeDto.flavors.map(name => this.preloadFlavorByName(name))))
    
//     const coffee = await this.coffeeRepository.preload({
//       id: +id,
//       ...updateCoffeeDto,
//       flavors
//     });

//     if (!coffee) {
//       throw new NotFoundException(`Coffee #${id} not found`);
//     }
//     return this.coffeeRepository.save(coffee);
//   }

//   async remove(id: number): Promise<Coffee> {
//     const coffee = await this.coffeeRepository.findOne({ where: { id } });
//     if (!coffee) {
//       throw new NotFoundException(`Coffee #${id} not found`);
//     }
//     return this.coffeeRepository.remove(coffee);
//   }

//   async recommendCoffee(coffee: Coffee) {
//     const queryRunner = this.connection.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       coffee.recommendations++;
//       const recommendEvent = new Event();
//       recommendEvent.name = 'recommend_coffee';
//       recommendEvent.type = 'coffee';
//       recommendEvent.payload = { coffeeId: coffee.id };


//       await queryRunner.manager.save(coffee);
//       await queryRunner.manager.save(recommendEvent);

//       await queryRunner.commitTransaction();
//     }
//     catch (err) {
//       await queryRunner.rollbackTransaction();

//     }
//     finally {
//       await queryRunner.release()
//     }
//   }

//   private async preloadFlavorByName(name: string): Promise<Flavor>{
//     const existingFlavor = await this.flavorRepository.findOne({ where: { name } });
//     if (existingFlavor) {
//       return existingFlavor
//     }
//     return this.flavorRepository.create({name})
//   }
// }





import { Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource} from 'typeorm';
import { Flavor } from './entities/flavour.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto/pagination-query.dto';
import { Event } from 'src/events/entities/event.entity/event.entity'; 
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,

    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,

    private readonly dataSource: DataSource,

    private readonly configService: ConfigService
  ){}

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.coffeeRepository.find({
      relations: ['flavors'],
      skip: offset,
      take: limit
    });
  }

  async findOne(id: number): Promise<Coffee> {
    const coffee = await this.coffeeRepository.findOne({ where: { id }, relations: ['flavors']});
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} was not found`);
    }
    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto): Promise<Coffee> {
    const flavors = await Promise.all(
      createCoffeeDto.flavors.map(name => this.preloadFlavorByName(name))
    );
    const coffee = this.coffeeRepository.create({
      ...createCoffeeDto,
      flavors
    });
    return this.coffeeRepository.save(coffee);
  }

  async update(id: number, updateCoffeeDto: UpdateCoffeeDto): Promise<Coffee> {
    const flavors = updateCoffeeDto.flavors && (await Promise.all(updateCoffeeDto.flavors.map(name => this.preloadFlavorByName(name))));
    
    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
      flavors
    });

    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return this.coffeeRepository.save(coffee);
  }

  async remove(id: number): Promise<Coffee> { 
    const coffee = await this.coffeeRepository.findOne({ where: { id } });
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return this.coffeeRepository.remove(coffee);
  }

  async recommendCoffee(coffee: Coffee) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      coffee.recommendations++;
      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = { coffeeId: coffee.id };

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);

      await queryRunner.commitTransaction();
    }
    catch (err) {
      await queryRunner.rollbackTransaction();
    }
    finally {
      await queryRunner.release();
    }
  }

  private async preloadFlavorByName(name: string): Promise<Flavor> {
    const existingFlavor = await this.flavorRepository.findOne({ where: { name } });
    if (existingFlavor) {
      return existingFlavor;
    }
    return this.flavorRepository.create({ name });
  }
}
