import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export default class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  client: PrismaClient

  constructor() {
    super({
      log: ['warn', 'error'],
    })
  }

  onModuleDestroy() {
    return this.$connect()
  }

  onModuleInit() {
    return this.$disconnect()
  }
}
