<?php

namespace App\Controller;


use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\RestaurantRepository;


use App\Entity\Restaurant;


#[Route('/api/admin/restaurant')]
class RestaurantSettingsController extends AbstractController
{
    
    #[Route('', methods: ['GET'])]
    public function show(EntityManagerInterface $em, RestaurantRepository $restaurantRepository): JsonResponse
    {
        $restaurant = $this->getOrCreateRestaurant($em, $restaurantRepository);

     
        return $this->json([
            'maxGuest'        => $restaurant->getMaxGuest(),
            'amOpeningTime'   => $restaurant->getAmOpeningTime(),
            'pmOpeningTime'   => $restaurant->getPmOpeningTime(),
        ]);
    }

  
    #[Route('', methods: ['PUT'])]
    public function update(
        Request $req,
        EntityManagerInterface $em,
        RestaurantRepository $restaurantRepository
    ): JsonResponse {
       
        $this->denyAccessUnlessGranted('ROLE_EMPLOYE');

       
        $data = json_decode($req->getContent(), true);

        
        $restaurant = $this->getOrCreateRestaurant($em, $restaurantRepository);

        
        if (isset($data['maxGuest'])) {
            $restaurant->setMaxGuest((int) $data['maxGuest']);
        }
        if (isset($data['amOpeningTime'])) {
            
            [$start,$end] = $data['amOpeningTime'];
            $restaurant->setAmOpeningTime([$start, $end]);
        }
        if (isset($data['pmOpeningTime'])) {
            [$start,$end] = $data['pmOpeningTime'];
            $restaurant->setPmOpeningTime([$start, $end]);
        }

  
        $em->flush();

    
        return $this->json(['message' => 'Paramètres enregistrés']);
    }

    private function getOrCreateRestaurant(EntityManagerInterface $em, RestaurantRepository $restaurantRepository): Restaurant
    {
        $restaurant = $restaurantRepository->findOneBy([]);
        if ($restaurant instanceof Restaurant) {
            return $restaurant;
        }

        $restaurant = (new Restaurant())
            ->setName('Quai Antique')
            ->setDescription('Configuration par defaut auto-creee en production')
            ->setMaxGuest(50)
            ->setAmOpeningTime(['12:00', '14:00'])
            ->setPmOpeningTime(['19:00', '22:00'])
            ->setCreatedAt(new \DateTimeImmutable());

        $em->persist($restaurant);
        $em->flush();

        return $restaurant;
    }
}
