<?php

namespace App\Controller;


use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;


use App\Entity\Restaurant;


#[Route('/api/admin/restaurant')]
class RestaurantSettingsController extends AbstractController
{
    
    #[Route('', methods: ['GET'])]
    public function show(EntityManagerInterface $em): JsonResponse
    {
       
        /** @var Restaurant $restaurant */
        $restaurant = $em->getRepository(Restaurant::class)->findOneBy([]);

     
        return $this->json([
            'maxGuest'        => $restaurant->getMaxGuest(),
            'amOpeningTime'   => $restaurant->getAmOpeningTime(),
            'pmOpeningTime'   => $restaurant->getPmOpeningTime(),
        ]);
    }

  
    #[Route('', methods: ['PUT'])]
    public function update(
        Request $req,
        EntityManagerInterface $em
    ): JsonResponse {
       
        $this->denyAccessUnlessGranted('ROLE_EMPLOYE');

       
        $data = json_decode($req->getContent(), true);

        
        /** @var Restaurant $restaurant */
        $restaurant = $em->getRepository(Restaurant::class)->findOneBy([]);

        
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
}
