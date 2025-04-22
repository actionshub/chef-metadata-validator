import { RepoSchema, BaseSchema, PullRequestSchema } from './model.ts'

describe('RepoSchema', () => {
  it('should validate a valid repo object', () => {
    const validRepo = { default_branch: 'main' }
    expect(() => RepoSchema.parse(validRepo)).not.toThrow()
  })

  it('should throw an error if default_branch is empty', () => {
    const invalidRepo = { default_branch: '' }
    expect(() => RepoSchema.parse(invalidRepo)).toThrow(
      'Default branch must be a non-empty string'
    )
  })

  it('should throw an error if default_branch is missing', () => {
    const invalidRepo = {}
    expect(() => RepoSchema.parse(invalidRepo)).toThrow()
  })
})

describe('BaseSchema', () => {
  it('should validate a valid base object', () => {
    const validBase = { repo: { default_branch: 'main' } }
    expect(() => BaseSchema.parse(validBase)).not.toThrow()
  })

  it('should throw an error if repo is missing', () => {
    const invalidBase = {}
    expect(() => BaseSchema.parse(invalidBase)).toThrow()
  })

  it('should throw an error if repo is invalid', () => {
    const invalidBase = { repo: { default_branch: '' } }
    expect(() => BaseSchema.parse(invalidBase)).toThrow(
      'Default branch must be a non-empty string'
    )
  })
})

describe('PullRequestSchema', () => {
  it('should validate a valid pull request object', () => {
    const validPullRequest = { base: { repo: { default_branch: 'main' } } }
    expect(() => PullRequestSchema.parse(validPullRequest)).not.toThrow()
  })

  it('should throw an error if base is missing', () => {
    const invalidPullRequest = {}
    expect(() => PullRequestSchema.parse(invalidPullRequest)).toThrow()
  })

  it('should throw an error if base is invalid', () => {
    const invalidPullRequest = { base: { repo: { default_branch: '' } } }
    expect(() => PullRequestSchema.parse(invalidPullRequest)).toThrow(
      'Default branch must be a non-empty string'
    )
  })
})
