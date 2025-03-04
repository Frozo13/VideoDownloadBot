import 'module-alias/register'
import 'reflect-metadata'
import 'source-map-support/register'

import { localeActions } from '@/handlers/language'
import { run } from '@grammyjs/runner'
import { sendLanguage, setLanguage } from '@/handlers/language'
import attachUser from '@/middlewares/attachUser'
import bot from '@/helpers/bot'
import cleanupDownloadJobs from '@/helpers/cleanupDownloadJobs'
import configureI18n from '@/middlewares/configureI18n'
import handleAudio from '@/handlers/handleAudio'
import handleMaxQuality from '@/handlers/handleMaxQuality'
import handleUrl from '@/handlers/handleUrl'
import i18n from '@/helpers/i18n'
import ignoreOldMessageUpdates from '@/middlewares/ignoreOldMessageUpdates'
import report from '@/helpers/report'
import sendHelp from '@/handlers/sendHelp'
import startMongo from '@/helpers/startMongo'
import { resolutionMenu } from './menus/resolutionMenu'

async function runApp() {
  console.log('Starting app...')
  // Mongo
  await startMongo()
  console.log('Mongo connected')
  // Cleanup download jobs
  await cleanupDownloadJobs()
  // Middlewares
  bot.use(ignoreOldMessageUpdates)
  bot.use(attachUser)
  bot.use(i18n.middleware())
  bot.use(configureI18n)
  // Commands
  bot.command(['help', 'start'], sendHelp)
  bot.command('language', sendLanguage)
  bot.command('audio', handleAudio)
  bot.command('max_quality', handleMaxQuality)
  // Menus
  bot.use(resolutionMenu)
  // Handlers
  bot.hears(
    /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?/i,
    handleUrl
  )
  // Actions
  bot.callbackQuery(localeActions, setLanguage)
  // Catch all
  bot.use((ctx) => {
    if (ctx.chat?.type === 'private') {
      return sendHelp(ctx)
    }
  })
  // Errors
  bot.catch((botError) => {
    report(botError.error, { ctx: botError.ctx })
  })
  // Start bot
  await bot.init()
  run(bot, Infinity)
  console.info(`Bot ${bot.botInfo.username} is up and running`)
}

void runApp()
