import { z } from 'zod'

// Define the schema for the `base.repo` object
export const RepoSchema = z.object({
  default_branch: z
    .string()
    .nonempty('Default branch must be a non-empty string')
})

// Define the schema for the `base` object
export const BaseSchema = z.object({
  repo: RepoSchema
})

// Define the schema for the entire event payload
export const PullRequestSchema = z.object({
  base: BaseSchema
})

export type PullRequestSchema = z.infer<typeof PullRequestSchema>
