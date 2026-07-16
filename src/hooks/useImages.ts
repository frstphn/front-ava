import { useQuery } from '@tanstack/react-query'
import { getImages } from '../services/imagesService'

export function useImages() {
  return useQuery({
    queryKey: ['images'],
    queryFn: getImages,
    staleTime: Infinity, // médiathèque figée le temps de la session — pas de refetch en arrière-plan
  })
}
