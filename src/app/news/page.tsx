'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'

interface BlogPost {
  id: string
  title: string
  content: string
  author: string
  created_at: string
}

export default function News() {
  const [newsItems, setNewsItems] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching news:', error)
    } else {
      setNewsItems(data || [])
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 via-orange-900 to-black text-white pt-16">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Loading news...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-orange-900 to-black text-white pt-16">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-center text-red-400 mb-12">
          Guild News
        </h1>
        <div className="space-y-12">
          {newsItems.map((news, index) => (
            <article key={index} className="bg-black bg-opacity-50 p-8 rounded-lg border-l-4 border-red-500">
              <h2 className="text-3xl font-bold mb-4 text-red-300">{news.title}</h2>
              <div className="flex items-center mb-4 text-sm text-gray-400">
                <span>{new Date(news.created_at).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <span>By {news.author || 'Anonymous'}</span>
              </div>
              <p className="text-lg leading-relaxed">{news.content}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
