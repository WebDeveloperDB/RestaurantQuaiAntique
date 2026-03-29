<?php

namespace App\Security;

use App\Repository\UserRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class ApiTokenAuthenticator extends AbstractAuthenticator
{
    private const PUBLIC_GET_PATTERNS = [
        '#^/api/categories(?:/\d+)?$#',
        '#^/api/foods(?:/\d+)?$#',
        '#^/api/menus(?:/\d+)?$#',
        '#^/api/pictures(?:/\d+)?$#',
        '#^/api/admin/restaurant$#',
        '#^/api/reservations/available$#',
    ];

    public function __construct(private readonly UserRepository $userRepository)
    {
    }

    public function supports(Request $request): ?bool
    {
        $path = $request->getPathInfo();
        $method = strtoupper($request->getMethod());

        if ($method === 'OPTIONS') {
            return false;
        }

        if ($path === '/api/login' || str_starts_with($path, '/api/registration') || str_starts_with($path, '/api/doc')) {
            return false;
        }

        if ($method === 'GET') {
            foreach (self::PUBLIC_GET_PATTERNS as $pattern) {
                if (preg_match($pattern, $path) === 1) {
                    return false;
                }
            }
        }

        if ($method === 'POST' && preg_match('#^/api/stats/(?:food|menu)/\d+/view$#', $path) === 1) {
            return false;
        }

        return str_starts_with($path, '/api');
    }

    public function authenticate(Request $request): Passport
    {
        $token = $this->extractToken($request);

        if (!$token) {
            throw new CustomUserMessageAuthenticationException('Missing API token');
        }

        return new SelfValidatingPassport(
            new UserBadge($token, function (string $apiToken) {
                $user = $this->userRepository->findOneBy(['apiToken' => $apiToken]);

                if (!$user) {
                    throw new CustomUserMessageAuthenticationException('Invalid API token');
                }

                return $user;
            })
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse([
            'message' => 'Authentication failed',
            'error' => $exception->getMessageKey(),
        ], Response::HTTP_UNAUTHORIZED);
    }

    private function extractToken(Request $request): ?string
    {
        $headerToken = $request->headers->get('X-AUTH-TOKEN');
        if ($headerToken) {
            return trim($headerToken);
        }

        $authHeader = $request->headers->get('Authorization');
        if (!$authHeader) {
            return null;
        }

        if (preg_match('/^Bearer\s+(.*)$/i', $authHeader, $matches) === 1) {
            return trim($matches[1]);
        }

        return null;
    }
}
