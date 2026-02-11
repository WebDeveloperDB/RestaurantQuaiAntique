<?php

namespace App\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;
use Doctrine\ODM\MongoDB\Types\Type;

#[MongoDB\Document(collection: 'menu_consultations')]
class MenuConsultation
{
    #[MongoDB\Id]
    private ?string $id = null;

    #[MongoDB\Field(type: Type::INT)]
    private int $menuId;

    #[MongoDB\Field(type: Type::STRING)]
    private string $menuName;

    #[MongoDB\Field(type: Type::INT)]
    private int $consultationCount = 0;

    #[MongoDB\Field(type: Type::DATE)]
    private \DateTime $lastConsultedAt;

    #[MongoDB\Field(type: Type::DATE)]
    private \DateTime $createdAt;

    public function __construct(int $menuId, string $menuName)
    {
        $this->menuId = $menuId;
        $this->menuName = $menuName;
        $this->consultationCount = 1;
        $this->createdAt = new \DateTime();
        $this->lastConsultedAt = new \DateTime();
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getMenuId(): int
    {
        return $this->menuId;
    }

    public function setMenuId(int $menuId): self
    {
        $this->menuId = $menuId;
        return $this;
    }

    public function getMenuName(): string
    {
        return $this->menuName;
    }

    public function setMenuName(string $menuName): self
    {
        $this->menuName = $menuName;
        return $this;
    }

    public function getConsultationCount(): int
    {
        return $this->consultationCount;
    }

    public function incrementConsultation(): self
    {
        $this->consultationCount++;
        $this->lastConsultedAt = new \DateTime();
        return $this;
    }

    public function getLastConsultedAt(): \DateTime
    {
        return $this->lastConsultedAt;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }
}
