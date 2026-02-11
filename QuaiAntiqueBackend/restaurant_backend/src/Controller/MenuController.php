<?php

namespace App\Controller;

use App\Entity\Menu;
use App\Repository\MenuRepository;
use App\Repository\RestaurantRepository;
use App\Repository\PictureRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/menus', name: 'api_menu_')]
class MenuController extends AbstractController
{
   
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(MenuRepository $menuRepo): JsonResponse
    {
        $menus = $menuRepo->findAll();
        
        $data = array_map(function($menu) {
            $picture = $menu->getPicture();
            return [
                'id' => $menu->getId(),
                'title' => $menu->getTitle(),
                'description' => $menu->getDescription(),
                'price' => $menu->getPrice(),
                'picture' => $picture ? [
                    'id' => $picture->getId(),
                    'url' => '/uploads/pictures/' . $picture->getSlug(),
                    'title' => $picture->getTitle()
                ] : null,
                'createdAt' => $menu->getCreatedAt()?->format('Y-m-d H:i:s'),
                'updatedAt' => $menu->getUpdatedAt()?->format('Y-m-d H:i:s')
            ];
        }, $menus);
        
        return $this->json($data);
    }

    
    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(Menu $menu): JsonResponse
    {
        $picture = $menu->getPicture();
        return $this->json([
            'id' => $menu->getId(),
            'title' => $menu->getTitle(),
            'description' => $menu->getDescription(),
            'price' => $menu->getPrice(),
            'picture' => $picture ? [
                'id' => $picture->getId(),
                'url' => '/uploads/pictures/' . $picture->getSlug(),
                'title' => $picture->getTitle()
            ] : null,
            'createdAt' => $menu->getCreatedAt()?->format('Y-m-d H:i:s'),
            'updatedAt' => $menu->getUpdatedAt()?->format('Y-m-d H:i:s')
        ]);
    }

    /**
     * POST /api/menus - Crée un nouveau menu
     */
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        RestaurantRepository $restaurantRepo,
        PictureRepository $pictureRepo
    ): JsonResponse {
        // Vérifier que l'utilisateur est un employé
        $this->denyAccessUnlessGranted('ROLE_EMPLOYE');

        $data = json_decode($request->getContent(), true);

        // Validation des données
        if (!isset($data['title']) || empty(trim($data['title']))) {
            return $this->json(['error' => 'Le titre est requis'], 400);
        }

        if (!isset($data['description']) || empty(trim($data['description']))) {
            return $this->json(['error' => 'La description est requise'], 400);
        }

        if (!isset($data['price']) || !is_numeric($data['price']) || $data['price'] < 0) {
            return $this->json(['error' => 'Le prix est requis et doit être un nombre positif'], 400);
        }

        // Récupérer le restaurant (on prend le premier pour l'instant)
        $restaurant = $restaurantRepo->findOneBy([]);
        if (!$restaurant) {
            return $this->json(['error' => 'Aucun restaurant trouvé'], 404);
        }

        // Créer le menu
        $menu = new Menu();
        $menu->setTitle(trim($data['title']));
        $menu->setDescription(trim($data['description']));
        $menu->setPrice((int)$data['price']);
        $menu->setCreatedAt(new \DateTimeImmutable());
        $menu->setRestaurant($restaurant);

        // Associer une photo si fournie
        if (isset($data['pictureId']) && $data['pictureId']) {
            $picture = $pictureRepo->find($data['pictureId']);
            if ($picture) {
                $menu->setPicture($picture);
            }
        }

        $em->persist($menu);
        $em->flush();

        return $this->json([
            'id' => $menu->getId(),
            'title' => $menu->getTitle(),
            'message' => 'Menu créé avec succès'
        ], 201);
    }


    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    public function update(
        Menu $menu,
        Request $request,
        EntityManagerInterface $em,
        PictureRepository $pictureRepo
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_EMPLOYE');

        $data = json_decode($request->getContent(), true);

        // Mise à jour des champs si fournis
        if (isset($data['title']) && !empty(trim($data['title']))) {
            $menu->setTitle(trim($data['title']));
        }

        if (isset($data['description']) && !empty(trim($data['description']))) {
            $menu->setDescription(trim($data['description']));
        }

        if (isset($data['price']) && is_numeric($data['price']) && $data['price'] >= 0) {
            $menu->setPrice((int)$data['price']);
        }

      
        if (isset($data['pictureId'])) {
            if ($data['pictureId']) {
                $picture = $pictureRepo->find($data['pictureId']);
                if ($picture) {
                    $menu->setPicture($picture);
                }
            } else {
                $menu->setPicture(null);
            }
        }

        $menu->setUpdatedAt(new \DateTimeImmutable());

        $em->flush();

        return $this->json([
            'id' => $menu->getId(),
            'title' => $menu->getTitle(),
            'message' => 'Menu mis à jour avec succès'
        ]);
    }

  
    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(
        Menu $menu,
        EntityManagerInterface $em
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_EMPLOYE');

        $em->remove($menu);
        $em->flush();

        return $this->json([
            'message' => 'Menu supprimé avec succès'
        ]);
    }
}
