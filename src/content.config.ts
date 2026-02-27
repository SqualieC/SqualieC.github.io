import { defineCollection, z } from 'astro:content';

const linkSchema = z
  .string()
  .refine((value) => value.startsWith('/') || /^https?:\/\//i.test(value), {
    message: 'Expected an absolute URL (https://...) or a root-relative path (/...)'
  });

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pitch: z.string(),
    tags: z.array(z.string()),
    status: z.enum(['planning', 'active', 'paused', 'archived']),
    screenshots: z.array(z.string()).default([]),
    repoUrl: z.string().url().optional(),
    demoUrl: linkSchema.optional(),
    downloadUrl: linkSchema.optional(),
    downloadLabel: z.string().optional(),
    secondaryDownloadUrl: linkSchema.optional(),
    secondaryDownloadLabel: z.string().optional(),
    priceModel: z.enum(['free', 'paid', 'donation', 'freemium']),
    platform: z.array(z.enum(['web', 'windows', 'mac', 'linux', 'android', 'ios'])),
    updatedAt: z.coerce.date(),
    usesMicAudio: z.boolean().default(false),
    monetizationType: z.enum(['none', 'stripe', 'gumroad', 'kofi', 'other']).default('none'),
    featured: z.boolean().default(false)
  })
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    updatedAt: z.coerce.date(),
    tags: z.array(z.string()).default([])
  })
});

const tools = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    updatedAt: z.coerce.date(),
    tags: z.array(z.string()).default([])
  })
});

export const collections = { projects, blog, tools };
