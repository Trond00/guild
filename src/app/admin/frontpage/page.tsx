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

interface AboutUsContent {
  id: string
  section_key: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export default function AdminFrontpage() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [successMessage, setSuccessMessage] = useState('')
  const [aboutUsContent, setAboutUsContent] = useState<AboutUsContent | null>(null)
  const [aboutUsTitle, setAboutUsTitle] = useState('')
  const [aboutUsText, setAboutUsText] = useState('')
  const [aboutUsLoading, setAboutUsLoading] = useState(false)
  const [aboutUsSaving, setAboutUsSaving] = useState(false)
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    fetchImages()
    // Load current hero images from database
    fetchCurrentHeroImages()
  }, [])

  const fetchCurrentHeroImages = async () => {
    const { data, error } = await supabase
      .from('images')
      .select('url')
      .eq('is_hero', true)

    if (error) {
      console.error('Error fetching current hero images:', error)
    } else {
      const heroUrls = data.map(img => img.url)
      setSelectedImages(new Set(heroUrls))
      console.log('Loaded current hero images from database:', heroUrls)
    }
  }

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

  const handleToggleImage = (url: string) => {
    const newSelectedImages = new Set(selectedImages)
    if (newSelectedImages.has(url)) {
      newSelectedImages.delete(url)
    } else {
      newSelectedImages.add(url)
    }
    setSelectedImages(newSelectedImages)
  }

const handleSave = async () => {
    if (selectedImages.size === 0) {
      setSuccessMessage('Please select at least one image!')
      return
    }

    // Limit to maximum 4 hero images
    if (selectedImages.size > 4) {
      setSuccessMessage('You can only select up to 4 hero images!')
      return
    }

    setSaving(true)
    
    try {
      // First, reset all images to remove hero status
      const { data: resetData, error: resetError } = await supabase
        .from('images')
        .update({ is_hero: false })
        .eq('is_hero', true)
        .select()

      if (resetError) {
        console.error('Error resetting hero images:', resetError)
        throw resetError
      }
      
      console.log('Reset hero images:', resetData)

      // Update selected images to have hero status
      const selectedImageIds = []
      
      for (const selectedUrl of selectedImages) {
        // Find image by URL (exact match)
        const matchingImage = images.find(img => img.url === selectedUrl)
        if (matchingImage) {
          selectedImageIds.push(matchingImage.id)
        } else {
          console.warn('No matching image found for URL:', selectedUrl)
        }
      }
      
      console.log('Selected image IDs to update as hero:', selectedImageIds)
      
      if (selectedImageIds.length > 0) {
        const { data: updateData, error: updateError } = await supabase
          .from('images')
          .update({ is_hero: true })
          .in('id', selectedImageIds)
          .select()

        if (updateError) {
          console.error('Error updating hero images:', updateError)
          throw updateError
        }
        
        console.log('Successfully updated hero images:', updateData)
        
        // Verify the update worked
        const { data: verifyData, error: verifyError } = await supabase
          .from('images')
          .select('id, filename, is_hero')
          .in('id', selectedImageIds)

        if (verifyError) {
          console.error('Error verifying hero images:', verifyError)
        } else {
          console.log('Verification - hero images after update:', verifyData)
          
          // Check if all selected images were actually updated
          const allUpdated = verifyData.every(img => img.is_hero === true)
          console.log('All selected images updated successfully:', allUpdated)
        }
      }

      // Update the selected images state to reflect the database
      fetchCurrentHeroImages()
      
setSuccessMessage(`Hero rotation saved successfully! ${selectedImages.size} image(s) in rotation.`)
    } catch (error) {
      console.error('Error saving hero images:', error)
      setSuccessMessage('Error saving hero images. Please try again.')
    } finally {
      setSaving(false)
    }
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('')
    }, 3000)
  }

  const handleClearAll = async () => {
    setSaving(true)
    
    try {
      // Reset all images to remove hero status
      const { error: resetError } = await supabase
        .from('images')
        .update({ is_hero: false })
        .eq('is_hero', true)

      if (resetError) {
        console.error('Error clearing hero images:', resetError)
        throw resetError
      }

      // Clear localStorage
      localStorage.removeItem('heroImages')
      setSelectedImages(new Set())
      
      // Trigger storage event manually for same-page updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'heroImages',
        newValue: null,
        oldValue: localStorage.getItem('heroImages')
      }))
      
      setSuccessMessage('All hero images cleared!')
    } catch (error) {
      console.error('Error clearing hero images:', error)
      setSuccessMessage('Error clearing hero images. Please try again.')
    } finally {
      setSaving(false)
    }
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('')
    }, 3000)
  }

  // About Us Content Management Functions
  const fetchAboutUsContent = async () => {
    setAboutUsLoading(true)
    try {
      const { data, error } = await supabase
        .from('content_sections')
        .select('*')
        .eq('section_key', 'about_us')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching About Us content:', error)
        setSuccessMessage('Error loading About Us content.')
      } else if (data) {
        setAboutUsContent(data)
        setAboutUsTitle(data.title || '')
        setAboutUsText(data.content || '')
      } else {
        // No content found, use default
        setAboutUsTitle('About Us')
        setAboutUsText('ExPurged is a legendary Horde guild on Ragnaros server, dedicated to conquering the greatest challenges Azeroth has to offer. From raiding the toughest dungeons to PvP glory, we stand united for the Horde\'s supremacy.')
      }
    } catch (error) {
      console.error('Error fetching About Us content:', error)
      setSuccessMessage('Error loading About Us content.')
    } finally {
      setAboutUsLoading(false)
    }
  }

  const handleSaveAboutUs = async () => {
    // Content validation
    const trimmedTitle = aboutUsTitle.trim()
    const trimmedContent = aboutUsText.trim()
    
    if (!trimmedContent) {
      setSuccessMessage('Please enter some content for the About Us section.')
      return
    }
    
    if (trimmedContent.length > 2000) {
      setSuccessMessage('Content is too long. Please keep it under 2000 characters.')
      return
    }
    
    if (trimmedTitle && trimmedTitle.length > 100) {
      setSuccessMessage('Title is too long. Please keep it under 100 characters.')
      return
    }

    setAboutUsSaving(true)
    try {
      const contentData = {
        section_key: 'about_us',
        title: trimmedTitle || 'About Us',
        content: trimmedContent
      }

      const { error } = await supabase
        .from('content_sections')
        .upsert(contentData, { onConflict: 'section_key' })

      if (error) {
        console.error('Error saving About Us content:', error)
        setSuccessMessage('Error saving About Us content. Please try again.')
      } else {
        setSuccessMessage('About Us content saved successfully!')
        // Refresh the content
        fetchAboutUsContent()
      }
    } catch (error) {
      console.error('Error saving About Us content:', error)
      setSuccessMessage('Error saving About Us content. Please try again.')
    } finally {
      setAboutUsSaving(false)
    }

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('')
    }, 3000)
  }

  const handleResetAboutUs = () => {
    setAboutUsTitle('About Us')
    setAboutUsText('ExPurged is a legendary Horde guild on Ragnaros server, dedicated to conquering the greatest challenges Azeroth has to offer. From raiding the toughest dungeons to PvP glory, we stand united for the Horde\'s supremacy.')
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Rotation Settings</h2>
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600 mb-2">Selected Images:</p>
          {selectedImages.size > 0 ? (
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedImages).map((url, index) => {
                const image = images.find(img => img.url === url)
                return (
                  <div key={url} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full text-sm">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span>{image?.filename || `Image ${index + 1}`}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500">No images selected for hero rotation</p>
          )}
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving || selectedImages.size === 0}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
          >
            {saving ? 'Saving...' : `Save ${selectedImages.size > 0 ? selectedImages.size + ' Image(s)' : 'Selection'}`}
          </button>
          <button
            onClick={handleClearAll}
            disabled={saving}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
          >
            Clear All
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
                onClick={() => handleToggleImage(image.url)}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${
                  selectedImages.has(image.url)
                    ? 'border-red-500 ring-2 ring-red-300'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img
                  src={image.url}
                  alt={image.description || image.filename}
                  className="w-full h-32 object-cover"
                />
                {selectedImages.has(image.url) && (
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

      {/* About Us Content Management */}
      <div className="mt-12 border-t border-gray-200 pt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">About Us Content</h2>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <label htmlFor="aboutUsTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Section Title
            </label>
            <input
              type="text"
              id="aboutUsTitle"
              value={aboutUsTitle}
              onChange={(e) => setAboutUsTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter section title (e.g., About Us)"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="aboutUsText" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              id="aboutUsText"
              rows={6}
              value={aboutUsText}
              onChange={(e) => setAboutUsText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-vertical"
              placeholder="Enter the content for the About Us section..."
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSaveAboutUs}
              disabled={aboutUsSaving}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
            >
              {aboutUsSaving ? 'Saving...' : 'Save About Us Content'}
            </button>
            <button
              onClick={handleResetAboutUs}
              disabled={aboutUsSaving}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
            >
              Reset to Default
            </button>
          </div>

          {/* Preview */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Preview:</h3>
            <div className="bg-gradient-to-r from-red-900 to-orange-900 p-6 rounded-xl shadow-lg">
              <h4 className="text-xl font-bold text-white mb-4">{aboutUsTitle || 'About Us'}</h4>
              <p className="text-gray-100 leading-relaxed">
                {aboutUsText || 'ExPurged is a legendary Horde guild on Ragnaros server, dedicated to conquering the greatest challenges Azeroth has to offer. From raiding the toughest dungeons to PvP glory, we stand united for the Horde\'s supremacy.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
        <p className="text-sm text-blue-800">
          Select multiple images from your uploaded images above by clicking on them. 
          Each time someone visits your website, a random image from your selection will be displayed as the hero background. 
          Images can be in any category (art, drawings, etc.) and still be part of the hero rotation.
          Click "Save Selection" to update the hero rotation. Use "Clear All" to remove all hero images.
        </p>
      </div>
    </div>
  )
}
