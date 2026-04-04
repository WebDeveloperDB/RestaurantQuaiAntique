<?php
// src/Controller/ReservationController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;

use App\Entity\Booking;
use App\Entity\Restaurant;
use App\Entity\User;
use App\Repository\BookingRepository;
use App\Repository\RestaurantRepository;
use App\Service\AvailabilityService;


#[Route('/api/reservations')]
class ReservationController extends AbstractController
{
    
    #[Route('/available', methods: ['GET'])]
    public function available(
        Request             $req,
        EntityManagerInterface $em,
        RestaurantRepository $restoRepo,
        AvailabilityService  $checker
    ): JsonResponse {
       
        $dateStr   = $req->query->get('date');
        $timeStr   = $req->query->get('time');
        $guestsInt = (int) $req->query->get('guests', 1);

       
        if (!$dateStr || !$timeStr) {
            return $this->json(['error' => 'Missing date or time'], 400);
        }

     
        try {
            $slot = new \DateTimeImmutable("$dateStr $timeStr");
        } catch (\Exception $e) {
            return $this->json(['error' => 'Invalid date format'], 400);
        }

        
        $restaurant = $this->getOrCreateRestaurant($em, $restoRepo);

     
        $isFree = $checker->isSlotFree($restaurant, $slot, $guestsInt);

        return $this->json(['free' => $isFree]);
    }

 
    #[Route('', methods: ['POST'])]
    public function create(
        Request                 $req,
        EntityManagerInterface  $em,
        RestaurantRepository    $restoRepo,
        AvailabilityService     $checker
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $validated = $this->validateReservationPayload($req);
        if ($validated['status'] !== 200) {
            return $this->json($validated['body'], $validated['status']);
        }

        /** @var \DateTimeImmutable $slot */
        $slot = $validated['slot'];
        /** @var int $guests */
        $guests = $validated['guests'];
        /** @var User $user */
        $user = $validated['user'];
        $allergy = $validated['allergy'];

        $restaurant = $this->getOrCreateRestaurant($em, $restoRepo);
        if (!$checker->isSlotFree($restaurant, $slot, $guests)) {
            return $this->json(['message' => 'Complet'], 409);
        }

        $booking = (new Booking())
            ->setUser($user)
            ->setOrderDateTime($slot)
            ->setOrderDate(\DateTime::createFromImmutable($slot))
            ->setOrderHour(\DateTime::createFromImmutable($slot))
            ->setGuestNumber($guests)
            ->setAllergy($allergy)
            ->setRestaurant($restaurant);

        $em->persist($booking);
        $em->flush();

        return $this->json(['id' => $booking->getId()], 201);
    }

   
    #[Route('', methods: ['GET'])]
    public function myReservations(BookingRepository $repo): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

   
        $bookings = $repo->findBy(
            ['user' => $this->getUser()],
            ['orderDateTime' => 'ASC']
        );

       
        $result = [];
        foreach ($bookings as $booking) {
            $result[] = [
                'id' => $booking->getId(),
                'orderDateTime' => $booking->getOrderDateTime()->format('c'),
                'guestNumber' => $booking->getGuestNumber(),
                'allergy' => $booking->getAllergy(),
                'createdAt' => $booking->getCreatedAt()->format('c')
            ];
        }

        return $this->json($result);
    }

   
    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(
        int $id,
        BookingRepository $repo,
        EntityManagerInterface $em
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_USER');

      
        $booking = $repo->find($id);

       
        if (!$booking || $booking->getUser() !== $this->getUser()) {
            return $this->json(['error' => 'Not found or not authorized'], 404);
        }

       
        $em->remove($booking);
        $em->flush();

        return $this->json(['message' => 'Deleted'], 204);
    }

  
    #[Route('/{id}', methods: ['PUT'])]
    public function update(
        int $id,
        Request $req,
        BookingRepository $repo,
        EntityManagerInterface $em,
        RestaurantRepository $restoRepo,
        AvailabilityService $checker
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $booking = $repo->find($id);
        if (!$booking || $booking->getUser() !== $this->getUser()) {
            return $this->json(['error' => 'Not found'], 404);
        }

        $data = json_decode($req->getContent(), true);

        
        if (isset($data['datetime'])) {
            $newSlot = new \DateTimeImmutable($data['datetime']);
            $newGuests = $data['guestNumber'] ?? $booking->getGuestNumber();

            $restaurant = $this->getOrCreateRestaurant($em, $restoRepo);
            if (!$checker->isSlotFree($restaurant, $newSlot, $newGuests)) {
                return $this->json(['message' => 'Complet'], 409);
            }

            $booking->setOrderDateTime($newSlot);
        }

        if (isset($data['guestNumber'])) {
            $booking->setGuestNumber((int) $data['guestNumber']);
        }

        if (isset($data['allergy'])) {
            $booking->setAllergy($data['allergy']);
        }

        $booking->setUpdatedAt(new \DateTimeImmutable());
        $em->flush();

        return $this->json(['message' => 'Updated']);
    }

    private function getOrCreateRestaurant(EntityManagerInterface $em, RestaurantRepository $restoRepo): Restaurant
    {
        $restaurant = $restoRepo->findOneBy([]);
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

    /**
     * @return array{status:int, body:array<string,string>, slot?:\DateTimeImmutable, guests?:int, user?:User, allergy?:?string}
     */
    private function validateReservationPayload(Request $req): array
    {
        $data = json_decode($req->getContent(), true);
        $result = ['status' => 200, 'body' => []];

        if (!is_array($data)) {
            $result = ['status' => 400, 'body' => ['error' => 'Invalid JSON']];
        } else {
            try {
                $slot = new \DateTimeImmutable((string) ($data['datetime'] ?? ''));
            } catch (\Exception $e) {
                $slot = null;
            }

            $guests = (int) ($data['guestNumber'] ?? 0);
            $user = $this->getUser();

            if (!$slot instanceof \DateTimeImmutable) {
                $result = ['status' => 400, 'body' => ['error' => 'Invalid datetime format']];
            } elseif ($guests < 1) {
                $result = ['status' => 400, 'body' => ['error' => 'Invalid guest number']];
            } elseif (!$user instanceof User) {
                $result = ['status' => 401, 'body' => ['error' => 'Invalid authenticated user']];
            } else {
                $result = [
                    'status' => 200,
                    'body' => [],
                    'slot' => $slot,
                    'guests' => $guests,
                    'user' => $user,
                    'allergy' => $data['allergy'] ?? null,
                ];
            }
        }

        return $result;
    }
}
