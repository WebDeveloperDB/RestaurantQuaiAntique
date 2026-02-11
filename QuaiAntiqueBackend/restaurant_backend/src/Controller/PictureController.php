<?php

namespace App\Controller;

use App\Entity\Picture;
use App\Repository\PictureRepository;
use App\Repository\RestaurantRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\String\Slugger\SluggerInterface;

#[Route('/api/pictures', name: 'api_picture_')]
class PictureController extends AbstractController
{
   
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(PictureRepository $pictureRepo): JsonResponse
    {
        $pictures = $pictureRepo->findAll();
        
        $data = array_map(function($picture) {
            return [
                'id' => $picture->getId(),
                'title' => $picture->getTitle(),
                'slug' => $picture->getSlug(),
                'url' => '/uploads/pictures/' . $picture->getSlug(),
                'createdAt' => $picture->getCreatedAt()?->format('Y-m-d H:i:s'),
                'updatedAt' => $picture->getUpdatedAt()?->format('Y-m-d H:i:s')
            ];
        }, $pictures);
        
        return $this->json($data);
    }

    
    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(Picture $picture): JsonResponse
    {
        return $this->json([
            'id' => $picture->getId(),
            'title' => $picture->getTitle(),
            'slug' => $picture->getSlug(),
            'url' => '/uploads/pictures/' . $picture->getSlug(),
            'createdAt' => $picture->getCreatedAt()?->format('Y-m-d H:i:s'),
            'updatedAt' => $picture->getUpdatedAt()?->format('Y-m-d H:i:s')
        ]);
    }

    
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        RestaurantRepository $restaurantRepo,
        SluggerInterface $slugger
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_EMPLOYE');

        $title = $request->request->get('title');
        $uploadedFile = $request->files->get('file');

      
        if (!$title || empty(trim($title))) {
            return $this->json(['error' => 'Le titre est requis'], 400);
        }

        if (!$uploadedFile) {
            return $this->json(['error' => 'Le fichier est requis'], 400);
        }

   
        $allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($uploadedFile->getMimeType(), $allowedMimeTypes)) {
            return $this->json(['error' => 'Type de fichier non autorisé. Formats acceptés: JPG, PNG, GIF, WEBP'], 400);
        }

       
        if ($uploadedFile->getSize() > 5 * 1024 * 1024) {
            return $this->json(['error' => 'Fichier trop volumineux (max 5MB)'], 400);
        }

     
        $restaurant = $restaurantRepo->findOneBy([]);
        if (!$restaurant) {
            return $this->json(['error' => 'Aucun restaurant trouvé'], 404);
        }

      
        $originalFilename = pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $slugger->slug($originalFilename);
        $extension = $uploadedFile->guessExtension();
        $newFilename = $safeFilename . '-' . uniqid() . '.' . $extension;

     
        try {
            $uploadDirectory = $this->getParameter('kernel.project_dir') . '/public/uploads/pictures';
            
          
            if (!is_dir($uploadDirectory)) {
                mkdir($uploadDirectory, 0777, true);
            }
            
            $uploadedFile->move($uploadDirectory, $newFilename);
        } catch (FileException $e) {
            return $this->json(['error' => 'Erreur lors de l\'upload: ' . $e->getMessage()], 500);
        }

        $picture = new Picture();
        $picture->setTitle(trim($title));
        $picture->setSlug($newFilename);
        $picture->setCreatedAt(new \DateTimeImmutable());
        $picture->setRestaurant($restaurant);

        $em->persist($picture);
        $em->flush();

        return $this->json([
            'id' => $picture->getId(),
            'title' => $picture->getTitle(),
            'slug' => $picture->getSlug(),
            'url' => '/uploads/pictures/' . $picture->getSlug(),
            'message' => 'Photo ajoutée avec succès'
        ], 201);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    public function update(
        Picture $picture,
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_EMPLOYE');

        $data = json_decode($request->getContent(), true);

        if (isset($data['title']) && !empty(trim($data['title']))) {
            $picture->setTitle(trim($data['title']));
            $picture->setUpdatedAt(new \DateTimeImmutable());
            
            $em->flush();
            
            return $this->json([
                'id' => $picture->getId(),
                'title' => $picture->getTitle(),
                'message' => 'Photo mise à jour avec succès'
            ]);
        }

        return $this->json(['error' => 'Le titre est requis'], 400);
    }

    
    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(
        Picture $picture,
        EntityManagerInterface $em
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_EMPLOYE');

      
        $uploadDirectory = $this->getParameter('kernel.project_dir') . '/public/uploads/pictures';
        $filePath = $uploadDirectory . '/' . $picture->getSlug();
        
        if (file_exists($filePath)) {
            unlink($filePath);
        }

      
        $em->remove($picture);
        $em->flush();

        return $this->json([
            'message' => 'Photo supprimée avec succès'
        ]);
    }
}
