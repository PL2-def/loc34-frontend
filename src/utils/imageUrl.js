export const getFullImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf';
  if (url.startsWith('http')) return url;

  // The backend is configured to serve photos from the root /photo directory.
  // This is where 4K photos and specific project assets are stored.
  const backendUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
  
  // If the url is just a filename (no slashes), assume it's in the dedicated /photo folder
  if (!url.includes('/') && !url.includes('\\')) {
    return `${backendUrl}/photo/${url}`;
  }

  // If it's a relative path starting with /, prepend the backend URL
  if (url.startsWith('/')) {
    return `${backendUrl}${url}`;
  }

  // Default fallback for other relative paths
  return `${backendUrl}/${url}`;
};

