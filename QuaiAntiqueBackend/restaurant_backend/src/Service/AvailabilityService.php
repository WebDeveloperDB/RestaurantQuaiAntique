<?php

namespace App\Service;

use App\Repository\BookingRepository;
use App\Entity\Restaurant;


class AvailabilityService
{
    
    public function __construct(private BookingRepository $repo) {}

    /**
     *
     *
     * @param Restaurant
     * @param \DateTimeImmutable
     * @param int
     * @return bool
     *
     */
    public function isSlotFree(
        Restaurant $restaurant,
        \DateTimeImmutable $dateTime,
        int $wantedGuests
    ): bool {
        
        $start = $dateTime;
        $end   = $dateTime->modify('+14 minutes 59 seconds');

        
        $alreadyBooked = $this->repo->sumGuestNumberBetween($start, $end);

        
        return ($alreadyBooked + $wantedGuests) <= $restaurant->getMaxGuest();
    }
}
