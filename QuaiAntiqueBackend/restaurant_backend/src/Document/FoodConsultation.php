<?php

namespace App\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;
use Doctrine\ODM\MongoDB\Types\Type;

#[MongoDB\Document(collection: 'food_consultations')]
class FoodConsultation
{
    #[MongoDB\Id]
    private ?string $id = null;

    #[MongoDB\Field(type: Type::INT)]
    private int $foodId;

    #[MongoDB\Field(type: Type::STRING)]
    private string $foodName;

    #[MongoDB\Field(type: Type::INT)]
    private int $consultationCount = 0;

    #[MongoDB\Field(type: Type::DATE)]
    private \DateTime $lastConsultedAt;

    #[MongoDB\Field(type: Type::DATE)]
    private \DateTime $createdAt;

    public function __construct(int $foodId, string $foodName)
    {
        $this->foodId = $foodId;
        $this->foodName = $foodName;
        $this->consultationCount = 1;
        $this->createdAt = new \DateTime();
        $this->lastConsultedAt = new \DateTime();
    }

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getFoodId(): int
    {
        return $this->foodId;
    }

    public function setFoodId(int $foodId): self
    {
        $this->foodId = $foodId;
        return $this;
    }

    public function getFoodName(): string
    {
        return $this->foodName;
    }

    public function setFoodName(string $foodName): self
    {
        $this->foodName = $foodName;
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
