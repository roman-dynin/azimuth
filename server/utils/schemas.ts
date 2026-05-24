import { z } from 'zod'

const id = z.number().int().positive()

const nullableString = z.string().nullable().optional()

const nullableFloat = z.number().nullable().optional()

const nullableNonNegFloat = z.number().min(0).nullable().optional()

const nullablePositiveId = id.nullable().optional()

const lat = z.number().min(-90).max(90)

const lng = z.number().min(-180).max(180)

const nullableLat = lat.nullable().optional()

const nullableLng = lng.nullable().optional()

export const waypointCreateSchema = z
  .object({
    routeId: id,
    title: nullableString,
    description: nullableString,
    color: nullableString,
    emoji: nullableString,
    poi: z.boolean().optional(),
    targetWaypointId: nullablePositiveId,
    azimuth: z.number().int().min(0).max(359).nullable().optional(),
    distance: nullableNonNegFloat,
    seconds: z.number().int().min(0).nullable().optional(),
    depth: nullableNonNegFloat,
    order: nullableFloat,
  })
  .strict()

export const waypointPatchSchema = waypointCreateSchema.partial().omit({ routeId: true })

export const waypointsReorderSchema = z.array(z.object({ id, order: z.number() }).strict())

export const routeCreateSchema = z
  .object({
    routeGroupId: nullablePositiveId,
    guideline: z.boolean().optional(),
    title: nullableString,
    description: nullableString,
    color: nullableString,
    weight: z.number().int().min(1).nullable().optional(),
    anchorWaypointId: nullablePositiveId,
    anchorLat: nullableLat,
    anchorLng: nullableLng,
  })
  .strict()

export const routePatchSchema = routeCreateSchema.partial()

export const routeGroupCreateSchema = z
  .object({
    title: nullableString,
    description: nullableString,
    color: nullableString,
    weight: z.number().int().min(1).nullable().optional(),
  })
  .strict()

export const routeGroupPatchSchema = routeGroupCreateSchema.partial()

export const spotCreateSchema = z
  .object({
    title: nullableString,
    description: nullableString,
    emoji: z.string().min(1),
    lat,
    lng,
    depth: nullableNonNegFloat,
  })
  .strict()

export const spotPatchSchema = spotCreateSchema.partial()

export const photoCreateSchema = z
  .object({
    title: nullableString,
    description: nullableString,
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
  })
  .strict()

export const photoPatchSchema = photoCreateSchema.partial()

export const authSchema = z.object({ code: z.string() }).strict()
