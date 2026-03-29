<?php

namespace App\Controller;

use App\Entity\Category;
use App\Repository\CategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;


#[Route('/api/categories')]


class CategoryController extends AbstractController
{
    
    #[Route('', name: 'category_list', methods: ['GET'])]
    
 
    public function list(CategoryRepository $categoryRepo): JsonResponse
    {
      
        $categories = $categoryRepo->findAll();
        
       
        $data = array_map(function(Category $category) {
           
            return [
            
                'id' => $category->getId(),
                'title' => $category->getTitle(),
                
          
                'createdAt' => $category->getCreatedAt()?->format('Y-m-d H:i:s'),
                'updatedAt' => $category->getUpdatedAt()?->format('Y-m-d H:i:s'),
            ];
            
        }, $categories);
       
        return $this->json($data);
        
    }

   
    #[Route('/{id}', name: 'category_show', methods: ['GET'])]
    public function show(Category $category): JsonResponse
    {
        return $this->json([
            'id' => $category->getId(),
            'title' => $category->getTitle(),
            'createdAt' => $category->getCreatedAt()?->format('Y-m-d H:i:s'),
            'updatedAt' => $category->getUpdatedAt()?->format('Y-m-d H:i:s'),
        ]);
    }

    
    #[Route('', name: 'category_create', methods: ['POST'])]
    public function create(
        Request $request,                    
        EntityManagerInterface $em           
    ): JsonResponse {
        
       
        $this->denyAccessUnlessGranted('ROLE_EMPLOYE');

        $data = json_decode($request->getContent(), true);

      
        if (!isset($data['title']) || empty(trim($data['title']))) {
           
            return $this->json(['error' => 'Le titre est requis'], 400);
        }

       
        $category = new Category();
        
     
        $category->setTitle(trim($data['title']));
        
      
        $category->setCreatedAt(new \DateTimeImmutable());

     
        $em->persist($category);

        $em->flush();

       
        return $this->json([
            'id' => $category->getId(),
            'title' => $category->getTitle(),
            'message' => 'Catégorie créée avec succès'
        ], 201);
        
     
    }

    
    #[Route('/{id}', name: 'category_update', methods: ['PUT'])]
    public function update(
        Request $request,
        Category $category,
        EntityManagerInterface $em
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_EMPLOYE');

        $data = json_decode($request->getContent(), true);

        if (!isset($data['title']) || empty(trim($data['title']))) {
            return $this->json(['error' => 'Le titre est requis'], 400);
        }

        $category->setTitle(trim($data['title']));
        $category->setUpdatedAt(new \DateTimeImmutable());

        $em->flush();

        return $this->json([
            'id' => $category->getId(),
            'title' => $category->getTitle(),
            'message' => 'Catégorie mise à jour avec succès'
        ]);
    }

  
    #[Route('/{id}', name: 'category_delete', methods: ['DELETE'])]
    public function delete(
        Category $category,
        EntityManagerInterface $em
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_EMPLOYE');

        $em->remove($category);
        $em->flush();

        return $this->json([
            'message' => 'Catégorie supprimée avec succès'
        ]);
    }
}
