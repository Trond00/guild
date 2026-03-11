'use client'

import { useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface GalleryModalProps {
  isOpen: boolean
  onClose: () => void
  images: string[]
  currentIndex: number
}

export default function GalleryModal({ isOpen, onClose, images, currentIndex }: GalleryModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setCurrentImageIndex(currentIndex)
  }, [currentIndex])

  const nextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isOpen) return

    switch (event.key) {
      case 'ArrowRight':
        nextImage()
        break
      case 'ArrowLeft':
        prevImage()
        break
      case 'Escape':
        onClose()
        break
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentImageIndex])

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleImageClick = (event: React.MouseEvent) => {
    // Only close if clicked on the image itself, not on navigation controls
    const target = event.target as HTMLElement
    if (target.tagName === 'IMG') {
      onClose()
    }
  }

  if (!images || images.length === 0) return null

  return (
    <Transition show={isOpen} as="div">
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={onClose}
        onClick={handleBackdropClick}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-90 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>

          <Transition.Child
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-black bg-opacity-95 border border-red-500 shadow-xl rounded-lg"
          >
            <div className="relative">
              {/* Close Button */}
              <button
                type="button"
                className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200 border border-red-500"
                onClick={onClose}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  {/* Previous Button */}
                  {currentImageIndex > 0 && (
                    <button
                      type="button"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-3 rounded-full transition-all duration-200 border border-red-500 hover:border-red-400 shadow-lg"
                      onClick={prevImage}
                    >
                      <ChevronLeftIcon className="h-8 w-8" />
                    </button>
                  )}

                  {/* Next Button */}
                  {currentImageIndex < images.length - 1 && (
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-3 rounded-full transition-all duration-200 border border-red-500 hover:border-red-400 shadow-lg"
                      onClick={nextImage}
                    >
                      <ChevronRightIcon className="h-8 w-8" />
                    </button>
                  )}
                </>
              )}

              {/* Image Container */}
              <div className="flex justify-center items-center min-h-[60vh] max-h-[80vh] relative">
                <div className="relative group">
                  <img
                    src={images[currentImageIndex]}
                    alt={`Gallery image ${currentImageIndex + 1}`}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl cursor-pointer"
                    onLoad={() => setIsLoading(false)}
                    onClick={handleImageClick}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-image.png'
                    }}
                  />
                  
                  {/* Loading Overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Info */}
              <div className="mt-4 flex justify-between items-center text-gray-300">
                <span className="text-sm">
                  Image {currentImageIndex + 1} of {images.length}
                </span>
                <span className="text-xs text-gray-500">
                  Press ← → to navigate, Esc to close
                </span>
              </div>

            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}