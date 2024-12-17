import {
  Body,
  Controller,
  HttpCode,
  Post,
  ConflictException,
  UsePipes,
} from '@nestjs/common'
import PrismaService from '../prisma/prisma.service'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'

const createdAccountBodySchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(8).max(255),
})

type CreatedAccountBodySchema = z.infer<typeof createdAccountBodySchema>

@Controller('/accounts')
export class CreateAccountController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createdAccountBodySchema))
  async handle(@Body() body: CreatedAccountBodySchema) {
    const { name, email, password } = body
    const userWithSameEmail = await this.prisma.user.findUnique({
      where: { email },
    })
    if (userWithSameEmail) {
      throw new ConflictException('User with same email already exists')
    }
    const hashedPassword = await hash(password, 8)
    await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    })
  }
}
