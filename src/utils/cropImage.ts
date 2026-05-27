import type { Area } from 'react-easy-crop'

// Output size — 2x the card thumbnail display size (440×200)
const OUT_W = 440
const OUT_H = 200

export async function cropImageToFile(
  imageSrc: string,
  pixelCrop: Area,
  fileName: string = 'thumbnail.jpg',
): Promise<File> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = OUT_W
  canvas.height = OUT_H
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    OUT_W, OUT_H,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error('Canvas toBlob failed')); return }
      resolve(new File([blob], fileName, { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.92)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    img.src = src
  })
}
