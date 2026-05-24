interface IdModel<T> {
  findUniqueOrThrow: (args: { where: { id: number } }) => Promise<T>
}

export async function requireById<T>(model: IdModel<T>, id: number, notFoundMessage: string): Promise<T> {
  try {
    return await model.findUniqueOrThrow({ where: { id } })
  } catch (err) {
    if ((err as { code?: string })?.code === 'P2025') {
      throw createError({ statusCode: 404, message: notFoundMessage })
    }

    throw err
  }
}
