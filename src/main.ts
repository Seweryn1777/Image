import { ShutdownSignal, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as basicAuth from 'express-basic-auth'
import { json } from 'body-parser'
import { AppModule } from 'modules/app'
import { getConfig } from 'lib/config'
import { R } from 'lib/utils'
import { HttpMethodGuard } from 'lib/guards'
import { ContentTypeInterceptor } from 'lib/interceptors'
import metadata from './metadata'

const bootstrap = async () => {
  const {
    expressConfig,
    validationPipeConfig,
    bodyParserConfig,
    corsConfig,
    swaggerConfig
  } = getConfig()
  const { port, host } = expressConfig

  const app = await NestFactory.create(AppModule)

  app.use(
    helmet({
      noSniff: true,
      hidePoweredBy: true
    })
  )
  app.enableCors(corsConfig)
  app.useGlobalGuards(new HttpMethodGuard())
  app.useGlobalInterceptors(new ContentTypeInterceptor())
  app.use(json(bodyParserConfig))
  app.useGlobalPipes(new ValidationPipe(validationPipeConfig))
  app.enableShutdownHooks([ShutdownSignal.SIGINT, ShutdownSignal.SIGTERM])

  if (R.isDefined(swaggerConfig.useSwagger)) {
    app.use(
      [swaggerConfig.route],
      basicAuth.default({
        challenge: true,
        users: {
          [swaggerConfig.login]: swaggerConfig.password
        }
      })
    )

    await SwaggerModule.loadPluginMetadata(metadata)
    const config = new DocumentBuilder().build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup(swaggerConfig.route, app, document)
  }

  await app.listen(port, host)
}

bootstrap()
