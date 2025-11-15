import { Test, TestingModule } from '@nestjs/testing'
import supertest from 'supertest'
import { HttpMethodGuard } from './http-method.guard'
import { FakeController } from '../test'

describe('HttpMethodGuard', () => {
  const getHttpServer = async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FakeController]
    }).compile()

    const app = moduleFixture.createNestApplication()

    app.useGlobalGuards(new HttpMethodGuard())

    app.init()

    return {
      httpServer: app.getHttpServer(),
      close: () => app.close()
    }
  }

  it('should pass every whitelisted http method', async () => {
    const { httpServer, close } = await getHttpServer()

    await supertest(httpServer).get('/fake').expect(200)
    await supertest(httpServer).post('/fake').expect(201).then(close)
  })

  it('should block every blacklisted http method', async () => {
    const { httpServer, close } = await getHttpServer()

    return supertest(httpServer).options('/fake').expect(405).then(close)
  })
})
