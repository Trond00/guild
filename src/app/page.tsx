'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import GalleryModal from '../components/GalleryModal'

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

interface AboutUsContent {
  id: string
  section_key: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export default function Home() {
  const [heroImageUrl, setHeroImageUrl] = useState('/expurgedforside.png')
  const [newsItems, setNewsItems] = useState<BlogPost[]>([])
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [aboutUsContent, setAboutUsContent] = useState<AboutUsContent | null>(null)
  
  // Gallery Modal State
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [galleryImagesForModal, setGalleryImagesForModal] = useState<string[]>([])
  const [galleryCurrentIndex, setGalleryCurrentIndex] = useState(0)
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    // Load hero image from Supabase backend
    fetchHeroImage()
    
    // Load latest news and gallery images
    fetchLatestNews()
    fetchGalleryImages()
    
    // Load About Us content
    fetchAboutUsContent()
  }, [])

  const fetchHeroImage = async () => {
    try {
      // Try to get all hero images from Supabase using is_hero column
      const { data, error } = await supabase
        .from('images')
        .select('url')
        .eq('is_hero', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching hero images from database:', error)
        // Fall back to localStorage
        const savedHeroes = localStorage.getItem('heroImages')
        if (savedHeroes) {
          try {
            const parsed = JSON.parse(savedHeroes)
            if (parsed && parsed.length > 0) {
              const randomIndex = Math.floor(Math.random() * parsed.length)
              const randomHero = parsed[randomIndex]
              console.log('Using random hero image from localStorage:', randomHero)
              setHeroImageUrl(randomHero)
              return
            }
          } catch (parseError) {
            console.error('Error parsing localStorage hero images:', parseError)
          }
        }
        // Final fallback to default
        console.log('No hero images found, using default')
        setHeroImageUrl('/expurgedforside.png')
      } else if (data && data.length > 0) {
        console.log(`Found ${data.length} hero image(s) in database`)
        // Randomly select one from the available hero images
        const randomIndex = Math.floor(Math.random() * data.length)
        const selectedHero = data[randomIndex].url
        
        // Validate the URL before setting it
        if (selectedHero && selectedHero.trim() !== '') {
          console.log('Using random hero image from database:', selectedHero)
          setHeroImageUrl(selectedHero)
        } else {
          console.log('Invalid hero image URL from database, using default')
          setHeroImageUrl('/expurgedforside.png')
        }
      } else {
        console.log('No hero images found in database, checking localStorage')
        // Fall back to localStorage
        const savedHeroes = localStorage.getItem('heroImages')
        if (savedHeroes) {
          try {
            const parsed = JSON.parse(savedHeroes)
            if (parsed && parsed.length > 0) {
              const randomIndex = Math.floor(Math.random() * parsed.length)
              const randomHero = parsed[randomIndex]
              console.log('Using random hero image from localStorage:', randomHero)
              setHeroImageUrl(randomHero)
              return
            }
          } catch (parseError) {
            console.error('Error parsing localStorage hero images:', parseError)
          }
        }
        // Final fallback to default
        console.log('No hero images found, using default')
        setHeroImageUrl('/expurgedforside.png')
      }
    } catch (error) {
      console.error('Error fetching hero images:', error)
      setHeroImageUrl('/expurgedforside.png')
    }
  }

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

  const fetchLatestNews = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2)

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
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAboutUsContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content_sections')
        .select('*')
        .eq('section_key', 'about_us')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching About Us content:', error)
      } else if (data) {
        setAboutUsContent(data)
      }
      // If no data found, we'll use the default content in the render
    } catch (error) {
      console.error('Error fetching About Us content:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-orange-900 to-black text-white">
      {/* Hero Section */}
      <section
        className="relative flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('${heroImageUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Dimming overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60"></div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-4 drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]">
              ExPurged
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Ragnaros - Horde
            </p>
            <p className="text-lg md:text-xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Dominating Azeroth
            </p>
            <div className="mt-8 space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <a
                href="https://docs.google.com/forms/d/1eHoaT2sOf0HSHT3HByKW4rKRpEPqEemOX_EvmlewQ6E/edit#response=ACYDBNj3wlkxuKdIIGsDjEGMBTHgiQMLz1RCH1zqvoCFUw6VWvD4V1XdGWYKwl35i4qyTBg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 bg-white hover:bg-gray-100 text-black font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
              >
                Join the Horde
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black bg-opacity-80">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-white-400">
            {aboutUsContent?.title || 'About Us'}
          </h2>
          <div className="bg-gradient-to-r from-red-900 to-orange-900 p-8 rounded-xl shadow-2xl">
            <p className="text-lg sm:text-xl md:text-2xl leading-relaxed text-gray-100">
              {aboutUsContent?.content || 'ExPurged is a legendary Horde guild on Ragnaros server, dedicated to conquering the greatest challenges Azeroth has to offer. From raiding the toughest dungeons to PvP glory, we stand united for the Horde\'s supremacy.'}
            </p>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-900 to-orange-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-12 text-center text-White-400">
            Latest News
          </h2>
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : newsItems.length === 0 ? (
            <div className="text-center text-gray-300 py-8">
              <p className="text-xl">No news available at the moment.</p>
              <p className="text-sm mt-2">Check back soon for updates!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {newsItems.map((news) => (
                <article 
                  key={news.id} 
                  className="bg-black bg-opacity-60 p-6 rounded-xl border-l-4 border-red-500 hover:bg-opacity-70 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-red-300">
                      {news.title}
                    </h3>
                    <span className="text-sm text-gray-400">
                      {new Date(news.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-gray-200 mb-4 line-clamp-3">
                    {news.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </div>
                  
                  {/* Associated Images Gallery */}
                  {news.images && Array.isArray(news.images) && news.images.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-lg font-bold mb-2 text-red-300">Gallery</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {news.images.slice(0, 6).map((imageUrl: string, index: number) => (
                          <div 
                            key={index} 
                            className="bg-black bg-opacity-50 rounded-lg overflow-hidden border border-red-500 cursor-pointer hover:border-red-400 transition-all duration-200 transform hover:scale-105"
                            onClick={() => {
                              setGalleryImagesForModal(news.images || [])
                              setGalleryCurrentIndex(index)
                              setIsGalleryOpen(true)
                            }}
                          >
                            <img
                              src={imageUrl}
                              alt={`Gallery image ${index + 1}`}
                              className="w-full h-24 object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-image.png'
                              }}
                            />
                          </div>
                        ))}
                        {news.images.length > 6 && (
                          <div className="bg-black bg-opacity-50 rounded-lg overflow-hidden border border-red-500 flex items-center justify-center cursor-pointer hover:border-red-400 transition-all duration-200 transform hover:scale-105">
                            <span className="text-gray-400 text-sm">
                              +{news.images.length - 6} more
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      By {news.author || 'ExPurged Staff'}
                    </span>
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
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Join ExPurged Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black bg-opacity-80">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-white-400">
            Join ExPurged
          </h2>
          <div className="bg-gradient-to-r from-orange-900 to-red-900 p-8 rounded-xl shadow-2xl mb-8">
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-100 leading-relaxed">
              We're always looking for skilled players to join our ranks. Whether you're a tank, 
              healer, DPS, or support, we have a place for you in our legendary Horde!
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {["Tank", "Healer", "DPS", "Support"].map((role) => (
                <div key={role} className="bg-black bg-opacity-50 p-4 rounded-lg border border-red-500">
                  <h3 className="text-lg font-bold text-red-300">{role}</h3>
                  <p className="text-green-400 font-semibold">Open</p>
                </div>
              ))}
            </div>

            <a
              href="https://docs.google.com/forms/d/1eHoaT2sOf0HSHT3HByKW4rKRpEPqEemOX_EvmlewQ6E/edit#response=ACYDBNj3wlkxuKdIIGsDjEGMBTHgiQMLz1RCH1zqvoCFUw6VWvD4V1XdGWYKwl35i4qyTBg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xl rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Apply Now
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-black text-center border-t border-red-500">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg mb-4 font-semibold">For the Horde!</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm">
            <a 
              href="https://www.warcraftlogs.com/guild/eu/ragnaros/expurged" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              Warcraft Logs
            </a>
            <a 
              href="https://raider.io/guilds/eu/ragnaros/Expurged" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              Raider.IO
            </a>
            <a href="#" className="text-red-400 hover:text-red-300 transition-colors">
              YouTube
            </a>
          </div>
          <p className="mt-8 text-sm text-gray-400">
            © 2024 ExPurged. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Gallery Modal */}
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={galleryImagesForModal}
        currentIndex={galleryCurrentIndex}
      />
    </div>
  )
}