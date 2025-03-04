import { InlineKeyboard } from 'grammy'
import { load } from 'js-yaml'
import { readFileSync, readdirSync } from 'fs'
import Context from '@/models/Context'

interface YamlWithName {
  name: string
}

export const localeActions = localesFiles().map((file) => file.split('.')[0])

export function sendLanguage(ctx: Context) {
  return ctx.reply(ctx.i18n.t('language'), {
    reply_markup: languageKeyboard(),
    reply_to_message_id: ctx.message?.message_id,
  })
}

export async function setLanguage(ctx: Context) {
  await ctx.answerCallbackQuery()
  if (!ctx.callbackQuery?.data) {
    return
  }
  ctx.dbchat.language = ctx.callbackQuery.data
  await ctx.dbchat.save()
  ctx.i18n.locale(ctx.callbackQuery.data)
  return ctx.editMessageText(ctx.i18n.t('language_selected'), {
    parse_mode: 'HTML',
  })
}

function languageKeyboard() {
  const locales = localesFiles()
  const keyboard = new InlineKeyboard()
  locales.forEach((locale, index) => {
    const localeCode = locale.split('.')[0]
    const localeName = (
      load(
        readFileSync(`${__dirname}/../../locales/${locale}`, 'utf8')
      ) as YamlWithName
    ).name as string
    keyboard.text(localeName, localeCode)
    if (index % 2 != 0) {
      keyboard.row()
    }
  })
  return keyboard
}

function localesFiles() {
  return readdirSync(`${__dirname}/../../locales`)
}
