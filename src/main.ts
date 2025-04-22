import * as core from '@actions/core'
import * as fs from 'fs'
import { err, ok, Result } from 'neverthrow'
import { PullRequestSchema } from '@validator/model'
import { getGitFileContents } from '@validator/git'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  const githubEventName = process.env.GITHUB_EVENT_NAME || ''
  if (githubEventName !== 'pull_request') {
    core.setFailed(
      `This action only supports pull_request. Triggered by: ${githubEventName}`
    )
    return
  }

  const eventPayload = await getEvent()
  const defaultBranch = eventPayload.base.repo.default_branch

  if (!defaultBranch) {
    core.setFailed('Default branch not found')
    return
  }
  core.setOutput('default_branch', defaultBranch)

  const targetFile = 'metadata.rb'
  const defaultBranchMetadataContents = await getGitFileContents(
    targetFile,
    defaultBranch
  )
  if (defaultBranchMetadataContents.isErr()) {
    core.setFailed(
      `Failed to get file contents: ${defaultBranchMetadataContents.error.message}, exit code: ${defaultBranchMetadataContents.error.code}`
    )
    return
  }
  const defaultBranchVersion = versionNumber(
    defaultBranchMetadataContents.value
  )
  if (defaultBranchVersion.isErr()) {
    core.setFailed(
      `Failed to get version number: ${defaultBranchVersion.error}`
    )
    return
  }
  core.setOutput('default_branch_version', defaultBranchVersion.value)

  const fileContents = await getFileContents(targetFile)
  const fileVersion = versionNumber(fileContents)
  if (fileVersion.isErr()) {
    core.setFailed(`Failed to get version number: ${fileVersion.error}`)
    return
  }
  core.setOutput('current_version', fileVersion.value)
  if (fileVersion.value !== defaultBranchVersion.value) {
    core.setFailed(
      `Version number in ${targetFile}: ${fileVersion.value} does not match default branch version number: ${defaultBranchVersion.value}`
    )
    return
  }
}

function versionNumber(contents: string): Result<string, string> {
  const versionRegex = /\n(version\s+'?(\d+\.\d+\.\d+)')\n/m
  const match = contents.match(versionRegex)

  if (match) {
    const version = match[2]
    return ok(version)
  } else {
    return err('Version not found')
  }
}

async function getEvent(): Promise<PullRequestSchema> {
  const githubEventPath = process.env.GITHUB_EVENT_PATH || ''
  const rawEventPayload = await getFileContents(githubEventPath)
  const body = JSON.parse(rawEventPayload)
  core.debug('event: ' + body)
  return PullRequestSchema.parse(body.pull_request)
}

async function getFileContents(path: string): Promise<string> {
  return fs.readFileSync(path, 'utf8')
}
