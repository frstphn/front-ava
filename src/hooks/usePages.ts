import { useQuery } from '@tanstack/react-query'
import { getPages } from '../services/pagesService'

export function usePages() {
  return useQuery({
    queryKey: ['pages'],
    queryFn: getPages,
    staleTime: Infinity,
  })
}
