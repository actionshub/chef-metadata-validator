import { getGitFileContents } from './git.ts'
import { ExecService } from './exec.ts'
import { jest } from '@jest/globals'

describe('getGitFileContents', () => {
  // Create a mock implementation of ExecService

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return file contents on successful execution', async () => {
    const mockExecService: ExecService = {
      execWithOutput: jest.fn(async () => ({
        exitCode: 0,
        stdout: 'File contents',
        stderr: ''
      }))
    }

    const result = await getGitFileContents(
      'path/to/file',
      'main',
      mockExecService
    )
    expect(mockExecService.execWithOutput).toHaveBeenCalledWith('git', [
      'show',
      'main:path/to/file'
    ])
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      /* eslint-disable-next-line jest/no-conditional-expect */
      expect(result.value).toBe('File contents')
    }
  })

  it('should return a GitError on failed execution', async () => {
    const mockExecService: ExecService = {
      execWithOutput: jest.fn(async () => ({
        exitCode: 128,
        stdout: '',
        stderr: 'Git error message'
      }))
    }

    const result = await getGitFileContents(
      'path/to/file',
      'main',
      mockExecService
    )

    expect(mockExecService.execWithOutput).toHaveBeenCalledWith('git', [
      'show',
      'main:path/to/file'
    ])
    expect(result.isErr()).toBe(true)
    const err = result._unsafeUnwrapErr()
    expect(err.message).toBe('Failed to get file contents: Git error message')
    expect(err.code).toBe(128)
  })

  it('should handle exceptions thrown by execWithOutput', async () => {
    const mockExecService: ExecService = {
      execWithOutput: jest.fn(async () => {
        throw new Error('Command failed')
      })
    }

    const result = await getGitFileContents(
      'path/to/file',
      'main',
      mockExecService
    )

    expect(mockExecService.execWithOutput).toHaveBeenCalledWith('git', [
      'show',
      'main:path/to/file'
    ])
    expect(result.isErr()).toBe(true)
    const err = result._unsafeUnwrapErr()

    expect(err.message).toContain(
      'Exception executing git command: Command failed'
    )
    expect(err.code).toBe(-1)
  })
})
