'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

interface Artwork {
  id: string
  filename: string
  url: string
  description: string
  category: string
  uploaded_by: string
  created_at: string
}

export default function RaidArt() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    fetchArtworks()
  }, [])

  const fetchArtworks = async () => {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .in('category', ['art', 'drawings'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching artworks:', error)
    } else {
      setArtworks(data || [])
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 via-orange-900 to-black text-white pt-16">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Loading artworks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-orange-900 to-black text-white pt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-center text-red-400 mb-4">
          Raid-Art Gallery
        </h1>
        <p className="text-center text-xl mb-12 text-gray-300">
          Where MS Paint meets Azeroth - Our guild's finest pixel art collection
        </p>

        {artworks.length === 0 ? (
          <div className="text-center">
            <p className="text-xl text-gray-400 mb-8">No artworks uploaded yet!</p>
            <p className="text-lg mb-4">Be the first to contribute to the gallery.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {artworks.map((art) => (
              <div key={art.id} className="flex flex-col items-center">
                <div className="w-full max-w-3xl">
                  <h3 className="text-2xl font-bold mb-2 text-red-300">{art.filename}</h3>
                  <img
                    src={art.url}
                    alt={art.description}
                    className="w-full h-auto max-h-96 object-contain rounded-lg border border-red-500"
                  />
                </div>
                <div className="text-center mt-6 max-w-2xl">
                  <p className="text-sm text-gray-400 mb-4">
                    {new Date(art.created_at).toLocaleDateString()} • {art.category}
                  </p>
                  <p className="text-gray-300 leading-relaxed">{art.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-lg mb-4">Got artistic talent? Want to contribute to the gallery?</p>
          <button className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition duration-300">
            Contact an Officer to Submit Your Art
          </button>
        </div>
      </div>
    </div>
  );
}
