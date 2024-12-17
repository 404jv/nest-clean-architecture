import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcryptjs'
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe'
import PrismaService from 'src/prisma/prisma.service'
import { z } from 'zod'

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(255),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Controller('/session')
export class AuthenticateController {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() { email, password }: AuthenticateBodySchema) {
    console.log(email, password)
    const user = await this.prisma.user.findUnique({
      where: { email },
    })
    if (user === null) {
      throw new UnauthorizedException('Invalid credentials.')
    }
    const isPasswordValid = await compare(password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.')
    }
    const accessToken = this.jwt.sign({ sub: user.id })
    return {
      access_token: accessToken,
    }
  }
}
