'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

interface Image {
  id: string
  filename: string
  url: string
  description: string
  category: string
  uploaded_by: string
  created_at: string
}

interface FrontpageSettings {
  heroImage: string
}

export default function AdminFrontpage() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>('/expurgedforside.png')
  const [successMessage, setSuccessMessage] = useState('')
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    fetchImages()
    // Load saved hero image from localStorage
    const savedHero = localStorage.getItem('heroImage')
    if (savedHero) {
      setSelectedImage(savedHero)
    }
  }, [])

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching images:', error)
    } else {
      setImages(data || [])
    }
    setLoading(false)
  }

  const handleSelectImage = (url: string) => {
    setSelectedImage(url)
  }

  const handleSave = async () => {
    if (!selectedImage || selectedImage === '/expurgedforside.png') {
      setSuccessMessage('Please select an image first!')
      return
    }

    setSaving(true)
    
    try {
      // First, reset all images to remove hero category
      const { error: resetError } = await supabase
        .from('images')
        .update({ category: 'art' })
        .eq('category', 'hero')

      if (resetError) {
        console.error('Error resetting hero images:', resetError)
        throw resetError
      }

      // Find the selected image and update its category to 'hero'
      const selectedImageId = images.find(img => img.url === selectedImage)?.id
      
      if (selectedImageId) {
        const { error: updateError } = await supabase
          .from('images')
          .update({ category: 'hero' })
          .eq('id', selectedImageId)

        if (updateError) {
          console.error('Error updating hero image:', updateError)
          throw updateError
        }
      }

      // Also save to localStorage for backward compatibility
      localStorage.setItem('heroImage', selectedImage)
      
      // Trigger storage event manually for same-page updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'heroImage',
        newValue: selectedImage,
        oldValue: localStorage.getItem('heroImage')
      }))
      
      setSuccessMessage('Hero image saved successfully!')
    } catch (error) {
      console.error('Error saving hero image:', error)
      setSuccessMessage('Error saving hero image. Please try again.')
    } finally {
      setSaving(false)
    }
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('')
    }, 3000)
  }

  const handleUseDefault = () => {
    setSelectedImage('/expurgedforside.png')
    localStorage.setItem('heroImage', '/expurgedforside.png')
    setSuccessMessage('Using default image!')
    setTimeout(() => {
      setSuccessMessage('')
    }, 3000)
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Frontpage Settings</h1>
        <p className="text-gray-600">Select the hero image that will appear on the frontpage</p>
      </div>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Current Selection */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Selection</h2>
        <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Hero preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No image selected
            </div>
          )}
        </div>
        <div className="mt-4 flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving || !selectedImage}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
          >
            {saving ? 'Saving...' : 'Save Selection'}
          </button>
          <button
            onClick={handleUseDefault}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Use Default Image
          </button>
        </div>
      </div>

      {/* Available Images */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Images</h2>
        {images.length === 0 ? (
          <p className="text-gray-500">
            No images uploaded yet. Go to the Images section to upload some!
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                onClick={() => handleSelectImage(image.url)}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${
                  selectedImage === image.url
                    ? 'border-red-500 ring-2 ring-red-300'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img
                  src={image.url}
                  alt={image.description || image.filename}
                  className="w-full h-32 object-cover"
                />
                {selectedImage === image.url && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="p-2 bg-white">
                  <p className="text-xs text-gray-600 truncate">{image.filename}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
        <p className="text-sm text-blue-800">
          Select an image from your uploaded images above, then click "Save Selection". 
          The chosen image will be displayed as the hero background on the frontpage. 
          You can also revert to the default image using the "Use Default Image" button.
        </p>
      </div>
    </div>
  )
}
