'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

interface BlogPost {
  id: string
  title: string
  content: string
  author: string
  images?: string[]
  created_at: string
}

interface Image {
  id: string
  filename: string
  url: string
  description: string
}

export default function NewsArticle() {
  const { id } = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    if (id) {
      fetchArticle()
    }
  }, [id])

  const fetchArticle = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching article:', error)
      router.push('/news')
    } else {
      // Parse images array if it's stored as JSON string
      if (data && typeof data.images === 'string') {
        try {
          data.images = JSON.parse(data.images)
        } catch (e) {
          console.error('Error parsing images:', e)
          data.images = []
        }
      }
      setArticle(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 via-orange-900 to-black text-white pt-16">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Loading article...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 via-orange-900 to-black text-white pt-16">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Article Not Found</h1>
          <button
            onClick={() => router.push('/news')}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Back to News
          </button>
        </div>
      </div>
    )
  }
//
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-orange-900 to-black text-white pt-16">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <article className="bg-black bg-opacity-50 p-8 rounded-lg border border-red-500">
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-red-300">{article.title}</h1>
            <div className="flex items-center text-sm text-gray-400">
              <span>{new Date(article.created_at).toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <span>By {article.author || 'Anonymous'}</span>
            </div>
          </header>

          {/* Associated Images */}
          {article.images && Array.isArray(article.images) && article.images.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-red-300">Gallery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {article.images.map((imageUrl: string, index: number) => (
                  <div key={index} className="bg-black bg-opacity-50 rounded-lg overflow-hidden border border-red-500">
                    <img
                      src={imageUrl}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.png'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="prose prose-lg prose-invert max-w-none">
            <div
              className="text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </article>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/news')}
            className="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 mr-4"
          >
            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to News
          </button>
        </div>
      </div>
    </div>
  );
}
