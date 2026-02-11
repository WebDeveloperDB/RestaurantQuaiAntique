<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
 
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    private ?string $email = null;

    /** @var list<string> */
    #[ORM\Column]
    private array $roles = [];

    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column(length: 255)]
    private ?string $apiToken = null;

    #[ORM\Column(length: 64, nullable: true)]
    private ?string $nom = null;

    #[ORM\Column(length: 64, nullable: true)]
    private ?string $prenom = null;

    #[ORM\Column(type: Types::SMALLINT, nullable: true)]
    private ?int $guestNumber = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $allergy = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $createdAt = null;


    /** @throws \Exception */
    public function __construct()
    {
        $this->apiToken = bin2hex(random_bytes(20));   
    }


    public function getId(): ?int                    { return $this->id; }

    public function getEmail(): ?string
    { return $this->email; }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getUserIdentifier(): string
    { return (string) $this->email; }
    /** @deprecated */

    public function getUsername(): string
     { return (string) $this->email; }

    public function getRoles(): array
    {
        $roles   = $this->roles;
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        return $this;
    }

    public function getPassword(): ?string           { return $this->password; }
    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    public function eraseCredentials(): void         { /* nothing */ }
    public function getSalt(): ?string               { return null; }

    public function getApiToken(): ?string           { return $this->apiToken; }
    public function setApiToken(string $apiToken): static
    {
        $this->apiToken = $apiToken;
        return $this;
    }

    public function getNom(): ?string                { return $this->nom; }
    public function setNom(?string $nom): static
    {
        $this->nom = $nom;
        return $this;
    }

    public function getPrenom(): ?string             { return $this->prenom; }
    public function setPrenom(?string $prenom): static
    {
        $this->prenom = $prenom;
        return $this;
    }

    public function getGuestNumber(): ?int           { return $this->guestNumber; }
    public function setGuestNumber(?int $n): static
    {
        $this->guestNumber = $n;
        return $this;
    }


    public function getAllergy(): ?string
    { return $this->allergy; }

    public function setAllergy(?string $a): static
    {
        $this->allergy = $a;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function setCreatedAt(\DateTimeImmutable $c): static
    {
        $this->createdAt = $c;
        return $this;
    }
}
