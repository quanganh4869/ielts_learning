import { BACKEND_URL } from '@/context/AuthContext'

export interface UploadSessionRequest {
  resourceType: 'SPEAKING_AUDIO' | 'LISTENING_AUDIO' | 'LESSON_MATERIAL' | 'USER_AVATAR'
  contentType: string
  fileSizeBytes: number
  originalFilename?: string
}

export interface UploadSessionResponse {
  fileId: string
  uploadUrl: string
  objectKey: string
  expiresAt: string
  maxFileSizeBytes: number
  contentType: string
}

export interface FileMetadata {
  id: string
  objectKey: string
  bucketName: string
  resourceType: string
  originalFilename: string
  contentType: string
  fileSizeBytes: number
  ownerId: string
  accessLevel: 'PRIVATE' | 'PUBLIC'
  uploadStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'DELETED'
  downloadUrl?: string
  createdAt: string
}

export const storageService = {
  /**
   * Request a short-lived presigned PUT URL from Spring Boot backend.
   */
  async requestUploadSession(
    request: UploadSessionRequest,
    accessToken?: string | null
  ): Promise<UploadSessionResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const res = await fetch(`${BACKEND_URL}/api/v1/storage/upload-session`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(request),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Failed to initiate upload session')
    }

    const json = await res.json()
    return json.data
  },

  /**
   * Direct-to-R2 upload using the presigned PUT URL.
   * Uploads large binary files directly to Cloudflare R2 without passing through backend servers.
   */
  async uploadDirectToR2(
    uploadUrl: string,
    file: Blob | File,
    contentType: string
  ): Promise<void> {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file,
    })

    if (!res.ok) {
      throw new Error(`Direct R2 upload failed with status ${res.status}`)
    }
  },

  /**
   * Notifies backend that direct R2 upload finished to verify and finalize metadata.
   */
  async completeUpload(
    fileId: string,
    accessToken?: string | null
  ): Promise<FileMetadata> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const res = await fetch(`${BACKEND_URL}/api/v1/storage/complete-upload/${fileId}`, {
      method: 'POST',
      headers,
      credentials: 'include',
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Failed to finalize file upload')
    }

    const json = await res.json()
    return json.data
  },

  /**
   * Full end-to-end direct upload helper for convenience.
   */
  async uploadFile(
    file: File | Blob,
    resourceType: 'SPEAKING_AUDIO' | 'LISTENING_AUDIO' | 'LESSON_MATERIAL' | 'USER_AVATAR',
    originalFilename?: string,
    accessToken?: string | null
  ): Promise<FileMetadata> {
    const contentType = file.type || 'application/octet-stream'
    const session = await this.requestUploadSession(
      {
        resourceType,
        contentType,
        fileSizeBytes: file.size,
        originalFilename: originalFilename || (file instanceof File ? file.name : undefined),
      },
      accessToken
    )

    await this.uploadDirectToR2(session.uploadUrl, file, contentType)
    return await this.completeUpload(session.fileId, accessToken)
  },

  /**
   * Get an authorized presigned GET URL for private files or public CDN link for public files.
   */
  async getDownloadUrl(
    fileId: string,
    accessToken?: string | null
  ): Promise<string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const res = await fetch(`${BACKEND_URL}/api/v1/storage/${fileId}/download-url`, {
      method: 'GET',
      headers,
      credentials: 'include',
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Failed to get file download link')
    }

    const json = await res.json()
    return json.data.downloadUrl
  },

  /**
   * Delete an object from Cloudflare R2 and update database metadata.
   */
  async deleteFile(
    fileId: string,
    accessToken?: string | null
  ): Promise<void> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const res = await fetch(`${BACKEND_URL}/api/v1/storage/${fileId}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Failed to delete file')
    }
  },
}
