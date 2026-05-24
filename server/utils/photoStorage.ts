import type { Buffer } from 'node:buffer'

import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

import { customAlphabet } from 'nanoid'
import sharp from 'sharp'

const PHOTOS_DIR = process.env.PHOTOS_DIR || join(process.cwd(), 'public', 'uploads', 'photos')

const generateId = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 12)

export async function saveCompressedImage(buffer: Buffer): Promise<string> {
  const filename = `${generateId()}.jpg`

  try {
    await sharp(buffer)
      .rotate()
      .resize(1280, 1280, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(join(PHOTOS_DIR, filename))
  } catch (err: any) {
    throw createError({ statusCode: 422, message: `Не удалось обработать изображение: ${err?.message ?? 'unknown'}` })
  }

  return filename
}

export async function deletePhotoFile(filename: string): Promise<void> {
  try {
    await unlink(join(PHOTOS_DIR, filename))
  } catch (err: any) {
    if (err?.code !== 'ENOENT') throw err
  }
}
