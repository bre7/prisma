import {
  arg,
  Command,
  format,
  getConfig,
  getDMMF,
  getSchemaPath,
  HelpError,
} from '@prisma/sdk'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'

/**
 * $ prisma validate
 */
export class Validate implements Command {
  public static new(): Validate {
    return new Validate()
  }

  // static help template
  private static help = format(`
    Validate a Prisma schema.

    ${chalk.bold('Usage')}

    With an existing schema.prisma:
      ${chalk.dim('$')} prisma validate

    Or specify a schema:
      ${chalk.dim('$')} prisma validate --schema=./schema.prisma

  `)

  // parse arguments
  public async parse(argv: string[]): Promise<string | Error> {
    const args = arg(argv, {
      '--help': Boolean,
      '-h': '--help',
      '--schema': String,
      '--telemetry-information': String,
    })

    if (args instanceof Error) {
      return this.help(args.message)
    }

    if (args['--help']) {
      return this.help()
    }

    const schemaPath = await getSchemaPath(args['--schema'])

    if (!schemaPath) {
      throw new Error(
        `Either provide ${chalk.greenBright('--schema')} ${chalk.bold(
          'or',
        )} configure a path in your package.json in a \`prisma.schema\` field ${chalk.bold(
          'or',
        )} make sure that you are in a folder with a ${chalk.greenBright(
          'schema.prisma',
        )} file.`,
      )
    }

    console.log(
      chalk.dim(
        `Prisma Schema loaded from ./${path.relative(
          process.cwd(),
          schemaPath,
        )}`,
      ),
    )

    const schema = fs.readFileSync(schemaPath, 'utf-8')

    await getDMMF({
      datamodel: schema,
    })

    await getConfig({
      datamodel: schema,
    })

    return `The schema at ${chalk.underline(schemaPath)} is valid 🚀`
  }

  // help message
  public help(error?: string): string | HelpError {
    if (error) {
      return new HelpError(
        `\n${chalk.bold.red(`!`)} ${error}\n${Validate.help}`,
      )
    }
    return Validate.help
  }
}
