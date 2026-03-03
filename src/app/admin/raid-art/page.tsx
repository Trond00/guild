'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

interface Artwork {
  id: string
  filename: string
  display_name: string
  url: string
  description: string
  category: string
  uploaded_by: string
  created_at: string
  order: number
}

interface EditState {
  [id: string]: {
    display_name: string
    description: string
    order: number
  }
}

export default function AdminRaidArt() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editState, setEditState] = useState<EditState>({})
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    fetchArtworks()
  }, [])

  const fetchArtworks = async () => {
    try {
      // First try to fetch with order field
      const { data: dataWithOrder, error: errorWithOrder } = await supabase
        .from('images')
        .select('*')
        .in('category', ['art', 'drawings'])
        .order('order', { ascending: true })

      if (errorWithOrder && errorWithOrder.code === '42703') {
        // Column 'order' doesn't exist, fetch without it and add default order
        const { data: dataWithoutOrder, error: errorWithoutOrder } = await supabase
          .from('images')
          .select('*')
          .in('category', ['art', 'drawings'])
          .order('created_at', { ascending: false })

        if (errorWithoutOrder) {
          console.error('Error fetching artworks:', errorWithoutOrder)
        } else {
          // Add default order based on created_at
          const artworksWithDefaultOrder = (dataWithoutOrder || []).map((art, index) => ({
            ...art,
            order: index + 1,
            display_name: art.display_name || art.filename
          }))
          setArtworks(artworksWithDefaultOrder)
        }
      } else if (errorWithOrder) {
        console.error('Error fetching artworks:', errorWithOrder)
      } else {
        // Add default display_name if missing
        const artworksWithDefaults = (dataWithOrder || []).map(art => ({
          ...art,
          display_name: art.display_name || art.filename
        }))
        setArtworks(artworksWithDefaults)
      }
    } catch (error) {
      console.error('Error fetching artworks:', error)
    }
    setLoading(false)
  }

  const handleUpdateArtwork = async (id: string, field: string, value: any) => {
    try {
      // Check if the field exists in the database
      const { error } = await supabase
        .from('images')
        .update({ [field]: value })
        .eq('id', id)

      if (error) {
        console.error('Error updating artwork:', error)
        // If it's a column not found error, show user-friendly message
        if (error.code === '42703') {
          alert(`Cannot update ${field}: This field doesn't exist in the database yet. Please run the database migration script first.`)
        }
      } else {
        fetchArtworks()
      }
    } catch (error) {
      console.error('Error updating artwork:', error)
    }
  }

  const handleReorder = async (id: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('images')
        .update({ order: newOrder })
        .eq('id', id)

      if (error) {
        console.error('Error updating order:', error)
        if (error.code === '42703') {
          alert('Cannot update order: The "order" field doesn\'t exist in the database yet. Please run the database migration script first.')
        }
      } else {
        fetchArtworks()
      }
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const handleSaveChanges = async (art: Artwork) => {
    setSaving(true)
    try {
      const updates: any = {}
      
      // Only update fields that have changed
      if (editState[art.id]?.display_name !== undefined && editState[art.id].display_name !== (art.display_name || art.filename)) {
        updates.display_name = editState[art.id].display_name
      }
      if (editState[art.id]?.description !== undefined && editState[art.id].description !== (art.description || '')) {
        updates.description = editState[art.id].description
      }
      if (editState[art.id]?.order !== undefined && editState[art.id].order !== (art.order || 0)) {
        updates.order = editState[art.id].order
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('images')
          .update(updates)
          .eq('id', art.id)

        if (error) {
          console.error('Error saving changes:', error)
          if (error.code === '42703') {
            alert('Cannot save changes: Some fields don\'t exist in the database yet. Please run the database migration script first.')
          }
        } else {
          fetchArtworks()
          // Clear edit state for this artwork
          setEditState(prev => {
            const newState = { ...prev }
            delete newState[art.id]
            return newState
          })
        }
      }
    } catch (error) {
      console.error('Error saving changes:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (art: Artwork, field: string, value: any) => {
    setEditState(prev => ({
      ...prev,
      [art.id]: {
        ...prev[art.id],
        [field]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Loading artworks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Manage Raid-Art Gallery</h1>
        <p className="text-gray-600">Upload and manage MS Paint artworks from guild members.</p>
      </div>

      {artworks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No raid-art images found.</p>
          <p className="text-gray-400 text-sm mt-2">Upload images with category 'art' or 'drawings' to see them here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {artworks.map((art, index) => (
              <div key={art.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={art.url}
                        alt={art.display_name}
                        className="w-20 h-20 object-cover rounded-md border border-gray-300"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{art.display_name || art.filename}</h3>
                        <p className="text-sm text-gray-600">{art.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Order:</span>
                      <input
                        type="number"
                        value={art.order || index + 1}
                        onChange={(e) => handleReorder(art.id, parseInt(e.target.value))}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-red-500 focus:border-red-500"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={editState[art.id]?.display_name ?? art.display_name ?? art.filename}
                        onChange={(e) => handleInputChange(art, 'display_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                        placeholder="Enter display name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={editState[art.id]?.description ?? art.description ?? ''}
                        onChange={(e) => handleInputChange(art, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                        rows={3}
                        placeholder="Enter description"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        Uploaded: {new Date(art.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Original: {art.filename}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-600">
                        {editState[art.id] && Object.keys(editState[art.id]).length > 0 && 'Changes pending...'}
                      </div>
                      <button
                        onClick={() => handleSaveChanges(art)}
                        disabled={saving || !editState[art.id] || Object.keys(editState[art.id]).length === 0}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors duration-200"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">How to Use:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Change "Display Name" to set a custom title for the gallery</li>
              <li>• Edit "Description" to add funny captions or explanations</li>
              <li>• Adjust "Order" number to control display sequence (1 = first)</li>
              <li>• Click "Save Changes" to save your edits to the database</li>
              <li>• "Changes pending..." shows when edits haven't been saved yet</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
