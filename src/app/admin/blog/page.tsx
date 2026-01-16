'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { EditorState, convertToRaw, ContentState, convertFromHTML } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'

const Editor = dynamic(
  () => import('react-draft-wysiwyg').then(mod => mod.Editor),
  { ssr: false }
)
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

interface BlogPost {
  id: string
  title: string
  content: string
  author: string
  images?: string[]
  created_at: string
  updated_at: string
}

interface Image {
  id: string
  filename: string
  url: string
  description: string
  category: string
}

export default function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [formData, setFormData] = useState({ title: '', content: '', author: '', images: [] as string[] })
  const [editorState, setEditorState] = useState(EditorState.createEmpty())
  const [availableImages, setAvailableImages] = useState<Image[]>([])
  const [showImageSelector, setShowImageSelector] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  const onEditorStateChange = (editorState: EditorState) => {
    if (!isMounted) return
    setEditorState(editorState)
    const htmlContent = draftToHtml(convertToRaw(editorState.getCurrentContent()))
    setFormData(prev => ({ ...prev, content: htmlContent }))
  }

  const htmlToEditorState = (html: string) => {
    const blocksFromHtml = htmlToDraft(html)
    const { contentBlocks, entityMap } = blocksFromHtml
    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap)
    return EditorState.createWithContent(contentState)
  }

  useEffect(() => {
    fetchPosts()
    fetchAvailableImages()
  }, [])

  const fetchAvailableImages = async () => {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching images:', error)
    } else {
      setAvailableImages(data || [])
    }
  }

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts:', error)
    } else {
      setPosts(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          title: formData.title,
          content: formData.content,
          author: formData.author,
          images: formData.images,
          updated_at: new Date().toISOString()
        })
        .eq('id', editing.id)

      if (error) {
        console.error('Error updating post:', error)
      } else {
        setEditing(null)
        setFormData({ title: '', content: '', author: '', images: [] })
        setEditorState(EditorState.createEmpty())
        fetchPosts()
      }
    } else {
      const { error } = await supabase
        .from('blog_posts')
        .insert([{
          title: formData.title,
          content: formData.content,
          author: formData.author,
          images: formData.images
        }])

      if (error) {
        console.error('Error creating post:', error)
      } else {
        setFormData({ title: '', content: '', author: '', images: [] })
        setEditorState(EditorState.createEmpty())
        fetchPosts()
      }
    }
  }

  const handleEdit = (post: BlogPost) => {
    setEditing(post)
    setFormData({
      title: post.title,
      content: post.content,
      author: post.author,
      images: Array.isArray(post.images) ? post.images : []
    })
    setEditorState(htmlToEditorState(post.content))
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting post:', error)
      } else {
        fetchPosts()
      }
    }
  }

  const handleCancel = () => {
    setEditing(null)
    setFormData({ title: '', content: '', author: '', images: [] })
    setEditorState(EditorState.createEmpty())
    setShowImageSelector(false)
  }

  const toggleImageSelection = (imageId: string) => {
    const image = availableImages.find(img => img.id === imageId)
    if (!image) return

    setFormData(prev => ({
      ...prev,
      images: prev.images.includes(image.url)
        ? prev.images.filter(url => url !== image.url)
        : [...prev.images, image.url]
    }))
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {editing ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700">
              Author
            </label>
            <input
              type="text"
              id="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <div className="mt-1 border border-gray-300 rounded-md">
              <Editor
                editorState={editorState}
                onEditorStateChange={onEditorStateChange}
                toolbar={{
                  options: ['inline', 'blockType', 'list', 'textAlign', 'link', 'image', 'history'],
                  inline: {
                    options: ['bold', 'italic', 'underline', 'strikethrough']
                  },
                  blockType: {
                    options: ['Normal', 'H1', 'H2', 'H3']
                  },
                  list: {
                    options: ['unordered', 'ordered']
                  }
                }}
                editorStyle={{
                  minHeight: '300px',
                  padding: '10px'
                }}
              />
            </div>
          </div>

          {/* Image Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Associated Images
              </label>
              <button
                type="button"
                onClick={() => setShowImageSelector(!showImageSelector)}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                {showImageSelector ? 'Hide Images' : 'Select Images'}
              </button>
            </div>

            {formData.images.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} selected
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.images.map((imageUrl) => {
                    const image = availableImages.find(img => img.url === imageUrl)
                    return image ? (
                      <div key={imageUrl} className="flex items-center bg-indigo-100 rounded-md px-3 py-1">
                        <span className="text-sm text-indigo-800">{image.filename}</span>
                        <button
                          type="button"
                          onClick={() => toggleImageSelection(image.id)}
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
                        >
                          ×
                        </button>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )}

            {showImageSelector && (
              <div className="border border-gray-300 rounded-md p-4 max-h-96 overflow-y-auto">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Available Images</h4>
                {availableImages.length === 0 ? (
                  <p className="text-sm text-gray-500">No images available. Upload some in the Images section first.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {availableImages.map((image) => (
                      <div
                        key={image.id}
                        onClick={() => toggleImageSelection(image.id)}
                        className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-colors ${
                          formData.images.includes(image.url)
                            ? 'border-indigo-500 ring-2 ring-indigo-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={image.description}
                          className="w-full h-20 object-cover"
                        />
                        <div className="p-2">
                          <p className="text-xs font-medium text-gray-900 truncate">{image.filename}</p>
                          <p className="text-xs text-gray-500 truncate">{image.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {editing ? 'Update Post' : 'Create Post'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Blog Posts</h2>
        {posts.length === 0 ? (
          <p className="text-gray-500">No blog posts yet.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  By {post.author || 'Anonymous'} • {new Date(post.created_at).toLocaleDateString()}
                </p>
                <p className="text-gray-700 mt-2 line-clamp-3">{post.content}</p>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleEdit(post)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
