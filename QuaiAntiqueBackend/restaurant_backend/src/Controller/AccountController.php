<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[Route('/api/account')]
class AccountController extends AbstractController
{
    #[Route('', name: 'account_show', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        return $this->json([
            'email'        => $user->getEmail(),
            'firstName'    => $user->getPrenom(),
            'lastName'     => $user->getNom(),
            'guestNumber'  => $user->getGuestNumber(),
            'allergy'      => $user->getAllergy(),
            'roles'        => $user->getRoles(),
        ]);
    }

    #[Route('', name: 'account_update', methods: ['PUT'])]
    public function update(
        Request $req,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher
    ): JsonResponse {
        $data = json_decode($req->getContent(), true);
        /** @var User $user */
        $user = $this->getUser();

        // nur Felder aktualisieren, die der besucher schicken darf
        $user->setNom($data['lastName'] ?? $user->getNom());
        $user->setPrenom($data['firstName'] ?? $user->getPrenom());
        $user->setGuestNumber($data['guestNumber'] ?? $user->getGuestNumber());
        $user->setAllergy($data['allergy'] ?? $user->getAllergy());

        if (!empty($data['password'])) {
            $user->setPassword($hasher->hashPassword($user, $data['password']));
        }

        $em->flush();
        return $this->json(['message' => 'ok']);
    }

    #[Route('', name: 'account_delete', methods: ['DELETE'])]
    public function delete(EntityManagerInterface $em): JsonResponse
    {
        $em->remove($this->getUser());
        $em->flush();
        return $this->json(['message' => 'deleted']);
    }
}
