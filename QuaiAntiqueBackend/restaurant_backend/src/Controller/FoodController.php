<?php

namespace App\Controller;

use App\Entity\Food;
use App\Entity\FoodCategory;
use App\Entity\Category;
use App\Repository\FoodRepository;
use App\Repository\CategoryRepository;
use App\Repository\PictureRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/foods', name: 'api_food_')]
class FoodController extends AbstractController
{
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(FoodRepository $foodRepo): JsonResponse
    {
        $foods = $foodRepo->findAll();
        
        $data = array_map(function($food) {
            $categories = [];
            foreach ($food->getFoodCategories() as $foodCategory) {
                $category = $foodCategory->getCategory();
                if ($category) {
                    $categories[] = [
                        'id' => $category->getId(),
                        'title' => $category->getTitle()
                    ];
                }
            }
            
            $picture = $food->getPicture();
            return [
                'id' => $food->getId(),
                'title' => $food->getTitle(),
                'description' => $food->getDescription(),
                'price' => $food->getPrice(),
                'categories' => $categories,
                'picture' => $picture ? [
                    'id' => $picture->getId(),
                    'url' => '/uploads/pictures/' . $picture->getSlug(),
                    'title' => $picture->getTitle()
                ] : null,
                'createdAt' => $food->getCreatedAt()?->format('Y-m-d H:i:s'),
                'updatedAt' => $food->getUpdatedAt()?->format('Y-m-d H:i:s')
            ];
        }, $foods);
        
        return $this->json($data);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(Food $food): JsonResponse
    {
        $categories = [];
        foreach ($food->getFoodCategories() as $foodCategory) {
            $category = $foodCategory->getCategory();
            if ($category) {
                $categories[] = [
                    'id' => $category->getId(),
                    'title' => $category->getTitle()
                ];
            }
        }
        
        $picture = $food->getPicture();
        return $this->json([
            'id' => $food->getId(),
            'title' => $food->getTitle(),
            'description' => $food->getDescription(),
            'price' => $food->getPrice(),
            'categories' => $categories,
            'picture' => $picture ? [
                'id' => $picture->getId(),
                'url' => '/uploads/pictures/' . $picture->getSlug(),
                'title' => $picture->getTitle()
            ] : null,
            'createdAt' => $food->getCreatedAt()?->format('Y-m-d H:i:s'),
            'updatedAt' => $food->getUpdatedAt()?->format('Y-m-d H:i:s')
        ]);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        CategoryRepository $categoryRepo,
        PictureRepository $pictureRepo
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_EMPLOYE');

        $data = json_decode($request->getContent(), true);

        if (!isset($data['title']) || empty(trim($data['title']))) {
            return $this->json(['error' => 'Le titre est requis'], 400);
        }

        if (!isset($data['description']) || empty(trim($data['description']))) {
            return $this->json(['error' => 'La description est requise'], 400);
        }

        if (!isset($data['price']) || !is_numeric($data['price']) || $data['price'] < 0) {
            return $this->json(['error' => 'Le prix est requis et doit être un nombre positif'], 400);
        }

        $food = new Food();
        $food->setTitle(trim($data['title']));
        $food->setDescription(trim($data['description']));
        $food->setPrice((int)$data['price']);
        $food->setCreatedAt(new \DateTimeImmutable());

        // Associer une photo si fournie
        if (isset($data['pictureId']) && $data['pictureId']) {
            $picture = $pictureRepo->find($data['pictureId']);
            if ($picture) {
                $food->setPicture($picture);
            }
        }

        $em->persist($food);

        if (isset($data['categoryIds']) && is_array($data['categoryIds'])) {
            foreach ($data['categoryIds'] as $categoryId) {
                $category = $categoryRepo->find($categoryId);
                if ($category) {
                    $foodCategory = new FoodCategory();
                    $foodCategory->setFood($food);
                    $foodCategory->setCategory($category);
                    $em->persist($foodCategory);
                }
            }
        }

        $em->flush();

        return $this->json([
            'id' => $food->getId(),
            'title' => $food->getTitle(),
            'message' => 'Plat créé avec succès'
        ], 201);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    public function update(
        Food $food,
        Request $request,
        EntityManagerInterface $em,
        CategoryRepository $categoryRepo,
        PictureRepository $pictureRepo
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_EMPLOYE');

        $data = json_decode($request->getContent(), true);

        if (isset($data['title']) && !empty(trim($data['title']))) {
            $food->setTitle(trim($data['title']));
        }

        if (isset($data['description']) && !empty(trim($data['description']))) {
            $food->setDescription(trim($data['description']));
        }

        if (isset($data['price']) && is_numeric($data['price']) && $data['price'] >= 0) {
            $food->setPrice((int)$data['price']);
        }

        // Mettre à jour la photo si fournie
        if (isset($data['pictureId'])) {
            if ($data['pictureId']) {
                $picture = $pictureRepo->find($data['pictureId']);
                if ($picture) {
                    $food->setPicture($picture);
                }
            } else {
                $food->setPicture(null);
            }
        }

        $food->setUpdatedAt(new \DateTimeImmutable());

        if (isset($data['categoryIds'])) {
            foreach ($food->getFoodCategories() as $foodCategory) {
                $em->remove($foodCategory);
            }

            if (is_array($data['categoryIds'])) {
                foreach ($data['categoryIds'] as $categoryId) {
                    $category = $categoryRepo->find($categoryId);
                    if ($category) {
                        $foodCategory = new FoodCategory();
                        $foodCategory->setFood($food);
                        $foodCategory->setCategory($category);
                        $em->persist($foodCategory);
                    }
                }
            }
        }

        $em->flush();

        return $this->json([
            'id' => $food->getId(),
            'title' => $food->getTitle(),
            'message' => 'Plat modifié avec succès'
        ]);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(Food $food, EntityManagerInterface $em): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_EMPLOYE');

        foreach ($food->getFoodCategories() as $foodCategory) {
            $em->remove($foodCategory);
        }

        $em->remove($food);
        $em->flush();

        return $this->json([
            'message' => 'Plat supprimé avec succès'
        ]);
    }
}
