import { useEffect } from 'react';

export function usePageTitle(title) {
  useEffect(() => {
    const defaultTitle = 'StraySafe - Reducing Human-Stray Dog Conflicts';
    document.title = title ? `${title} | StraySafe` : defaultTitle;
    
    // Clean up when component unmounts
    return () => {
      document.title = defaultTitle;
    };
  }, [title]);
}

export default usePageTitle;
