'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, X } from 'lucide-react'

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void
  acceptedTypes?: string[]
}

export default function DropZone({
  onFilesSelected,
  acceptedTypes = ['.fit', '.csv', '.pdf'],
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const dropped = Array.from(e.dataTransfer.files)
      setFiles((prev) => [...prev, ...dropped])
      onFilesSelected(dropped)
    },
    [onFilesSelected]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || [])
      setFiles((prev) => [...prev, ...selected])
      onFilesSelected(selected)
    },
    [onFilesSelected]
  )

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50'
            : 'border-gray-200 hover:border-gray-300 bg-gray-50/30'
        }`}
      >
        <label className="cursor-pointer flex flex-col items-center gap-3">
          <Upload size={32} className="text-gray-300" />
          <div>
            <p className="text-sm font-semibold text-gray-600">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports {acceptedTypes.join(', ')} files
            </p>
          </div>
          <input
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{file.name}</p>
                  <p className="text-xs text-gray-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(i)}
                className="p-1 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
