import { errAsync, ok, Result } from 'neverthrow'
import { DefaultExecService, ExecService } from './exec.ts'

type GitError = {
  message: string
  code: number
}

/**
 * Get the contents of a file from a specific branch.
 *
 * @param path The path to the file.
 * @param branch The branch to get the file from.
 * @returns The contents of the file.
 */
export async function getGitFileContents(
  path: string,
  branch: string,
  /* istanbul ignore next */
  execService: ExecService = new DefaultExecService()
): Promise<Result<string, GitError>> {
  try {
    const output = await execService.execWithOutput('git', [
      'show',
      `${branch}:${path}`
    ])
    if (output.exitCode !== 0) {
      return errAsync({
        type: 'GIT_ERROR',
        message: `Failed to get file contents: ${output.stderr}`,
        code: output.exitCode
      })
    }
    return ok(output.stdout)
  } catch (error) {
    /* istanbul ignore next */
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return errAsync({
      type: 'GIT_THROWN_ERROR',
      message: `Exception executing git command: ${msg}`,
      code: -1
    })
  }
}
