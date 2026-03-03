'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

interface BlogPost {
  id: string
  title: string
  content: string
  author: string
  created_at: string
  images?: string[]
}

interface GalleryImage {
  id: string
  filename: string
  url: string
  description: string
  category: string
}

export default function News() {
  const [newsItems, setNewsItems] = useState<BlogPost[]>([])
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    fetchNews()
    fetchGalleryImages()
  }, [])

  const fetchGalleryImages = async () => {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching gallery images:', error)
    } else {
      setGalleryImages(data || [])
    }
  }

  const fetchNews = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching news:', error)
    } else {
      // Parse images arrays if they're stored as JSON strings
      const parsedNews = (data || []).map(newsItem => {
        if (typeof newsItem.images === 'string') {
          try {
            newsItem.images = JSON.parse(newsItem.images)
          } catch (e) {
            console.error('Error parsing images:', e)
            newsItem.images = []
          }
        }
        return newsItem
      })
      setNewsItems(parsedNews)
    }
    setLoading(false)
  }

  const getHeroImage = (newsItem: BlogPost) => {
    // If news item has specific images, use the first one
    if (newsItem.images && newsItem.images.length > 0) {
      const specificImage = newsItem.images[0]
      if (specificImage && isValidImageUrl(specificImage)) {
        return specificImage
      }
    }
    
    // Otherwise, use a random gallery image or fallback
    if (galleryImages.length > 0) {
      // Use a consistent "random" image based on the news item ID
      const index = Math.abs(hashCode(newsItem.id)) % galleryImages.length
      const galleryImage = galleryImages[index]
      if (galleryImage && galleryImage.url && isValidImageUrl(galleryImage.url)) {
        return galleryImage.url
      }
    }
    
    return null
  }

  const isValidImageUrl = (url: string) => {
    // Check if URL is valid and not empty
    if (!url || typeof url !== 'string') return false
    
    // Check if it's a valid URL format
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Simple hash function for consistent "random" selection
  const hashCode = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 via-orange-900 to-black text-white pt-16">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Loading news...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-orange-900 to-black text-white pt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-center text-red-400 mb-12">
          Guild News
        </h1>
        
        {newsItems.length === 0 ? (
          <div className="text-center text-gray-300 py-12">
            <p className="text-xl">No news available at the moment.</p>
            <p className="text-sm mt-2">Check back soon for updates!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {newsItems.map((news) => (
              <article 
                key={news.id} 
                className="bg-black bg-opacity-60 rounded-xl overflow-hidden border border-red-500 hover:bg-opacity-70 transition-all duration-300 transform hover:scale-105"
              >
                {/* Image Section */}
                {getHeroImage(news) ? (
                  <div className="relative h-48 bg-gray-800">
                    <img 
                      src={getHeroImage(news) || ''} 
                      alt={news.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-r from-red-900 to-orange-900 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white opacity-50">No Image</span>
                  </div>
                )}
                
                {/* Content Matrix Section */}
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h2 className="text-2xl font-bold text-red-300 mb-2 sm:mb-0">{news.title}</h2>
                    <div className="flex flex-col items-start sm:items-end space-y-1">
                      <span className="text-sm text-gray-400">
                        {new Date(news.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-400">
                        By {news.author || 'ExPurged Staff'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="bg-black bg-opacity-50 p-4 rounded-lg">
                      <p className="text-gray-200 leading-relaxed line-clamp-3">
                        {news.content.replace(/<[^>]*>/g, '').substring(0, 300)}...
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <span className="px-3 py-1 bg-red-900 text-red-200 text-sm rounded-full">News</span>
                      <span className="px-3 py-1 bg-orange-900 text-orange-200 text-sm rounded-full">Guild</span>
                    </div>
                    <a
                      href={`/news/${news.id}`}
                      className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      Read More
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
