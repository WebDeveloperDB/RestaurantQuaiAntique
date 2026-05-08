<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api', name: 'app_api_')]
class LoginController extends AbstractController
{
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(
        Request $request,
        UserRepository $userRepository,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $payload = json_decode($request->getContent(), true);
        if (!is_array($payload)) {
            return new JsonResponse(['message' => 'Invalid JSON payload'], Response::HTTP_BAD_REQUEST);
        }

        $email = isset($payload['email']) ? trim((string) $payload['email']) : '';
        $password = isset($payload['password']) ? (string) $payload['password'] : '';
        $status = Response::HTTP_OK;
        $data = [];

        if ($email === '' || $password === '') {
            $status = Response::HTTP_BAD_REQUEST;
            $data = ['message' => 'Email and password are required'];
        } else {
            $user = $userRepository->findOneBy(['email' => $email]);

            if (!$user || !$passwordHasher->isPasswordValid($user, $password)) {
                $status = Response::HTTP_UNAUTHORIZED;
                $data = ['message' => 'Invalid credentials'];
            } else {
                $user->setApiToken(bin2hex(random_bytes(20)));
                $entityManager->flush();

                $data = [
                    'user' => $user->getUserIdentifier(),
                    'apiToken' => $user->getApiToken(),
                    'roles' => $user->getRoles(),
                ];
            }
        }

        return new JsonResponse($data, $status);
    }
}
